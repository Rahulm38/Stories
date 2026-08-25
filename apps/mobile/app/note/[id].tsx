import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { colors, sharedStyles } from '@/src/ui/theme';
import { RecallDatePicker } from '@/src/ui/RecallDatePicker';
import { MEMORY_KIND_OPTIONS } from '@/src/capture/options';
import { recallCue, recallResultLabel, shortDateLabel } from '@/src/recall/presentation';

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

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const editParam = params.edit;
  const { hydrated, notes, openError, saveNote, deleteNote, suggestLinks, resolveLink } = useVault();
  const note = notes.find((item) => item.id === noteId);
  const editing = editingFromParam(editParam);
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
    if (!practiceSuccess) return;
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
    const initialDraft = editorDraftFor(note);
    setDraftState(initialDraft);
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
      await saveNote({
        ...graded,
        body: appendRecallReflection(graded.body, practiceReflection, recalledAt),
      });
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

  if (!hydrated) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}><Text style={styles.muted}>Opening note…</Text></SafeAreaView>;
  }

  if (openError) {
    return (
      <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}>
        <Text accessibilityRole="header" style={styles.missingTitle}>Your vault could not be opened</Text>
        <Text accessibilityRole="alert" style={styles.error}>{openError}</Text>
        <Pressable accessibilityRole="button" onPress={leaveNote} style={sharedStyles.quietButton}>
          <Text style={sharedStyles.quietButtonText}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!note) {
    return (
      <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}>
        <Text accessibilityRole="header" style={styles.missingTitle}>This memory isn’t available</Text>
        <Text style={styles.missingCopy}>It may have been moved or deleted.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/files')} style={sharedStyles.quietButton}>
          <Text style={sharedStyles.quietButtonText}>Back to Library</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        {editing ? (
          <Pressable accessibilityRole="button" disabled={saving} onPress={cancelEditing} style={styles.topBarAction}>
            <Text style={[styles.topBarActionText, saving && styles.disabled]}>Cancel</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityLabel="Go back" accessibilityRole="button" onPress={leaveNote} style={styles.topBarIconButton}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={21} tintColor={colors.accent} />
          </Pressable>
        )}

        <Text numberOfLines={1} style={styles.topBarTitle}>{editing ? 'Edit memory' : 'Memory'}</Text>

        {editing ? (
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void save(); }} style={styles.topBarAction}>
            <Text style={[styles.topBarActionText, saving && styles.disabled]}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        ) : (
          <View style={styles.topBarActions}>
            <Pressable
              accessibilityLabel="Share memory"
              accessibilityRole="button"
              disabled={deleting || saving}
              onPress={() => {
                void Share.share({
                  title: note.title,
                  message: `${note.title}\n\n${note.body}`,
                });
              }}
              style={styles.topBarIconButton}
            >
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={20} tintColor={colors.accent} />
            </Pressable>
            <Pressable
              accessibilityLabel="Delete memory"
              accessibilityRole="button"
              disabled={deleting}
              onPress={confirmDelete}
              style={styles.topBarIconButton}
            >
              <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={20} tintColor={colors.danger} />
            </Pressable>
            <Pressable
              accessibilityLabel="Edit memory"
              accessibilityRole="button"
              disabled={deleting || saving}
              onPress={beginEditing}
              style={styles.topBarIconButton}
            >
              <SymbolView name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }} size={20} tintColor={colors.accent} />
            </Pressable>
          </View>
        )}
      </View>

      {editing ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.editorWrap}>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
            <TextInput
              accessibilityLabel="Memory title"
              onChangeText={(title) => updateDraft({ title })}
              placeholder="Title"
              placeholderTextColor={colors.muted}
              style={styles.titleInput}
              value={draft.title}
              editable={!saving}
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

            <Pressable
              accessibilityHint={detailsExpanded ? 'Hides optional memory settings' : 'Shows memory type, source, recall cue, and recall date'}
              accessibilityLabel={`Memory details, ${editorDetailsSummary(draft)}`}
              accessibilityRole="button"
              accessibilityState={{ expanded: detailsExpanded }}
              disabled={saving}
              onPress={() => setDetailsExpanded((expanded) => !expanded)}
              style={({ pressed }) => [styles.detailsToggle, pressed && styles.detailsTogglePressed]}
            >
              <SymbolView name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} size={19} tintColor={colors.muted} />
              <View style={styles.detailsToggleCopy}>
                <Text style={styles.detailsToggleTitle}>Memory details</Text>
                <Text numberOfLines={1} style={styles.detailsToggleSummary}>
                  {editorDetailsSummary(draft)}
                </Text>
              </View>
              <SymbolView
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                name={{
                  android: detailsExpanded ? 'expand_less' : 'expand_more',
                  ios: detailsExpanded ? 'chevron.up' : 'chevron.down',
                  web: detailsExpanded ? 'expand_less' : 'expand_more',
                }}
                size={20}
                tintColor={colors.accent}
              />
            </Pressable>

            {detailsExpanded ? <View style={styles.detailsPanel}>
                <Text style={styles.fieldLabel}>Kind</Text>
                <View accessibilityRole="radiogroup" style={styles.kindRow}>
                  {MEMORY_KIND_OPTIONS.map((option) => {
                    const selected = draft.kind === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        disabled={saving}
                        onPress={() => updateDraft({ kind: option.value })}
                        style={[styles.kindButton, selected && styles.kindButtonSelected]}
                      >
                        <Text style={[styles.kindButtonText, selected && styles.kindButtonTextSelected]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>Source (optional)</Text>
                <TextInput
                  accessibilityLabel="Source"
                  editable={!saving}
                  onChangeText={(source) => updateDraft({ source })}
                  placeholder="Book, author, conversation…"
                  placeholderTextColor={colors.muted}
                  style={styles.fieldInput}
                  value={draft.source}
                />

                <Text style={styles.fieldLabel}>Recall cue (optional)</Text>
                <TextInput
                  accessibilityLabel="Recall cue"
                  editable={!saving}
                  multiline
                  onChangeText={(recallPrompt) => updateDraft({ recallPrompt })}
                  placeholder="What should bring this idea back?"
                  placeholderTextColor={colors.muted}
                  style={[styles.fieldInput, styles.cueInput]}
                  value={draft.recallPrompt}
                />

                <Text style={styles.fieldLabel}>Recall date (optional)</Text>
                <RecallDatePicker
                  disabled={saving}
                  onChange={(recallDate) => updateDraft({ recallDate })}
                  value={draft.recallDate}
                />
            </View> : null}
          </ScrollView>

          {suggestions.length > 0 ? (
            <View accessibilityRole="list" style={styles.suggestionList}>
              {suggestions.map((candidate) => (
                <Pressable
                  key={candidate.id}
                  accessibilityRole="button"
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
                  <Text style={styles.suggestionTitle}>{candidate.title}</Text>
                  <Text numberOfLines={1} style={styles.suggestionPath}>{candidate.path}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      ) : (
        <ScrollView contentContainerStyle={styles.readingContent}>
          {practiceSuccess ? (
            <View accessibilityLiveRegion="polite" style={styles.practiceSuccessRow}>
              <SymbolView name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }} size={16} tintColor={colors.green} />
              <Text style={styles.practiceSuccessText}>{practiceSuccess}</Text>
            </View>
          ) : null}

          {practiceStage === 'idle' ? (
            <>
              <Text accessibilityRole="header" style={styles.noteTitle}>{note.title}</Text>

              <View style={styles.metaHeader}>
                <Text style={styles.noteMeta}>{noteKindLabel(note)}{note.source ? ` · ${note.source}` : ''}</Text>
                <View style={styles.metaActions}>
                  {dueLabel ? (
                    <View style={styles.recallBadge}>
                      <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={13} tintColor={colors.accent} />
                      <Text style={styles.recallBadgeText}>{dueLabel}</Text>
                    </View>
                  ) : null}
                  <Pressable
                    accessibilityLabel="Practice recall now"
                    accessibilityRole="button"
                    onPress={() => { setPracticeStage('attempt'); setPracticeReflection(''); }}
                    style={styles.practiceNowButton}
                  >
                    <SymbolView name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }} size={12} tintColor={colors.onAction} />
                    <Text style={styles.practiceNowText}>Practice</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.divider} />
              <MarkdownBody
                body={note.body}
                onLinkError={() => setSaveError('This link could not be opened safely.')}
                onOpenLink={(target) => { void openLink(target); }}
              />
              <View style={styles.pathRow}>
                <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={14} tintColor={colors.muted} />
                <Text accessibilityLabel={`Stored as ${note.path}`} style={styles.pathText}>Stored locally · {note.path}</Text>
              </View>
            </>
          ) : practiceStage === 'attempt' ? (
            <View style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <SymbolView name={{ ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' }} size={22} tintColor={colors.accent} />
                <Text accessibilityRole="header" style={styles.practiceCueTitle}>{recallCue(note)}</Text>
              </View>
              <Text style={styles.practiceAttemptSupport}>Say the idea in your own words. The memory is still hidden.</Text>
              <View style={styles.practiceActions}>
                <Pressable accessibilityRole="button" onPress={() => setPracticeStage('revealed')} style={styles.practicePrimaryButton}>
                  <Text style={styles.practicePrimaryText}>Reveal memory</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => setPracticeStage('idle')} style={styles.practiceSecondaryButton}>
                  <Text style={styles.practiceSecondaryText}>Close</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.practiceCard}>
              <Text accessibilityRole="header" style={styles.practiceCueTitle}>{recallCue(note)}</Text>
              <View style={styles.divider} />
              <Text style={styles.revealedBody}>{note.body}</Text>
              <TextInput
                accessibilityLabel="Optional recall reflection"
                editable={!saving}
                onChangeText={setPracticeReflection}
                placeholder="Add a reflection (optional)"
                placeholderTextColor={colors.muted}
                style={styles.reflectionInput}
                value={practiceReflection}
              />
              <Text style={styles.ratingPrompt}>How well did you remember it?</Text>
              <View style={styles.ratingRow}>
                {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                  <Pressable
                    key={status}
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={() => { void submitPracticeRecall(status); }}
                    style={[styles.ratingButton, saving && styles.disabled]}
                  >
                    <Text style={styles.ratingText}>{recallResultLabel(status)}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable accessibilityRole="button" onPress={() => setPracticeStage('idle')} style={styles.practiceCancelRow}>
                <Text style={styles.practiceCancelText}>Cancel practice</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
      {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 16 },
  missingTitle: { color: colors.ink, fontSize: 20, fontWeight: '600', marginBottom: 10 },
  missingCopy: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 8, textAlign: 'center' },
  topBar: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 12 },
  topBarTitle: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '600', paddingHorizontal: 5, textAlign: 'center' },
  topBarAction: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 66, paddingHorizontal: 8 },
  topBarActionText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  topBarIconButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  topBarActions: { flexDirection: 'row', gap: 2 },
  editorWrap: { flex: 1 },
  editorContent: { paddingBottom: 42, paddingHorizontal: 20, paddingTop: 14 },
  titleInput: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, color: colors.ink, fontSize: 23, fontWeight: '600', minHeight: 50, paddingBottom: 9 },
  editorCanvas: { marginTop: 12 },
  detailsToggle: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 58 },
  detailsTogglePressed: { opacity: 0.62 },
  detailsToggleCopy: { flex: 1 },
  detailsToggleTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  detailsToggleSummary: { color: colors.muted, fontSize: 12, marginTop: 3 },
  detailsToggleIcon: { color: colors.accent, fontSize: 23, fontWeight: '400', lineHeight: 28, marginLeft: 8, textAlign: 'center', width: 28 },
  detailsPanel: { paddingBottom: 12 },
  fieldLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.2, marginBottom: 8, marginTop: 18 },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindButton: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 9, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  kindButtonSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  kindButtonText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  kindButtonTextSelected: { color: colors.accent },
  fieldInput: { backgroundColor: colors.surface, borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, color: colors.ink, fontSize: 16, minHeight: 48, paddingHorizontal: 13, paddingVertical: 10 },
  cueInput: { minHeight: 76, textAlignVertical: 'top' },
  suggestionList: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 11, borderWidth: 1, bottom: 14, left: 20, maxHeight: 224, overflow: 'hidden', position: 'absolute', right: 20 },
  suggestionRow: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 53, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  suggestionPath: { color: colors.muted, fontSize: 12, marginTop: 2 },
  readingContent: { paddingBottom: 40, paddingHorizontal: 20, paddingTop: 22 },
  metaHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginTop: 8 },
  noteMeta: { color: colors.muted, fontSize: 14, fontWeight: '500' },
  metaActions: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  recallBadge: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 8, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingVertical: 4 },
  recallBadgeText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  practiceNowButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 8, flexDirection: 'row', gap: 5, paddingHorizontal: 10, paddingVertical: 5 },
  practiceNowText: { color: colors.onAction, fontSize: 12, fontWeight: '600' },
  practiceSuccessRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.green, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 8, marginBottom: 14, paddingHorizontal: 12, paddingVertical: 8 },
  practiceSuccessText: { color: colors.green, fontSize: 13, fontWeight: '600' },
  practiceCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: 18 },
  practiceHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  practiceCueTitle: { color: colors.ink, flex: 1, fontSize: 18, fontWeight: '600', lineHeight: 24 },
  practiceAttemptSupport: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 12 },
  practiceActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  practicePrimaryButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 10, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  practicePrimaryText: { color: colors.onAction, fontSize: 15, fontWeight: '600' },
  practiceSecondaryButton: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  practiceSecondaryText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  revealedBody: { color: colors.ink, fontSize: 16, lineHeight: 25 },
  reflectionInput: { borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, color: colors.ink, fontSize: 15, lineHeight: 21, minHeight: 46, marginTop: 16, paddingHorizontal: 12, paddingVertical: 10 },
  ratingPrompt: { color: colors.muted, fontSize: 13, fontWeight: '600', marginTop: 16 },
  ratingRow: { flexDirection: 'row', gap: 7, marginTop: 10 },
  ratingButton: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 6 },
  ratingText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  practiceCancelRow: { alignItems: 'center', justifyContent: 'center', marginTop: 14, paddingVertical: 6 },
  practiceCancelText: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  pathRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 7, marginTop: 28, paddingTop: 14 },
  pathText: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 17 },
  noteTitle: { color: colors.ink, fontSize: 27, fontWeight: '600', letterSpacing: -0.35, lineHeight: 34 },
  divider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginBottom: 23, marginTop: 20 },
  disabled: { opacity: 0.35 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, paddingHorizontal: 20, paddingVertical: 10 },
});
