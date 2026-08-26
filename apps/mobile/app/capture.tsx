import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall } from '@core/recall';
import { clearCaptureDraft, readCaptureDraft, writeCaptureDraft } from '@/src/capture/draft-store';
import { useUnsavedChangesGuard } from '@/src/navigation/unsaved-changes';
import { useVault } from '@/src/vault/provider';
import { MemoryEditor } from '@/src/ui/MemoryEditor';
import { colors, radii, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { StatusMessage } from '@/src/ui/components/StatusMessage';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

export default function CaptureScreen() {
  const router = useRouter();
  const { hydrated, openError, saveNote } = useVault();
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [recovered, setRecovered] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [savedId, setSavedId] = useState<string>();
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
      setRecovered(Boolean(saved.body.trim()));
      setDraftLoaded(true);
    });
    return () => { active = false; };
  }, []);

  const dirty = Boolean(draft.trim());
  const allowNextNavigation = useUnsavedChangesGuard(dirty, saving, clearCaptureDraft);

  useEffect(() => {
    if (!draftLoaded || saving || savedId) return undefined;
    if (!dirty) {
      void clearCaptureDraft();
      return undefined;
    }
    const timer = setTimeout(() => {
      void writeCaptureDraft({ body: draft, savedAt: new Date().toISOString() });
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, draftLoaded, dirty, savedId, saving]);

  const leaveCapture = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [router]);

  const save = async () => {
    if (!hydrated || !draft.trim() || savingRef.current) return;
    savingRef.current = true;
    const nextRecallAt = scheduleFirstRecall(new Date(), 3);
    setSaving(true);
    setSaveError('');
    try {
      const saved = await saveNote({ body: draft.trim(), nextRecallAt });
      await clearCaptureDraft();
      if (!mountedRef.current) return;
      setDraft('');
      setRecovered(false);
      setSavedId(saved.id);
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be saved');
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
        <ErrorState title="Couldn't open your stories" body={openError} hint="Your stories were left unchanged." action={<Button label="Back to Today" variant="text" onPress={() => router.replace('/(tabs)')} />} />
      </SafeAreaView>
    );
  }

  if (savedId) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
        <TopAppBar title="Saved" />
        <View style={styles.savedContent}>
          <View style={styles.savedIcon}>
            <SymbolView name={{ android: 'check', ios: 'checkmark', web: 'check' }} size={sizes.primaryIcon} tintColor={colors.success} />
          </View>
          <AppText accessibilityRole="header" variant="title">Saved</AppText>
          <AppText variant="body" tone="secondary" style={styles.savedCopy}>Comes back in 3 days.</AppText>
          <Button
            label="Try telling it now"
            leading={<SymbolView name={{ android: 'chat_bubble', ios: 'quote.bubble', web: 'chat_bubble' }} size={sizes.compactIcon} tintColor={colors.onAction} />}
            onPress={() => router.push({ pathname: '/practice/[id]', params: { id: savedId, from: 'saved' } })}
            style={styles.savedButton}
          />
          <Button
            label="Done"
            variant="secondary"
            onPress={() => {
              allowNextNavigation();
              router.replace('/(tabs)');
            }}
            style={styles.doneButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={sharedStyles.screen} behavior="height">
        <TopAppBar
          title="New story"
          left={(
            <IconButton accessibilityLabel="Close new story" disabled={saving} onPress={leaveCapture}>
              <SymbolView name={{ android: 'close', ios: 'xmark', web: 'close' }} size={sizes.standardIcon} tintColor={colors.action} />
            </IconButton>
          )}
        />

        <ScrollView contentContainerStyle={styles.content} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          {recovered ? <StatusMessage message="Recovered your unfinished story." /> : null}

          <AppText accessibilityRole="header" variant="title" style={styles.prompt}>What’s worth remembering?</AppText>
          <AppText variant="supporting" tone="secondary" style={styles.support}>One sentence is enough.</AppText>

          <MemoryEditor
            value={draft}
            onChangeText={(value) => {
              if (savingRef.current) return;
              setDraft(value);
              if (recovered) setRecovered(false);
            }}
            accessibilityLabel="What’s worth remembering?"
            placeholder="A conversation, a moment, something you’d tell a friend…"
            autoFocus
            editable={!saving}
            minHeight={300}
          />

          <View style={styles.returnHint}>
            <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
            <AppText variant="metadata" tone="secondary" style={styles.returnCopy}>Comes back in 3 days.</AppText>
          </View>
          {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            accessibilityState={{ busy: saving, disabled: !hydrated || !draft.trim() || saving }}
            disabled={!hydrated || !draft.trim() || saving}
            label={saving ? 'Saving…' : 'Save story'}
            leading={<SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={sizes.compactIcon} tintColor={colors.onAction} />}
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
  returnHint: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  returnCopy: { flex: 1 },
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
  savedContent: { alignItems: 'stretch', flex: 1, justifyContent: 'center', paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg },
  savedIcon: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.actionMuted, borderRadius: radii.card, height: 64, justifyContent: 'center', marginBottom: spacing.lg, width: 64 },
  savedCopy: { marginTop: spacing.sm },
  savedButton: { marginTop: spacing.xl, width: '100%' },
  doneButton: { marginTop: spacing.sm, width: '100%' },
});
