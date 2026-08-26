import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { draftForMissingLink } from '@core/links';
import type { MemoryNote } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { MarkdownBody } from '@/src/ui/MarkdownBody';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { editingFromParam } from '@/src/navigation/route-state';
import { dateInputToDate, localDateInputValue } from '@/src/navigation/local-date';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { colors, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { RecallDatePicker } from '@/src/ui/RecallDatePicker';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

type EditorDraft = {
  id?: string;
  title: string;
  body: string;
  recallDate: string;
};

function editorDraftFor(note: MemoryNote | undefined): EditorDraft {
  return {
    id: note?.id,
    title: note?.title || '',
    body: note?.body || '',
    recallDate: localDateInputValue(note?.nextRecallAt),
  };
}

function nextRecallValue(date: string, previous: string | undefined): string {
  const trimmed = date.trim();
  if (!trimmed) return '';
  if (trimmed === localDateInputValue(previous)) return previous || '';
  const parsed = dateInputToDate(trimmed);
  if (!parsed) throw new Error('Choose a valid date');
  return parsed.toISOString();
}

function returnLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return `Shows again ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { hydrated, notes, openError, saveNote, deleteNote, resolveLink } = useVault();
  const note = notes.find((item) => item.id === noteId);
  const editing = editingFromParam(params.edit);
  const [draftState, setDraftState] = useState<EditorDraft>(() => editorDraftFor(undefined));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const deletingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const draft = note && draftState.id === note.id ? draftState : editorDraftFor(note);
  const dirty = Boolean(note && editing && draftState.id === note.id && (
    draft.title !== note.title
    || draft.body !== note.body
    || draft.recallDate !== localDateInputValue(note.nextRecallAt)
  ));
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving);

  const leaveNote = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/files');
  };

  const beginEditing = () => {
    if (!note) return;
    setDraftState(editorDraftFor(note));
    setSaveError('');
    router.setParams({ edit: 'true' });
  };

  const cancelEditingNow = () => {
    setDraftState(editorDraftFor(note));
    setSaveError('');
    router.setParams({ edit: undefined });
  };

  const cancelEditing = () => {
    if (saving) return;
    if (!dirty) {
      cancelEditingNow();
      return;
    }
    Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: cancelEditingNow },
    ]);
  };

  const updateDraft = (patch: Partial<EditorDraft>) => {
    if (savingRef.current) return;
    setDraftState((current) => ({ ...(current.id === note?.id ? current : editorDraftFor(note)), ...patch, id: note?.id }));
  };

  const save = async () => {
    if (!note || savingRef.current || !draft.body.trim()) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const nextRecallAt = nextRecallValue(draft.recallDate, note.nextRecallAt);
      await saveNote({
        id: note.id,
        title: draft.title.trim() || note.title,
        body: draft.body.trim(),
        kind: note.kind,
        folder: note.folder,
        source: note.source,
        recallPrompt: note.recallPrompt,
        recallStatus: note.recallStatus,
        lastRecalledAt: note.lastRecalledAt,
        nextRecallAt,
      });
      if (!mountedRef.current) return;
      router.setParams({ edit: undefined });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  const openLink = async (target: string) => {
    if (!note || savingRef.current) return;
    setSaveError('');
    try {
      const resolution = resolveLink(target, note.id);
      if (resolution.note) {
        router.push({ pathname: '/note/[id]', params: { id: resolution.note.id } });
        return;
      }
      if (resolution.status === 'ambiguous') {
        setSaveError(`More than one memory matches “${target}”.`);
        return;
      }
      const created = await saveNote(draftForMissingLink(target, note.folder));
      if (!mountedRef.current) return;
      router.push({ pathname: '/note/[id]', params: { id: created.id, edit: 'true' } });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This link could not be opened');
    }
  };

  const performDelete = async (id: string) => {
    if (deletingRef.current || savingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    setSaveError('');
    try {
      await deleteNote(id);
      if (!mountedRef.current) return;
      allowNextNavigation();
      router.dismissTo('/(tabs)/files');
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be deleted');
    } finally {
      deletingRef.current = false;
      if (mountedRef.current) setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!note || savingRef.current || deletingRef.current) return;
    Alert.alert(
      `Delete “${note.title}”?`,
      'This permanently removes this memory from this device. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { void performDelete(note.id); } },
      ],
    );
  };

  const openActions = () => {
    if (!note || saving || deleting) return;
    Alert.alert('Memory', undefined, [
      { text: 'Share', onPress: () => { void Share.share({ title: note.title, message: `${note.title}\n\n${note.body}` }); } },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!hydrated) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><LoadingState label="Opening memory…" /></SafeAreaView>;
  }

  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
        <ErrorState title="Couldn't open your memories" body={openError} action={<Button label="Go back" variant="text" onPress={leaveNote} />} />
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
        <ErrorState title="This memory isn't available" body="It may have been moved or deleted." action={<Button label="Back to Library" variant="text" onPress={() => router.dismissTo('/(tabs)/files')} />} />
      </SafeAreaView>
    );
  }

  const returns = returnLabel(note.nextRecallAt);

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      {editing ? (
        <TopAppBar
          title="Edit"
          left={<Button disabled={saving} label="Cancel" variant="text" onPress={cancelEditing} />}
          right={<Button disabled={saving || !draft.body.trim()} label={saving ? 'Saving…' : 'Save'} variant="text" onPress={() => { void save(); }} />}
        />
      ) : (
        <TopAppBar
          title=""
          left={(
            <IconButton accessibilityLabel="Go back" onPress={leaveNote}>
              <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} />
            </IconButton>
          )}
          right={(
            <View style={styles.topActions}>
              <Button disabled={deleting || saving} label="Edit" variant="text" onPress={beginEditing} />
              <IconButton accessibilityLabel="More memory actions" disabled={deleting || saving} onPress={openActions}>
                <SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={sizes.standardIcon} tintColor={colors.action} />
              </IconButton>
            </View>
          )}
        />
      )}

      {editing ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.editorWrap}>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
            <TextInput
              accessibilityLabel="Memory title"
              editable={!saving}
              onChangeText={(title) => updateDraft({ title })}
              placeholder="Title"
              placeholderTextColor={colors.textSecondary}
              selectionColor={colors.action}
              style={styles.titleInput}
              value={draft.title}
            />

            <MarkdownEditor
              value={draft.body}
              onChangeText={(body) => updateDraft({ body })}
              accessibilityLabel="Memory"
              placeholder="Write your memory…"
              autoFocus
              editable={!saving}
              minHeight={320}
            />

            <View style={styles.returnEditor}>
              <AppText variant="section">Show me again</AppText>
              <AppText variant="supporting" tone="secondary" style={styles.returnSupport}>Change the next review date, or clear it to stop reviews.</AppText>
              <RecallDatePicker disabled={saving} onChange={(recallDate) => updateDraft({ recallDate })} value={draft.recallDate} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.readingContent}>
          <AppText accessibilityRole="header" variant="title">{note.title}</AppText>
          {note.source || returns ? (
            <AppText variant="metadata" tone="secondary" style={styles.meta}>
              {[note.source, returns].filter(Boolean).join(' · ')}
            </AppText>
          ) : null}
          <View style={styles.divider} />
          <MarkdownBody body={note.body} onLinkError={() => setSaveError('This link could not be opened safely.')} onOpenLink={(target) => { void openLink(target); }} />
        </ScrollView>
      )}

      {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topActions: { alignItems: 'center', flexDirection: 'row' },
  editorWrap: { flex: 1 },
  editorContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  titleInput: {
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    minHeight: 56,
    paddingBottom: spacing.xs,
    ...typography.title,
  },
  returnEditor: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xxl, paddingTop: spacing.lg },
  returnSupport: { marginBottom: spacing.md, marginTop: spacing.xxs },
  readingContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  meta: { marginTop: spacing.xs },
  divider: { backgroundColor: colors.divider, height: StyleSheet.hairlineWidth, marginBottom: spacing.xl, marginTop: spacing.lg },
  error: { marginHorizontal: spacing.lg, marginVertical: spacing.sm },
});
