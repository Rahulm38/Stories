import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deferRecall, dueRecalls, gradeRecall, practiceRecall } from '@core/recall';
import type { MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { tabBarMetrics } from '@/src/navigation/tab-bar';
import { nextUpcomingRecallMessage, practiceCompletionMessage, recallCompletionMessage, remainingRecallMessage, savedMemoryMessage, shortDateLabel, timeGreeting } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { ListRow } from '@/src/ui/components/ListRow';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { SectionHeader } from '@/src/ui/components/SectionHeader';
import { Snackbar } from '@/src/ui/components/Snackbar';

type RecallStage = 'hidden' | 'revealed';

function ratingLabel(status: RecallStatus) {
  if (status === 'forgot') return 'Missed it';
  if (status === 'partial') return 'Almost';
  return 'Remembered';
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ nextRecallAt?: string | string[]; saved?: string | string[]; first?: string | string[]; noteId?: string | string[] }>();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [recallStage, setRecallStage] = useState<RecallStage>('hidden');
  const [activeRecallId, setActiveRecallId] = useState<string>();
  const [practiceNoteId, setPracticeNoteId] = useState<string>();
  const [statusMessage, setStatusMessage] = useState('');
  const [recallError, setRecallError] = useState('');
  const [savingRecall, setSavingRecall] = useState(false);
  const mountedRef = useRef(true);
  const savingRecallRef = useRef(false);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const firstParam = Array.isArray(params.first) ? params.first[0] : params.first;
  const noteIdParam = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;

  useEffect(() => {
    const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
    if (saved !== '1' || firstParam === '1') return undefined;
    const nextRecallAt = Array.isArray(params.nextRecallAt) ? params.nextRecallAt[0] : params.nextRecallAt;
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;
      setStatusMessage(savedMemoryMessage(nextRecallAt));
      router.setParams({ nextRecallAt: undefined, saved: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [firstParam, params.nextRecallAt, params.saved, router]);

  useEffect(() => {
    if (!statusMessage) return undefined;
    const timer = setTimeout(() => setStatusMessage(''), 6_000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, []));

  const healthyNotes = useMemo(() => notes.filter((note) => note.parseStatus !== 'quarantine'), [notes]);
  const firstMemoryPromptNote = firstParam === '1' && noteIdParam ? healthyNotes.find((note) => note.id === noteIdParam) : undefined;
  const dueNotes = useMemo(() => dueRecalls(healthyNotes, now), [healthyNotes, now]);
  const activeNote = activeRecallId ? healthyNotes.find((note) => note.id === activeRecallId) : undefined;
  const dueNote = activeNote || dueNotes[0];
  const recentNotes = healthyNotes.filter((note) => note.id !== dueNote?.id).slice(0, 3);
  const upcomingRecallNote = useMemo(() => healthyNotes
    .filter((note) => note.nextRecallAt && !dueNotes.some((due) => due.id === note.id))
    .sort((a, b) => (a.nextRecallAt || '').localeCompare(b.nextRecallAt || ''))[0], [dueNotes, healthyNotes]);
  const upcomingMessage = upcomingRecallNote?.nextRecallAt ? nextUpcomingRecallMessage(upcomingRecallNote.nextRecallAt) : undefined;

  const clearFirstMemoryParams = () => router.setParams({ first: undefined, noteId: undefined, saved: undefined, nextRecallAt: undefined });

  const startPractice = (note: MemoryNote) => {
    setActiveRecallId(note.id);
    setPracticeNoteId(note.id);
    setRecallStage('hidden');
    setStatusMessage('');
    setRecallError('');
    clearFirstMemoryParams();
  };

  const finishRecallState = () => {
    setActiveRecallId(undefined);
    setPracticeNoteId(undefined);
    setRecallStage('hidden');
    setNow(new Date());
  };

  const saveRecall = async (status: RecallStatus) => {
    if (!dueNote || savingRecallRef.current) return;
    savingRecallRef.current = true;
    setSavingRecall(true);
    setRecallError('');
    const recalledAt = new Date();
    const isPractice = practiceNoteId === dueNote.id;
    try {
      if (isPractice) {
        await saveNote(practiceRecall(dueNote, status, '', recalledAt));
        if (!mountedRef.current) return;
        setStatusMessage(practiceCompletionMessage(dueNote.nextRecallAt));
      } else {
        const graded = gradeRecall(dueNote, status, recalledAt);
        await saveNote(graded);
        if (!mountedRef.current) return;
        setStatusMessage(recallCompletionMessage(graded.nextRecallAt!, Math.max(0, dueNotes.length - 1)));
      }
      finishRecallState();
    } catch (error) {
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'This review could not be saved');
    } finally {
      savingRecallRef.current = false;
      if (mountedRef.current) setSavingRecall(false);
    }
  };

  const postponeRecall = async () => {
    if (!dueNote || savingRecallRef.current || practiceNoteId === dueNote.id) return;
    savingRecallRef.current = true;
    setSavingRecall(true);
    setRecallError('');
    try {
      await saveNote(deferRecall(dueNote));
      if (!mountedRef.current) return;
      setStatusMessage(`Moved to tomorrow. ${remainingRecallMessage(Math.max(0, dueNotes.length - 1))}`);
      finishRecallState();
    } catch (error) {
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'This review could not be moved');
    } finally {
      savingRecallRef.current = false;
      if (mountedRef.current) setSavingRecall(false);
    }
  };

  if (!hydrated) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><LoadingState label="Opening your memories…" /></SafeAreaView>;
  }
  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <ErrorState title="Couldn't open your memories" body={openError} hint="Your files were not replaced. Close and reopen Stories to try again." />
      </SafeAreaView>
    );
  }

  const isPractice = Boolean(dueNote && practiceNoteId === dueNote.id);
  const tabBar = tabBarMetrics(insets.bottom, Platform.OS === 'ios');

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <AppText accessibilityRole="header" variant="display">{timeGreeting()}</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.headerSubtitle}>
              {healthyNotes.length === 0
                ? 'A small place for things worth remembering.'
                : dueNotes.length > 0
                  ? `${dueNotes.length} ${dueNotes.length === 1 ? 'memory is' : 'memories are'} ready to review.`
                  : "Nothing needs your attention right now."}
            </AppText>
          </View>

          {healthyNotes.length === 0 ? (
            <View style={styles.firstUse}>
              <AppText variant="title">Save it now. Remember it later.</AppText>
              <AppText variant="body" tone="secondary" style={styles.firstUseCopy}>
                In a few days, Stories brings your memory back hidden. Try to remember it, then reveal what you wrote.
              </AppText>
              <Button label="Save your first memory" onPress={() => router.navigate('/capture')} style={styles.firstUseButton} />
            </View>
          ) : null}

          {firstMemoryPromptNote && !activeRecallId ? (
            <Card style={styles.firstMemoryCard}>
              <AppText variant="section">That’s it — your first memory is saved.</AppText>
              <AppText variant="supporting" tone="secondary" style={styles.firstMemoryBody}>
                Want to see the review flow once? This practice run won’t change when the memory returns.
              </AppText>
              <View style={styles.firstMemoryActions}>
                <Button label="Try review" onPress={() => startPractice(firstMemoryPromptNote)} style={styles.flexButton} />
                <Button label="Not now" variant="text" onPress={clearFirstMemoryParams} />
              </View>
            </Card>
          ) : null}

          {dueNote ? (
            <View style={styles.section}>
              <SectionHeader>{isPractice ? 'Practice' : 'Review'}</SectionHeader>
              <Card accent>
                <AppText accessibilityRole="header" variant="section">{dueNote.title}</AppText>
                {dueNote.source ? <AppText variant="metadata" tone="secondary" style={styles.source}>{dueNote.source}</AppText> : null}

                {recallStage === 'hidden' ? (
                  <>
                    <AppText variant="supporting" tone="secondary" style={styles.reviewInstruction}>
                      Before revealing it, say what you remember in your own words.
                    </AppText>
                    <View style={styles.reviewActions}>
                      <Button disabled={savingRecall} label="Reveal memory" onPress={() => setRecallStage('revealed')} style={styles.flexButton} />
                      {!isPractice ? <Button disabled={savingRecall} label="Tomorrow" variant="text" onPress={() => { void postponeRecall(); }} /> : null}
                    </View>
                  </>
                ) : (
                  <View accessibilityLiveRegion="polite">
                    <View style={styles.memoryBody}>
                      <AppText variant="body">{dueNote.body}</AppText>
                    </View>
                    <AppText variant="supporting" style={styles.ratingPrompt}>How close were you?</AppText>
                    <View style={styles.ratingRow}>
                      {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                        <Button
                          accessibilityLabel={`Mark review ${ratingLabel(status)}`}
                          accessibilityState={{ busy: savingRecall, disabled: savingRecall }}
                          disabled={savingRecall}
                          key={status}
                          label={ratingLabel(status)}
                          onPress={() => { void saveRecall(status); }}
                          style={styles.ratingButton}
                          variant="secondary"
                        />
                      ))}
                    </View>
                  </View>
                )}
              </Card>
              {recallError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{recallError}</AppText> : null}
            </View>
          ) : upcomingMessage && healthyNotes.length > 0 ? (
            <View style={styles.upcomingSection}>
              <SymbolView name={{ ios: 'clock', android: 'schedule', web: 'schedule' }} size={18} tintColor={colors.textSecondary} />
              <AppText variant="supporting" tone="secondary" style={styles.upcomingCopy}>{upcomingMessage}</AppText>
            </View>
          ) : null}

          {healthyNotes.length > 0 ? (
            <View style={styles.section}>
              <Button label="New memory" variant={dueNote ? 'secondary' : 'primary'} onPress={() => router.navigate('/capture')} />
            </View>
          ) : null}

          {recentNotes.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader>Recent</SectionHeader>
              {recentNotes.map((note, index) => (
                <ListRow
                  key={note.id}
                  accessibilityLabel={`Open ${note.title}`}
                  metadata={shortDateLabel(note.updatedAt)}
                  onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                  showTopDivider={index > 0}
                  title={note.title}
                  trailing={<SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.textSecondary} />}
                />
              ))}
              {healthyNotes.length > recentNotes.length ? <Button label="View Library" variant="text" onPress={() => router.navigate('/(tabs)/files')} /> : null}
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {statusMessage ? (
        <View pointerEvents="none" style={[styles.snackbarOverlay, { bottom: tabBar.height + spacing.md }]}>
          <Snackbar message={statusMessage} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  header: { marginBottom: spacing.md },
  headerSubtitle: { marginTop: spacing.xxs },
  firstUse: { marginTop: spacing.xxxl },
  firstUseCopy: { marginTop: spacing.sm, maxWidth: 360 },
  firstUseButton: { marginTop: spacing.xl },
  section: { marginTop: spacing.xxl },
  firstMemoryCard: { marginTop: spacing.lg },
  firstMemoryBody: { marginTop: spacing.sm },
  firstMemoryActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  flexButton: { flex: 1 },
  source: { marginTop: spacing.xxs },
  reviewInstruction: { marginTop: spacing.md },
  reviewActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  memoryBody: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.md },
  ratingPrompt: { fontWeight: '600', marginTop: spacing.lg },
  ratingRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  ratingButton: { flex: 1, paddingHorizontal: spacing.xs },
  error: { marginTop: spacing.sm },
  upcomingSection: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xl },
  upcomingCopy: { flex: 1 },
  snackbarOverlay: { left: 0, position: 'absolute', right: 0 },
});
