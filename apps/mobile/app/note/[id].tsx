import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall, stopResurfacing } from '@core/recall';
import { memoryTitle, plainMemoryText } from '@core/story-cue';
import type { MemoryNote } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { editingFromParam } from '@/src/navigation/route-state';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { MemoryEditor } from '@/src/ui/MemoryEditor';
import { MemoryText } from '@/src/ui/MemoryText';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

type EditorDraft = { id?: string; body: string };

function editorDraftFor(note: MemoryNote | undefined): EditorDraft {
  return { id: note?.id, body: note ? plainMemoryText(note.body) : '' };
}

function returnLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return `Comes back ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { hydrated, notes, openError, saveNote, deleteNote } = useVault();
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
  const plainBody = note ? plainMemoryText(note.body) : '';
  const dirty = Boolean(note && editing && draftState.id === note.id && draft.body !== plainBody);
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
    if (!dirty) return cancelEditingNow();
    Alert.alert('Discard changes?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: cancelEditingNow },
    ]);
  };

  const save = async () => {
    if (!note || savingRef.current || !draft.body.trim()) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const body = draft.body.trim();
      await saveNote({
        id: note.id,
        title: memoryTitle(body),
        body,
        kind: note.kind,
        folder: note.folder,
        source: note.source,
        recallPrompt: note.recallPrompt,
        recallStatus: note.recallStatus,
        lastRecalledAt: note.lastRecalledAt,
        nextRecallAt: note.nextRecallAt,
      });
      if (!mountedRef.current) return;
      setDraftState({ id: note.id, body });
      router.setParams({ edit: undefined });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  const stopReturning = async () => {
    if (!note || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await saveNote(stopResurfacing(note));
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be updated');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  const bringBackSoon = async () => {
    if (!note || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      await saveNote({
        id: note.id,
        title: note.title,
        body: note.body,
        kind: note.kind,
        folder: note.folder,
        source: note.source,
        recallPrompt: note.recallPrompt,
        recallStatus: note.recallStatus,
        lastRecalledAt: note.lastRecalledAt,
        nextRecallAt: scheduleFirstRecall(new Date(), 3),
      });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be updated');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
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
    Alert.alert('Delete this memory?', 'This permanently removes it from this device. This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void performDelete(note.id); } },
    ]);
  };

  const openActions = () => {
    if (!note || saving || deleting) return;
    Alert.alert('Memory', undefined, [
      { text: 'Share', onPress: () => { void Share.share({ title: memoryTitle(note.body), message: plainMemoryText(note.body) }); } },
      note.nextRecallAt
        ? { text: 'Stop resurfacing', onPress: () => { void stopReturning(); } }
        : { text: 'Bring back in 3 days', onPress: () => { void bringBackSoon(); } },
      { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!hydrated) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><LoadingState label="Opening memory…" /></SafeAreaView>;
  if (openError) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="Couldn't open your memories" body={openError} action={<Button label="Go back" variant="text" onPress={leaveNote} />} /></SafeAreaView>;
  if (!note) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="This memory isn't available" body="It may have been deleted." action={<Button label="Back to Library" variant="text" onPress={() => router.dismissTo('/(tabs)/files')} />} /></SafeAreaView>;

  const returns = returnLabel(note.nextRecallAt);

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      {editing ? (
        <TopAppBar
          title="Edit memory"
          left={<Button disabled={saving} label="Cancel" variant="text" onPress={cancelEditing} />}
          right={<Button disabled={saving || !draft.body.trim()} label={saving ? 'Saving…' : 'Save'} variant="text" onPress={() => { void save(); }} />}
        />
      ) : (
        <TopAppBar
          title=""
          left={<IconButton accessibilityLabel="Go back" onPress={leaveNote}><SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} /></IconButton>}
          right={<View style={styles.topActions}><Button disabled={deleting || saving} label="Edit" leading={<SymbolView name={{ ios: 'pencil', android: 'edit', web: 'edit' }} size={sizes.compactIcon} tintColor={colors.action} />} variant="text" onPress={beginEditing} /><IconButton accessibilityLabel="More memory actions" disabled={deleting || saving} onPress={openActions}><SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={sizes.standardIcon} tintColor={colors.action} /></IconButton></View>}
        />
      )}

      {editing ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.editorWrap}>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
            <MemoryEditor value={draft.body} onChangeText={(body) => setDraftState({ id: note.id, body })} accessibilityLabel="Memory" placeholder="Write what you want to keep…" autoFocus editable={!saving} minHeight={420} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.readingContent}>
          <MemoryText body={note.body} />
          <View style={styles.metaRow}>
            <SymbolView name={{ ios: returns ? 'clock' : 'archivebox', android: returns ? 'schedule' : 'inventory_2', web: returns ? 'schedule' : 'inventory_2' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
            <AppText variant="metadata" tone="secondary">{returns || 'Saved in Library'}</AppText>
          </View>
        </ScrollView>
      )}

      {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topActions: { alignItems: 'center', flexDirection: 'row' },
  editorWrap: { flex: 1 },
  editorContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  readingContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  metaRow: { alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg, paddingTop: spacing.md },
  error: { marginHorizontal: spacing.lg, marginVertical: spacing.sm },
});
