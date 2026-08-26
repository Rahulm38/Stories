import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall } from '@core/recall';
import { MarkdownEditor } from '@/src/ui/MarkdownEditor';
import { DEFAULT_RECALL_CHOICE, RECALL_OPTIONS, recallDaysForChoice, type RecallChoice } from '@/src/capture/options';
import { clearCaptureDraft, readCaptureDraft, writeCaptureDraft } from '@/src/capture/draft-store';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { SegmentedControl } from '@/src/ui/components/SegmentedControl';
import { StatusMessage } from '@/src/ui/components/StatusMessage';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

export default function CaptureScreen() {
  const router = useRouter();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [draft, setDraft] = useState('');
  const [recallChoice, setRecallChoice] = useState<RecallChoice>(DEFAULT_RECALL_CHOICE);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recovered, setRecovered] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const mountedRef = useRef(true);
  const savingRef = useRef(false);
  const restoreAttemptedRef = useRef(false);

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
      setRecallChoice(saved.recallChoice || DEFAULT_RECALL_CHOICE);
      setRecovered(Boolean(saved.body.trim()));
      setDraftLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const dirty = Boolean(draft.trim() || recallChoice !== DEFAULT_RECALL_CHOICE);
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving);

  useEffect(() => {
    if (!draftLoaded || !dirty || saving) return undefined;
    const timer = setTimeout(() => {
      void writeCaptureDraft({
        body: draft,
        source: '',
        recallPrompt: '',
        kind: 'note',
        recallChoice,
        savedAt: new Date().toISOString(),
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, draftLoaded, dirty, recallChoice, saving]);

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
        body: draft.trim(),
        kind: 'note',
        folder: 'Inbox',
        nextRecallAt,
      });
      await clearCaptureDraft();
      if (!mountedRef.current) return;
      allowNextNavigation();
      router.replace({
        pathname: '/(tabs)',
        params: {
          saved: '1',
          ...(nextRecallAt ? { nextRecallAt } : {}),
          ...(wasEmptyVault ? { first: '1', noteId: created.id } : {}),
        },
      });
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

        <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          {recovered ? <StatusMessage message="Recovered your unfinished memory." /> : null}

          <AppText accessibilityRole="header" variant="title" style={styles.prompt}>What do you want to remember?</AppText>
          <AppText variant="supporting" tone="secondary" style={styles.support}>Write it naturally. One sentence is enough.</AppText>

          <MarkdownEditor
            value={draft}
            onChangeText={(value) => { if (!savingRef.current) setDraft(value); }}
            accessibilityLabel="What do you want to remember?"
            placeholder="A useful idea, something that happened, a lesson, a quote…"
            autoFocus
            editable={!saving}
            minHeight={260}
          />

          <View style={styles.returnSection}>
            <AppText variant="section">Show me again</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.returnSupport}>
              Stories will hide the memory first so you can try to remember it.
            </AppText>
            <SegmentedControl
              accessibilityLabel="When should Stories show this memory again?"
              disabled={saving}
              options={RECALL_OPTIONS}
              value={recallChoice}
              onChange={setRecallChoice}
            />
          </View>

          {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            accessibilityState={{ busy: saving, disabled: !hydrated || !draft.trim() || saving }}
            disabled={!hydrated || !draft.trim() || saving}
            label={saving ? 'Saving…' : 'Save'}
            onPress={() => { void save(); }}
            style={styles.saveButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  prompt: { marginTop: spacing.sm },
  support: { marginBottom: spacing.lg, marginTop: spacing.xs },
  returnSection: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.xxl, paddingTop: spacing.lg },
  returnSupport: { marginBottom: spacing.md, marginTop: spacing.xxs },
  error: { marginTop: spacing.md },
  bottomBar: {
    backgroundColor: colors.canvas,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  saveButton: { width: '100%' },
});
