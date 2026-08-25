import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall } from '@core/recall';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { DEFAULT_RECALL_CHOICE, MEMORY_KIND_OPTIONS, RECALL_OPTIONS, memoryDetailsSummary, recallDaysForChoice, type RecallChoice } from '@/src/capture/options';
import { clearCaptureDraft, readCaptureDraft, writeCaptureDraft } from '@/src/capture/draft-store';
import { captureKindFromParam } from '@/src/navigation/route-state';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { shortDateLabel } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { DisclosureRow } from '@/src/ui/components/DisclosureRow';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { SegmentedControl } from '@/src/ui/components/SegmentedControl';
import { StatusMessage } from '@/src/ui/components/StatusMessage';
import { TextField } from '@/src/ui/components/TextField';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

export default function CaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind?: string | string[] }>();
  const kind = captureKindFromParam(params.kind);
  const { hydrated, notes, openError, saveNote } = useVault();
  const [draft, setDraft] = useState('');
  const [source, setSource] = useState('');
  const [recallChoice, setRecallChoice] = useState<RecallChoice>(DEFAULT_RECALL_CHOICE);
  const [recallPrompt, setRecallPrompt] = useState('');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recovered, setRecovered] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const restoreAttemptedRef = useRef(false);
  const initialKindRef = useRef(kind);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (restoreAttemptedRef.current) return undefined;
    restoreAttemptedRef.current = true;
    let active = true;
    void readCaptureDraft().then((saved) => {
      if (!active || !saved) {
        if (active) setDraftLoaded(true);
        return;
      }
      setDraft(saved.body);
      setSource(saved.source);
      setRecallPrompt(saved.recallPrompt);
      setRecallChoice(saved.recallChoice);
      if (saved.kind !== initialKindRef.current) router.setParams({ kind: saved.kind });
      setRecovered(Boolean(saved.body.trim() || saved.source.trim() || saved.recallPrompt.trim()));
      setDraftLoaded(true);
    });
    return () => { active = false; };
  }, [router]);

  const dirty = Boolean(draft.trim() || source.trim() || recallPrompt.trim() || kind !== 'note' || recallChoice !== DEFAULT_RECALL_CHOICE);
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving);

  useEffect(() => {
    if (!draftLoaded || !dirty || saving) return undefined;
    const timer = setTimeout(() => {
      void writeCaptureDraft({ body: draft, source, recallPrompt, kind, recallChoice, savedAt: new Date().toISOString() });
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, draftLoaded, dirty, kind, recallChoice, recallPrompt, saving, source]);

  const placeholder = kind === 'book-learning'
    ? 'What idea is worth carrying forward?'
    : kind === 'experience'
      ? 'What happened, and what do you want to remember from it?'
      : "What's worth remembering?";

  const recallDaysDisplay = recallDaysForChoice(recallChoice);
  const nextRecallAtDisplay = recallDaysDisplay ? scheduleFirstRecall(new Date(), recallDaysDisplay) : undefined;
  const formattedReturnDate = nextRecallAtDisplay ? shortDateLabel(nextRecallAtDisplay) : '';

  const leaveCapture = useCallback(() => {
    if (Platform.OS !== 'web' && router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [router]);

  const save = async () => {
    if (!hydrated || !draft.trim() || savingRef.current) return;
    savingRef.current = true;
    const wasEmptyVault = notes.length === 0;
    const recallDays = recallDaysForChoice(recallChoice);
    const nextRecallAt = recallDays ? scheduleFirstRecall(new Date(), recallDays) : undefined;
    setSaving(true);
    setSaveError('');
    try {
      const created = await saveNote({
        body: draft,
        kind,
        folder: kind === 'book-learning' ? 'Books' : kind === 'experience' ? 'Experiences' : 'Inbox',
        source: kind === 'note' ? undefined : source.trim() || undefined,
        nextRecallAt,
        recallPrompt: recallDays ? recallPrompt.trim() || undefined : undefined,
      });
      await clearCaptureDraft();
      if (mountedRef.current) {
        allowNextNavigation();
        router.replace({
          pathname: '/(tabs)',
          params: {
            saved: '1',
            ...(nextRecallAt ? { nextRecallAt } : {}),
            ...(wasEmptyVault ? { first: '1', noteId: created.id } : {}),
          },
        });
      }
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This memory could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
        <ErrorState
          title="Couldn't open your memories"
          body={openError}
          hint="Your files were not replaced."
          action={<Button label="Back to Today" variant="text" onPress={() => router.replace('/(tabs)')} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TopAppBar
          title="New memory"
          left={(
            <IconButton accessibilityLabel="Close new memory" disabled={saving} onPress={leaveCapture}>
              <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={sizes.standardIcon} tintColor={colors.action} />
            </IconButton>
          )}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          {recovered ? <StatusMessage message="Recovered your unfinished memory." /> : null}

          <View style={styles.editorHeading}>
            <AppText variant="action">What do you want to remember?</AppText>
            <AppText variant="metadata" tone="secondary" style={styles.editorSupport}>One sentence is enough.</AppText>
          </View>
          <MarkdownEditor
            value={draft}
            onChangeText={(value) => { if (!savingRef.current) setDraft(value); }}
            accessibilityLabel="What do you want to remember?"
            placeholder={placeholder}
            autoFocus
            editable={!saving}
            minHeight={280}
            showToolbar={false}
          />

          <View style={styles.detailsPanel}>
            <DisclosureRow
              accessibilityHint={detailsExpanded ? 'Hides optional memory settings' : 'Shows memory type, recall timing, and optional recall cue'}
              accessibilityLabel={`Memory details, ${memoryDetailsSummary(kind, recallChoice)}`}
              accessibilityState={{ expanded: detailsExpanded }}
              disabled={saving}
              onPress={() => setDetailsExpanded((expanded) => !expanded)}
              title="Memory details"
              summary={memoryDetailsSummary(kind, recallChoice)}
              leading={<SymbolView name={{ android: 'tune', ios: 'slider.horizontal.3', web: 'tune' }} size={sizes.compactIcon} tintColor={colors.action} />}
              trailing={<SymbolView accessibilityElementsHidden importantForAccessibility="no-hide-descendants" name={{ android: detailsExpanded ? 'expand_less' : 'expand_more', ios: detailsExpanded ? 'chevron.up' : 'chevron.down', web: detailsExpanded ? 'expand_less' : 'expand_more' }} size={sizes.compactIcon} tintColor={colors.action} />}
            />

            {detailsExpanded ? (
              <View style={styles.detailsContent}>
                <FieldLabel>Save as</FieldLabel>
                <SegmentedControl accessibilityLabel="Remember as" disabled={saving} options={MEMORY_KIND_OPTIONS} value={kind} onChange={(value) => router.setParams({ kind: value })} />

                {kind !== 'note' ? (
                  <View style={styles.detailField}>
                    <FieldLabel optional>{kind === 'book-learning' ? 'Book or author' : 'People, place, or context'}</FieldLabel>
                    <TextField
                      accessibilityLabel={kind === 'book-learning' ? 'Optional book or author' : 'Optional people, place, or context'}
                      editable={!saving}
                      onChangeText={setSource}
                      placeholder={kind === 'book-learning' ? 'e.g. Deep Work by Cal Newport' : 'e.g. Goa with Mira'}
                      value={source}
                    />
                  </View>
                ) : null}

                <View style={styles.detailField}>
                  <FieldLabel>Bring this back</FieldLabel>
                  <SegmentedControl accessibilityLabel="Recall timing" disabled={saving} options={RECALL_OPTIONS} value={recallChoice} onChange={setRecallChoice} />
                </View>

                {recallChoice !== 'off' ? (
                  <View style={styles.detailField}>
                    <FieldLabel optional>Recall cue</FieldLabel>
                    <TextField accessibilityLabel="Optional recall cue" editable={!saving} onChangeText={setRecallPrompt} placeholder="What should future-you try to recall?" value={recallPrompt} />
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <View style={styles.storageHintRow}>
            <SymbolView name={{ android: 'lock', ios: 'lock', web: 'lock' }} size={18} tintColor={colors.success} />
            <AppText variant="metadata" tone="secondary">Stored privately on this device.</AppText>
          </View>
          {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          {formattedReturnDate ? <AppText variant="metadata" tone="secondary" style={styles.returnDate}>Returns {formattedReturnDate}</AppText> : null}
          <Button
            accessibilityState={{ busy: saving, disabled: !hydrated || !draft.trim() || saving }}
            disabled={!hydrated || !draft.trim() || saving}
            label={saving ? 'Saving…' : 'Save memory'}
            onPress={() => { void save(); }}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: { flexGrow: 1, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg },
  editorHeading: { marginBottom: spacing.xs, marginTop: spacing.lg },
  editorSupport: { marginTop: spacing.xxs },
  detailsPanel: {
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xl,
  },
  detailsContent: { paddingBottom: spacing.lg, paddingTop: spacing.xs },
  detailField: { marginTop: spacing.lg },
  fieldLabel: { fontWeight: '600', marginBottom: spacing.xs },
  storageHintRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  error: { marginTop: spacing.sm },
  bottomBar: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  returnDate: { marginBottom: spacing.xs, textAlign: 'center' },
  saveButton: { width: '100%' },
});
