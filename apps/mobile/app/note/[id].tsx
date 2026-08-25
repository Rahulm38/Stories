import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activeWikilinkAtCursor, draftForMissingLink, insertWikilink } from '@core/links';
import { appendRecallReflection, gradeRecall } from '@core/recall';
import type { MemoryKind, MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { MarkdownBody, noteKindLabel } from '@/src/ui/MarkdownBody';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { editingFromParam } from '@/src/navigation/route-state';
import { folderForKind } from '@/src/navigation/note-folder';
import { dateInputToDate, localDateInputValue } from '@/src/navigation/local-date';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { colors, radii, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { RecallDatePicker } from '@/src/ui/RecallDatePicker';
import { MEMORY_KIND_OPTIONS } from '@/src/capture/options';
import { recallCue, shortDateLabel } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { DisclosureRow } from '@/src/ui/components/DisclosureRow';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { SegmentedControl } from '@/src/ui/components/SegmentedControl';
import { StatusMessage } from '@/src/ui/components/StatusMessage';
import { TextField } from '@/src/ui/components/TextField';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

type EditorDraft = {
  id?: string;
  title: string;
  body: string;
  kind: MemoryKind;
  source: string;
  recallPrompt: string;
  recallDate: string;
};

function editorDraftFor(note: MemoryNote | undefined): EditorDraft {
  return {
    id: note?.id,
    title: note?.title || '',
    body: note?.body || '',
    kind: note?.kind || 'note',
    source: note?.source || '',
    recallPrompt: note?.recallPrompt || '',
    recallDate: localDateInputValue(note?.nextRecallAt),
  };
}

function recallLabel(value: string | undefined, openedAt: number): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const formatted = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  return date.getTime() <= openedAt ? `Recall due · ${formatted}` : `Recall · ${formatted}`;
}

function nextRecallValue(date: string, previous: string | undefined): string {
  const trimmed = date.trim();
  if (!trimmed) return '';
  if (trimmed === localDateInputValue(previous)) return previous || '';
  const parsed = dateInputToDate(trimmed);
  if (!parsed) throw new Error('Enter a valid recall date');
  return parsed.toISOString();
}

function editorDetailsSummary(draft: EditorDraft): string {
  const kind = noteKindLabel({ kind: draft.kind });
  const value = draft.recallDate.trim();
  if (!value) return `${kind} · No recall set`;
  const parsed = dateInputToDate(value);
  if (!parsed) return `${kind} · Recall ${value}`;
  return `${kind} · Recall ${parsed.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

function ratingLabel(status: RecallStatus) {
  if (status === 'forgot') return 'Forgot';
  if (status === 'partial') return 'Almost';
  return 'Got it';
}

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { hydrated, notes, openError, saveNote, deleteNote, suggestLinks, resolveLink } = useVault();
  const note = notes.find((item) => item.id === noteId);
  const editing = editingFromParam(params.edit);
  const [draftState, setDraftState] = useState<EditorDraft>(() => editorDraftFor(undefined));
  const [cursor, setCursor] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [practiceStage, setPracticeStage] = useState<'idle' | 'attempt' | 'revealed'>('idle');
  const [practiceReflection, setPracticeReflection] = useState('');
  const [practiceSuccess, setPracticeSuccess] = useState('');
  const [now, setNow] = useState(() => new Date());
  const bodyRef = useRef<TextInput>(null);
  const openingLinkRef = useRef(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const deletingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!practiceSuccess) return undefined;
    const timer = setTimeout(() => {
      if (mountedRef.current) setPracticeSuccess('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [practiceSuccess]);

  const draft = note && draftState.id === note.id ? draftState : editorDraftFor(note);
  const dirty = Boolean(note && editing && draftState.id === note.id && (
    draft.title !== note.title
    || draft.body !== note.body
    || draft.kind !== note.kind
    || draft.source !== (note.source || '')
    || draft.recallPrompt !== (note.recallPrompt || '')
    || draft.recallDate !== localDateInputValue(note.nextRecallAt)
  ));
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving);
  const activeLink = editing ? activeWikilinkAtCursor(draft.body, cursor) : null;
  const suggestions = activeLink ? suggestLinks(activeLink.query, note?.id) : [];
  const dueLabel = recallLabel(note?.nextRecallAt, now.getTime());

  const leaveNote = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/files');
  };

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []));

  const beginEditing = () => {
    if (!note) return;
    setPracticeStage('idle');
    setPracticeReflection('');
    setPracticeSuccess('');
    setDraftState(editorDraftFor(note));
    setDetailsExpanded(false);
    setSaveError('');
    router.setParams({ edit: 'true' });
  };

  const cancelEditingNow = () => {
    setDraftState(editorDraftFor(note));
    setDetailsExpanded(false);
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
    if (!note || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    try {
      const nextRecallAt = nextRecallValue(draft.recallDate, note.nextRecallAt);
      const baseline = editorDraftFor(note);
      const kindChanged = draft.kind !== baseline.kind;
      await saveNote({
        id: note.id,
        ...(draft.title !== baseline.title ? { title: draft.title } : {}),
        body: draft.body,
        ...(kindChanged ? { folder: folderForKind(draft.kind, note), kind: draft.kind } : {}),
        ...(draft.source !== baseline.source ? { source: draft.source.trim() } : {}),
        ...(draft.recallPrompt !== baseline.recallPrompt ? { recallPrompt: draft.recallPrompt.trim() } : {}),
        ...(draft.recallDate !== baseline.recallDate ? { nextRecallAt } : {}),
      });
      if (!mountedRef.current) return;
      setDetailsExpanded(false);
      router.setParams({ edit: undefined });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This file could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  const openLink = async (target: string) => {
    if (!note || openingLinkRef.current) return;
    if (!target.trim()) {
      setSaveError('This link has no target.');
      return;
    }
    openingLinkRef.current = true;
    setSaveError('');
    try {
      const resolution = resolveLink(target, note.id);
      if (resolution.note) {
        router.push({ pathname: '/note/[id]', params: { id: resolution.note.id } });
        return;
      }
      if (resolution.status === 'ambiguous') {
        setSaveError(`More than one file matches “${target}”. Use a folder-qualified link.`);
        return;
      }
      const created = await saveNote(draftForMissingLink(target, note.folder));
      if (!mountedRef.current) return;
      router.push({ pathname: '/note/[id]', params: { id: created.id, edit: 'true' } });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'The linked file could not be created');
    } finally {
      openingLinkRef.current = false;
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

  const submitPracticeRecall = async (status: RecallStatus) => {
    if (!note || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError('');
    const recalledAt = new Date();
    const graded = gradeRecall(note, status, recalledAt);
    try {
      await saveNote({ ...graded, body: appendRecallReflection(graded.body, practiceReflection, recalledAt) });
      if (!mountedRef.current) return;
      setPracticeStage('idle');
      setPracticeReflection('');
      const returnDate = shortDateLabel(graded.nextRecallAt!);
      setPracticeSuccess(`Practiced.${returnDate ? ` Returns on ${returnDate}.` : ''}`);
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'Recall could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!note || savingRef.current || deletingRef.current) return;
    Alert.alert(
      `Delete “${note.title}”?`,
      'This permanently removes this memory from this device. This can’t be undone.',
      [
        { text: 'Keep memory', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => { void performDelete(note.id); } },
      ],
    );
  };

  const openActions = () => {
    if (!note || saving || deleting) return;
    Alert.alert('Memory actions', undefined, [
      { text: 'Share', onPress: () => { void Share.share({ title: note.title, message: `${note.title}\n\n${note.body}` }); } },
      { text: 'Delete memory', style: 'destructive', onPress: confirmDelete },
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

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      {editing ? (
        <TopAppBar
          title="Edit memory"
          left={<Button disabled={saving} label="Cancel" variant="text" onPress={cancelEditing} />}
          right={<Button disabled={saving} label={saving ? 'Saving…' : 'Save'} variant="text" onPress={() => { void save(); }} />}
        />
      ) : (
        <TopAppBar
          title="Memory"
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

            <View style={styles.editorCanvas}>
              <MarkdownEditor
                ref={bodyRef}
                value={draft.body}
                onChangeText={(body) => updateDraft({ body })}
                accessibilityLabel="Memory body"
                placeholder="Write in Markdown…"
                autoFocus
                editable={!saving}
                minHeight={360}
                onSelectionChange={(selection) => setCursor(selection.start)}
              />
            </View>

            <View style={styles.detailsFrame}>
              <DisclosureRow
                accessibilityHint={detailsExpanded ? 'Hides optional memory settings' : 'Shows memory type, source, recall cue, and recall date'}
                accessibilityLabel={`Memory details, ${editorDetailsSummary(draft)}`}
                accessibilityState={{ expanded: detailsExpanded }}
                disabled={saving}
                onPress={() => setDetailsExpanded((expanded) => !expanded)}
                title="Memory details"
                summary={editorDetailsSummary(draft)}
                leading={<SymbolView name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} size={sizes.compactIcon} tintColor={colors.action} />}
                trailing={<SymbolView name={{ android: detailsExpanded ? 'expand_less' : 'expand_more', ios: detailsExpanded ? 'chevron.up' : 'chevron.down', web: detailsExpanded ? 'expand_less' : 'expand_more' }} size={sizes.compactIcon} tintColor={colors.action} />}
              />

              {detailsExpanded ? (
                <View style={styles.detailsPanel}>
                  <FieldLabel>Kind</FieldLabel>
                  <SegmentedControl accessibilityLabel="Memory kind" disabled={saving} onChange={(kind) => updateDraft({ kind })} options={MEMORY_KIND_OPTIONS} value={draft.kind} />

                  <View style={styles.detailField}>
                    <FieldLabel optional>Source</FieldLabel>
                    <TextField accessibilityLabel="Source" editable={!saving} onChangeText={(source) => updateDraft({ source })} placeholder="Book, author, conversation…" value={draft.source} />
                  </View>

                  <View style={styles.detailField}>
                    <FieldLabel optional>Recall cue</FieldLabel>
                    <TextField accessibilityLabel="Recall cue" editable={!saving} multiline onChangeText={(recallPrompt) => updateDraft({ recallPrompt })} placeholder="What should bring this idea back?" style={styles.cueInput} value={draft.recallPrompt} />
                  </View>

                  <View style={styles.detailField}>
                    <FieldLabel optional>Recall date</FieldLabel>
                    <RecallDatePicker disabled={saving} onChange={(recallDate) => updateDraft({ recallDate })} value={draft.recallDate} />
                  </View>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {suggestions.length > 0 ? (
            <View accessibilityRole="list" style={styles.suggestionList}>
              {suggestions.map((candidate) => (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="button"
                  android_ripple={{ color: colors.actionMuted }}
                  disabled={saving}
                  onPress={() => {
                    if (!activeLink) return;
                    const next = insertWikilink(draft.body, activeLink, candidate, notes);
                    updateDraft({ body: next.value });
                    setCursor(next.cursor);
                    requestAnimationFrame(() => {
                      const input = bodyRef.current;
                      input?.focus();
                      if (!input) return;
                      if (Platform.OS === 'web') {
                        (input as TextInput & { setSelectionRange?: (start: number, end: number) => void }).setSelectionRange?.(next.cursor, next.cursor);
                      } else {
                        input.setNativeProps({ selection: { start: next.cursor, end: next.cursor } });
                      }
                    });
                  }}
                  style={styles.suggestionRow}
                >
                  <AppText variant="action">{candidate.title}</AppText>
                  <AppText numberOfLines={1} variant="metadata" tone="secondary" style={styles.suggestionPath}>{candidate.path}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.readingContent}>
          {practiceSuccess ? <StatusMessage message={practiceSuccess} tone="success" /> : null}

          {practiceStage === 'idle' ? (
            <>
              <AppText accessibilityRole="header" variant="title" style={styles.noteTitle}>{note.title}</AppText>
              <View style={styles.metaHeader}>
                <View style={styles.metaCopy}>
                  <AppText variant="supporting" tone="secondary">{noteKindLabel(note)}{note.source ? ` · ${note.source}` : ''}</AppText>
                  {dueLabel ? <AppText variant="metadata" tone="action" style={styles.dueLabel}>{dueLabel}</AppText> : null}
                </View>
                <Button label="Practice" variant="secondary" onPress={() => { setPracticeStage('attempt'); setPracticeReflection(''); }} />
              </View>

              <View style={styles.divider} />
              <MarkdownBody body={note.body} onLinkError={() => setSaveError('This link could not be opened safely.')} onOpenLink={(target) => { void openLink(target); }} />
              <View style={styles.pathRow}>
                <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={18} tintColor={colors.textSecondary} />
                <AppText accessibilityLabel={`Stored as ${note.path}`} variant="metadata" tone="secondary" style={styles.pathText}>Stored locally · {note.path}</AppText>
              </View>
            </>
          ) : practiceStage === 'attempt' ? (
            <Card>
              <View style={styles.practiceHeader}>
                <SymbolView name={{ ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' }} size={sizes.standardIcon} tintColor={colors.action} />
                <AppText accessibilityRole="header" variant="section" style={styles.practiceTitle}>{recallCue(note)}</AppText>
              </View>
              <AppText variant="supporting" tone="secondary" style={styles.practiceSupport}>Try saying it in your own words. The memory is still hidden.</AppText>
              <View style={styles.practiceActions}>
                <Button label="Reveal memory" onPress={() => setPracticeStage('revealed')} style={styles.flexButton} />
                <Button label="Close" variant="text" onPress={() => setPracticeStage('idle')} />
              </View>
            </Card>
          ) : (
            <Card>
              <AppText accessibilityRole="header" variant="section">{recallCue(note)}</AppText>
              <View style={styles.divider} />
              <AppText variant="body">{note.body}</AppText>
              <TextField accessibilityLabel="Optional recall reflection" editable={!saving} multiline onChangeText={setPracticeReflection} placeholder="Add a reflection (optional)" style={styles.reflectionInput} value={practiceReflection} />
              <AppText variant="supporting" style={styles.ratingPrompt}>How well did you remember it?</AppText>
              <View style={styles.ratingRow}>
                {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                  <Button key={status} disabled={saving} label={ratingLabel(status)} onPress={() => { void submitPracticeRecall(status); }} style={styles.ratingButton} variant="secondary" />
                ))}
              </View>
              <Button label="Cancel practice" variant="text" onPress={() => setPracticeStage('idle')} style={styles.cancelPractice} />
            </Card>
          )}
        </ScrollView>
      )}
      {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
    </SafeAreaView>
  );
}

function FieldLabel({ children, optional = false }: { children: string; optional?: boolean }) {
  return (
    <AppText variant="metadata" style={styles.fieldLabel}>
      {children}{optional ? <AppText variant="metadata" tone="secondary"> · Optional</AppText> : null}
    </AppText>
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
    minHeight: 56,
    paddingBottom: spacing.xs,
    ...typography.title,
  },
  editorCanvas: { marginTop: spacing.sm },
  detailsFrame: {
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xl,
  },
  detailsPanel: { paddingBottom: spacing.lg, paddingTop: spacing.xs },
  detailField: { marginTop: spacing.lg },
  fieldLabel: { fontWeight: '600', marginBottom: spacing.xs },
  cueInput: { minHeight: 88, textAlignVertical: 'top' },
  suggestionList: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
    borderRadius: radii.control,
    borderWidth: 1,
    bottom: spacing.md,
    left: spacing.lg,
    maxHeight: 224,
    overflow: 'hidden',
    position: 'absolute',
    right: spacing.lg,
  },
  suggestionRow: { borderBottomColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: sizes.rowMinimum, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  suggestionPath: { marginTop: spacing.xxs },
  readingContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  noteTitle: { marginTop: spacing.xs },
  metaHeader: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.sm },
  metaCopy: { flex: 1 },
  dueLabel: { fontWeight: '600', marginTop: spacing.xxs },
  divider: { backgroundColor: colors.divider, height: StyleSheet.hairlineWidth, marginBottom: spacing.xl, marginTop: spacing.lg },
  pathRow: { alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xxl, paddingTop: spacing.md },
  pathText: { flex: 1 },
  practiceHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  practiceTitle: { flex: 1 },
  practiceSupport: { marginTop: spacing.sm },
  practiceActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  flexButton: { flex: 1 },
  reflectionInput: { marginTop: spacing.md, minHeight: 88, textAlignVertical: 'top' },
  ratingPrompt: { fontWeight: '600', marginTop: spacing.md },
  ratingRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  ratingButton: { flex: 1, paddingHorizontal: spacing.xs },
  cancelPractice: { marginTop: spacing.xs },
  error: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
});
