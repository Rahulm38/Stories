import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activeWikilinkAtCursor, draftForMissingLink, insertWikilink } from '@core/links';
import type { MemoryKind, MemoryNote } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { MarkdownBody, noteKindLabel } from '@/src/ui/MarkdownBody';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { editingFromParam } from '@/src/navigation/route-state';
import { folderForKind } from '@/src/navigation/note-folder';
import { localDateInputValue } from '@/src/navigation/local-date';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { colors, sharedStyles } from '@/src/ui/theme';
import { MEMORY_KIND_OPTIONS } from '@/src/capture/options';

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) throw new Error('Use YYYY-MM-DD for the recall date');

  const parsed = new Date(`${trimmed}T09:00:00`);
  const [year, month, day] = trimmed.split('-').map(Number);
  if (
    Number.isNaN(parsed.getTime())
    || parsed.getFullYear() !== year
    || parsed.getMonth() + 1 !== month
    || parsed.getDate() !== day
  ) {
    throw new Error('Enter a valid recall date');
  }
  return parsed.toISOString();
}

export default function NoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; edit?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const editParam = params.edit;
  const { hydrated, notes, openError, saveNote, suggestLinks, resolveLink } = useVault();
  const note = notes.find((item) => item.id === noteId);
  const editing = editingFromParam(editParam);
  const [draftState, setDraftState] = useState<EditorDraft>(() => editorDraftFor(undefined));
  const [cursor, setCursor] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [now, setNow] = useState(() => new Date());
  const bodyRef = useRef<TextInput>(null);
  const openingLinkRef = useRef(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const draft = note && draftState.id === note.id ? draftState : editorDraftFor(note);
  const dirty = Boolean(note && editing && draftState.id === note.id && (
    draft.title !== note.title
    || draft.body !== note.body
    || draft.kind !== note.kind
    || draft.source !== (note.source || '')
    || draft.recallPrompt !== (note.recallPrompt || '')
    || draft.recallDate !== localDateInputValue(note.nextRecallAt)
  ));
  useUnsavedChangesGuard(dirty, saving);
  const activeLink = editing ? activeWikilinkAtCursor(draft.body, cursor) : null;
  const suggestions = activeLink ? suggestLinks(activeLink.query, note?.id) : [];
  const dueLabel = recallLabel(note?.nextRecallAt, now.getTime());

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []));

  const beginEditing = () => {
    if (!note) return;
    const initialDraft = editorDraftFor(note);
    setDraftState(initialDraft);
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

  if (!hydrated) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}><Text style={styles.muted}>Opening note…</Text></SafeAreaView>;
  }

  if (openError) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}><Text accessibilityRole="alert" style={styles.error}>{openError}</Text></SafeAreaView>;
  }

  if (!note) {
    return (
      <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top', 'bottom']}>
        <Text style={styles.missingTitle}>File not found</Text>
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
          <Pressable accessibilityLabel="Back to Library" accessibilityRole="button" onPress={() => router.dismissTo('/(tabs)/files')} style={styles.topBarIconButton}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={21} tintColor={colors.accent} />
          </Pressable>
        )}

        <Text numberOfLines={1} style={styles.topBarTitle}>{editing ? 'Edit note' : 'Note'}</Text>

        {editing ? (
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void save(); }} style={styles.topBarAction}>
            <Text style={[styles.topBarActionText, saving && styles.disabled]}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityLabel="Edit note" accessibilityRole="button" onPress={beginEditing} style={styles.topBarIconButton}>
            <SymbolView name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }} size={20} tintColor={colors.accent} />
          </Pressable>
        )}
      </View>

      {editing ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.editorWrap}>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">
            <TextInput
              accessibilityLabel="Note title"
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
                accessibilityLabel="Note body"
                placeholder="Write in Markdown…"
                autoFocus
                editable={!saving}
                minHeight={360}
                onSelectionChange={(selection) => setCursor(selection.start)}
              />
            </View>

            <View
              accessibilityRole="header"
              style={styles.detailsToggle}
            >
              <SymbolView name={{ ios: 'slider.horizontal.3', android: 'tune', web: 'tune' }} size={19} tintColor={colors.muted} />
              <View style={styles.detailsToggleCopy}>
                <Text style={styles.detailsToggleTitle}>Memory details</Text>
                <Text numberOfLines={1} style={styles.detailsToggleSummary}>
                  {noteKindLabel({ kind: draft.kind })}{draft.source ? ` · ${draft.source}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.detailsPanel}>
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
                <TextInput
                  accessibilityLabel="Recall date"
                  autoCapitalize="none"
                  editable={!saving}
                  keyboardType="numbers-and-punctuation"
                  maxLength={10}
                  onChangeText={(recallDate) => updateDraft({ recallDate })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  style={styles.fieldInput}
                  value={draft.recallDate}
                />
            </View>
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
          <View style={styles.pathRow}>
            <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={14} tintColor={colors.muted} />
            <Text numberOfLines={2} style={styles.pathText}>{note.path}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.noteTitle}>{note.title}</Text>
          <Text style={styles.noteMeta}>{noteKindLabel(note)} · {note.folder}</Text>

          {note.source ? (
            <View style={styles.infoRow}>
              <SymbolView name={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }} size={16} tintColor={colors.muted} />
              <Text style={styles.infoText}>{note.source}</Text>
            </View>
          ) : null}

          {dueLabel ? (
            <View style={styles.recallRow}>
              <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={15} tintColor={colors.accent} />
              <Text style={styles.recallText}>{dueLabel}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />
          <MarkdownBody body={note.body} onOpenLink={(target) => { void openLink(target); }} />
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
  topBar: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', minHeight: 54, paddingHorizontal: 12 },
  topBarTitle: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '600', paddingHorizontal: 5, textAlign: 'center' },
  topBarAction: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 66, paddingHorizontal: 8 },
  topBarActionText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  topBarIconButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, minWidth: 44 },
  editorWrap: { flex: 1 },
  editorContent: { paddingBottom: 42, paddingHorizontal: 20, paddingTop: 14 },
  titleInput: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, color: colors.ink, fontSize: 23, fontWeight: '600', minHeight: 50, paddingBottom: 9 },
  editorCanvas: { marginTop: 12 },
  detailsToggle: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 58 },
  detailsToggleCopy: { flex: 1 },
  detailsToggleTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  detailsToggleSummary: { color: colors.muted, fontSize: 12, marginTop: 3 },
  detailsPanel: { paddingBottom: 12 },
  fieldLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.2, marginBottom: 8, marginTop: 18 },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 9, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  kindButtonSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  kindButtonText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  kindButtonTextSelected: { color: colors.accent },
  fieldInput: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 10, borderWidth: 1, color: colors.ink, fontSize: 16, minHeight: 48, paddingHorizontal: 13, paddingVertical: 10 },
  cueInput: { minHeight: 76, textAlignVertical: 'top' },
  suggestionList: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 11, borderWidth: 1, bottom: 14, left: 20, maxHeight: 224, overflow: 'hidden', position: 'absolute', right: 20 },
  suggestionRow: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, minHeight: 53, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  suggestionPath: { color: colors.muted, fontSize: 12, marginTop: 2 },
  readingContent: { paddingBottom: 40, paddingHorizontal: 20, paddingTop: 22 },
  pathRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginBottom: 12 },
  pathText: { color: colors.muted, flex: 1, fontSize: 12, lineHeight: 17 },
  noteTitle: { color: colors.ink, fontSize: 27, fontWeight: '600', letterSpacing: -0.35, lineHeight: 34 },
  noteMeta: { color: colors.muted, fontSize: 13, marginTop: 7 },
  infoRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14 },
  infoText: { color: colors.muted, flex: 1, fontSize: 14, lineHeight: 20 },
  recallRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 13 },
  recallText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  divider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginBottom: 23, marginTop: 20 },
  disabled: { opacity: 0.35 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, paddingHorizontal: 20, paddingVertical: 10 },
});
