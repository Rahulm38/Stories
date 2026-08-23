import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall } from '@core/recall';
import type { MemoryKind } from '@core/model';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { captureKindFromParam } from '@/src/navigation/route-state';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles } from '@/src/ui/theme';

type RecallChoice = 'off' | 'three-days' | 'week';

const kindOptions: Array<{ kind: MemoryKind; label: string }> = [
  { kind: 'note', label: 'Note' },
  { kind: 'book-learning', label: 'Book learning' },
  { kind: 'experience', label: 'Experience' },
];

const recallOptions: Array<{ label: string; value: RecallChoice }> = [
  { label: '3 days', value: 'three-days' },
  { label: '1 week', value: 'week' },
  { label: 'Off', value: 'off' },
];

export default function CaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string | string[] }>();
  const kind = captureKindFromParam(params.kind);
  const { hydrated, openError, saveNote } = useVault();
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState('');
  const [recallChoice, setRecallChoice] = useState<RecallChoice>('three-days');
  const [recallPrompt, setRecallPrompt] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const mountedRef = useRef(true);
  const savingRef = useRef(false);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const dirty = Boolean(draft.trim() || source.trim() || recallPrompt.trim());
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving);

  const leaveCapture = useCallback(() => {
    if (Platform.OS !== 'web' && router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [router]);

  const save = async () => {
    const body = draft;
    if (!hydrated || !body.trim() || savingRef.current) return;
    savingRef.current = true;
    const recallDays = recallChoice === 'three-days' ? 3 : recallChoice === 'week' ? 7 : undefined;
    setSaving(true);
    setSaveError('');
    try {
      await saveNote({
        body,
        kind,
        folder: kind === 'book-learning' ? 'Books' : kind === 'experience' ? 'Experiences' : 'Inbox',
        source: kind === 'note' ? undefined : source.trim() || undefined,
        nextRecallAt: recallDays ? scheduleFirstRecall(new Date(), recallDays) : undefined,
        recallPrompt: recallDays ? recallPrompt.trim() || undefined : undefined,
      });
      if (mountedRef.current) {
        allowNextNavigation();
        leaveCapture();
      }
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  if (openError) {
    return <SafeAreaView style={[sharedStyles.screen, styles.errorScreen]} edges={['top']}><Text accessibilityRole="alert" style={styles.error}>{openError}</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <Text accessibilityRole="header" style={styles.topBarTitle}>New memory</Text>
          </View>

          <Text style={styles.editorLabel}>What do you want to remember?</Text>
          <MarkdownEditor
            value={draft}
            onChangeText={(value) => { if (!savingRef.current) setDraft(value); }}
            accessibilityLabel="Memory"
            placeholder="Write what you want to remember…"
            autoFocus
            editable={!saving}
            minHeight={260}
          />

          <View style={styles.detailsPanel}>
            <View style={styles.detailsHeading}>
              <SymbolView name={{ android: 'tune', ios: 'slider.horizontal.3', web: 'tune' }} size={20} tintColor={colors.accent} />
              <Text style={styles.detailsTitle}>Memory details</Text>
            </View>

            <Text style={styles.fieldLabel}>Save as</Text>
            <View accessibilityRole="radiogroup" accessibilityLabel="Remember as" style={styles.modeRow}>
              {kindOptions.map((option) => {
                const selected = kind === option.kind;
                return (
                  <Pressable
                    accessibilityLabel={option.label}
                    key={option.kind}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    disabled={saving}
                    onPress={() => router.setParams({ kind: option.kind })}
                    style={[styles.modeChip, selected && styles.modeChipSelected]}
                  >
                    <Text style={[styles.modeChipText, selected && styles.modeChipTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {kind !== 'note' ? (
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>{kind === 'book-learning' ? 'Book or author' : 'People, place, or context'} <Text style={styles.optional}>Optional</Text></Text>
                <TextInput
                  accessibilityLabel={kind === 'book-learning' ? 'Optional book or author' : 'Optional people, place, or context'}
                  editable={!saving}
                  onChangeText={(value) => { if (!savingRef.current) setSource(value); }}
                  placeholder={kind === 'book-learning' ? 'e.g. Deep Work by Cal Newport' : 'e.g. Goa with Mira'}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={source}
                />
              </View>
            ) : null}

            <View style={styles.detailField}>
              <Text style={styles.fieldLabel}>Bring this back</Text>
              <View accessibilityRole="radiogroup" accessibilityLabel="Recall timing" style={styles.segmentedRow}>
                {recallOptions.map((option) => {
                  const selected = recallChoice === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      disabled={saving}
                      onPress={() => setRecallChoice(option.value)}
                      style={[styles.segment, selected && styles.segmentSelected]}
                    >
                      <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {recallChoice !== 'off' ? (
              <View style={styles.detailField}>
                <Text style={styles.fieldLabel}>Recall cue <Text style={styles.optional}>Optional</Text></Text>
                <TextInput
                  accessibilityLabel="Optional recall cue"
                  editable={!saving}
                  onChangeText={(value) => { if (!savingRef.current) setRecallPrompt(value); }}
                  placeholder="What should future-you try to recall?"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  value={recallPrompt}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.storageHintRow}>
            <SymbolView name={{ android: 'lock', ios: 'lock', web: 'lock' }} size={16} tintColor={colors.green} />
            <Text style={styles.storageHint}>Saved privately as Markdown on this device.</Text>
          </View>
          {saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable accessibilityRole="button" disabled={saving} onPress={leaveCapture} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={!hydrated || !draft.trim() || saving}
            onPress={() => { void save(); }}
            style={[styles.saveButton, (!hydrated || !draft.trim() || saving) && styles.buttonDisabled]}
          >
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : hydrated ? 'Save memory' : 'Opening…'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingBottom: 24, paddingHorizontal: 20 },
  topBar: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, justifyContent: 'center', minHeight: 58 },
  topBarTitle: { color: colors.ink, fontSize: 17, fontWeight: '600' },
  editorLabel: { color: colors.ink, fontSize: 15, fontWeight: '600', marginBottom: 10, marginTop: 18 },
  modeRow: { flexDirection: 'row', gap: 7 },
  modeChip: { alignItems: 'center', borderColor: 'transparent', borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 44, paddingHorizontal: 12 },
  modeChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.line },
  modeChipText: { color: colors.muted, fontSize: 13, fontWeight: '500' },
  modeChipTextSelected: { color: colors.accent, fontWeight: '600' },
  detailsPanel: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 24, paddingTop: 18 },
  detailsHeading: { alignItems: 'center', flexDirection: 'row', gap: 9, marginBottom: 18 },
  detailsTitle: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  detailField: { marginTop: 18 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '600', marginBottom: 9 },
  optional: { color: colors.muted, fontWeight: '500' },
  segmentedRow: { flexDirection: 'row', gap: 7 },
  segment: { alignItems: 'center', borderColor: colors.line, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 7 },
  segmentSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  segmentText: { color: colors.muted, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  segmentTextSelected: { color: colors.accent, fontWeight: '600' },
  input: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 11, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 48, paddingHorizontal: 13 },
  storageHintRow: { alignItems: 'center', flexDirection: 'row', gap: 7, marginTop: 24 },
  storageHint: { color: colors.muted, flex: 1, fontSize: 13, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, paddingBottom: 16, paddingTop: 12 },
  errorScreen: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  bottomBar: { backgroundColor: colors.paper, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  cancelButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 50, paddingHorizontal: 18 },
  cancelButtonText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  saveButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 12, flex: 1, justifyContent: 'center', minHeight: 50, paddingHorizontal: 18 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.35 },
});
