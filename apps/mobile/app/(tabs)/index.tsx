import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deferRecall, dueRecalls, gradeRecall, MAX_SESSION_MEMORIES, stopResurfacing } from '@core/recall';
import { storyTrigger } from '@core/story-cue';
import type { MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { tabBarMetrics } from '@/src/navigation/tab-bar';
import { memoryAgeLabel, nextUpcomingRecallMessage, recallCompletionMessage, remainingStoryMessage } from '@/src/recall/presentation';
import { selectPracticeMemory } from '@/src/recall/practice';
import { readReminderPreferences, writeReminderPreferences } from '@/src/notifications/reminder-preferences';
import { checkNotificationPermission, requestNotificationPermission } from '@/src/notifications/device-permissions';
import { reconcileRecallReminder } from '@/src/notifications/reminder-scheduler';
import { readDailyReviewSession, recordDailyReviewHandled } from '@/src/recall/daily-session-store';
import { incrementDailyReviewSession, sessionForDay, type DailyReviewSession } from '@/src/recall/daily-session';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { Snackbar } from '@/src/ui/components/Snackbar';
import { RecallChoiceGroup } from '@/src/ui/story/RecallChoiceGroup';
import { StoryRevealSurface } from '@/src/ui/story/StoryRevealSurface';
import { StoryTriggerCard } from '@/src/ui/story/StoryTriggerCard';

type Stage = 'trigger' | 'revealed';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [stage, setStage] = useState<Stage>('trigger');
  const [hintVisible, setHintVisible] = useState(false);
  const [session, setSession] = useState<DailyReviewSession | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reminderPrompt, setReminderPrompt] = useState(false);
  const [practiceOffset, setPracticeOffset] = useState(0);
  const mounted = useRef(true);
  const savingRef = useRef(false);

  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(''), 6_000);
    return () => clearTimeout(timer);
  }, [status]);

  useFocusEffect(useCallback(() => {
    let active = true;
    const focusedAt = new Date();
    setNow(focusedAt);
    setStage('trigger');
    setHintVisible(false);
    void readDailyReviewSession(focusedAt).then((value) => {
      if (active && mounted.current) setSession(value);
    });

    const timer = setInterval(() => setNow(new Date()), 60_000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const resumedAt = new Date();
        setNow(resumedAt);
        void readDailyReviewSession(resumedAt).then((value) => {
          if (active && mounted.current) setSession(value);
        });
      }
    });
    return () => {
      active = false;
      clearInterval(timer);
      sub.remove();
    };
  }, []));

  const healthy = useMemo(() => notes.filter((note) => note.parseStatus !== 'quarantine'), [notes]);
  const due = useMemo(() => dueRecalls(healthy, now), [healthy, now]);
  const activeSession = useMemo(() => sessionForDay(session || undefined, now), [now, session]);
  const capped = activeSession.handled >= MAX_SESSION_MEMORIES;
  const current = capped ? undefined : due[0];
  const visibleDue = Math.min(due.length, Math.max(0, MAX_SESSION_MEMORIES - activeSession.handled));
  const trigger = useMemo(() => storyTrigger(current?.body || ''), [current?.body]);
  const practiceCandidate = useMemo(() => selectPracticeMemory(healthy, practiceOffset), [healthy, practiceOffset]);
  const upcoming = useMemo(
    () => healthy
      .filter((note) => note.nextRecallAt && !due.some((item) => item.id === note.id))
      .sort((a, b) => (a.nextRecallAt || '').localeCompare(b.nextRecallAt || ''))[0],
    [due, healthy],
  );
  const upcomingCopy = upcoming?.nextRecallAt ? nextUpcomingRecallMessage(upcoming.nextRecallAt) : undefined;

  const markHandled = async (actionTime: Date): Promise<DailyReviewSession> => {
    try {
      const next = await recordDailyReviewHandled(actionTime);
      if (mounted.current) setSession(next);
      return next;
    } catch {
      const next = incrementDailyReviewSession(activeSession, actionTime);
      if (mounted.current) setSession(next);
      return next;
    }
  };

  const finish = () => {
    setStage('trigger');
    setHintVisible(false);
    setNow(new Date());
  };

  const offerReminder = async (firstReturn: boolean) => {
    if (!firstReturn) return;
    try {
      const prefs = await readReminderPreferences();
      if (prefs.enabled || prefs.promptedAfterReview) return;
      await writeReminderPreferences({ ...prefs, promptedAfterReview: true });
      if (await checkNotificationPermission() !== 'blocked' && mounted.current) setReminderPrompt(true);
    } catch {
      // Reminders never interrupt the core loop.
    }
  };

  const complete = async (result: RecallStatus) => {
    if (!current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    const firstReturn = !current.lastRecalledAt;
    const actionTime = new Date();
    try {
      const next = gradeRecall(current, result, actionTime);
      const saved = await saveNote(next);
      const nextSession = await markHandled(actionTime);
      if (!mounted.current) return;
      const remaining = Math.max(0, Math.min(due.length - 1, MAX_SESSION_MEMORIES - nextSession.handled));
      setStatus(recallCompletionMessage(saved.nextRecallAt!, remaining));
      finish();
      void offerReminder(firstReturn);
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This story could not be updated');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const tomorrow = async () => {
    if (!current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    const actionTime = new Date();
    try {
      await saveNote(deferRecall(current, actionTime));
      const nextSession = await markHandled(actionTime);
      if (!mounted.current) return;
      const remaining = Math.max(0, Math.min(due.length - 1, MAX_SESSION_MEMORIES - nextSession.handled));
      setStatus(`Moved to tomorrow. ${remainingStoryMessage(remaining)}`);
      finish();
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This story could not be moved');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const stop = async () => {
    if (!current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError('');
    const actionTime = new Date();
    try {
      await saveNote(stopResurfacing(current));
      await markHandled(actionTime);
      if (mounted.current) {
        setStatus('Stopped resurfacing. It’s still in your Library.');
        finish();
      }
    } catch (cause) {
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This story could not be updated');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const actions = (note: MemoryNote) => Alert.alert('Story', undefined, [
    { text: 'Open story', onPress: () => router.push({ pathname: '/note/[id]', params: { id: note.id } }) },
    { text: 'Stop resurfacing', onPress: () => { void stop(); } },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const practiceNow = () => {
    if (!practiceCandidate) return;
    const candidate = practiceCandidate;
    setPracticeOffset((offset) => offset + 1);
    router.push({ pathname: '/practice/[id]', params: { id: candidate.id, from: 'today' } });
  };

  const enableReminders = async () => {
    const currentPermission = await checkNotificationPermission();
    const permission = currentPermission === 'granted' ? currentPermission : await requestNotificationPermission();
    setReminderPrompt(false);
    if (permission !== 'granted') return;
    const prefs = await readReminderPreferences();
    await writeReminderPreferences({ ...prefs, enabled: true, promptedAfterReview: true });
    await reconcileRecallReminder(notes);
    if (mounted.current) setStatus('Reminders are on.');
  };

  if (!hydrated || !session) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><LoadingState label="Opening your stories…" /></SafeAreaView>;
  }
  if (openError) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><ErrorState title="Couldn't open your stories" body={openError} hint="Your stories were left unchanged. Close and reopen Stories to try again." /></SafeAreaView>;
  }

  const sessionDone = capped && due.length > 0;
  const tabBar = tabBarMetrics(insets.bottom, false);
  const subtitle = healthy.length === 0
    ? 'Have a story ready when conversation opens the door.'
    : current
      ? (due.length > visibleDue ? 'A few stories came back.' : `${visibleDue} ${visibleDue === 1 ? 'story came back.' : 'stories came back.'}`)
      : sessionDone
        ? 'Enough for today.'
        : 'Nothing due today.';

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText accessibilityRole="header" variant="display">Today</AppText>
          <AppText variant="supporting" tone="secondary" style={styles.subtitle}>{subtitle}</AppText>
        </View>

        {healthy.length === 0 ? (
          <View style={styles.firstUse}>
            <AppText variant="title">Have a story ready.</AppText>
            <AppText variant="body" tone="secondary" style={styles.firstCopy}>Save moments worth telling. We’ll bring them back before they fade.</AppText>
            <Button label="Save your first story" onPress={() => router.navigate('/capture')} style={styles.firstButton} />
          </View>
        ) : null}

        {current ? (
          <View style={styles.section}>
            {stage === 'trigger' ? (
              <StoryTriggerCard
                trigger={trigger}
                ageLabel={memoryAgeLabel(current.createdAt, now)}
                headerAction={(
                  <IconButton accessibilityLabel="Story options" disabled={saving} onPress={() => actions(current)}>
                    <SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={sizes.standardIcon} tintColor={colors.textSecondary} />
                  </IconButton>
                )}
                hintVisible={hintVisible}
                disabled={saving}
                onNeedHint={trigger.secondary ? () => setHintVisible(true) : undefined}
                onShowStory={() => setStage('revealed')}
                onTomorrow={() => { void tomorrow(); }}
              />
            ) : (
              <Card>
                <StoryRevealSurface body={current.body} />
                <AppText variant="section" style={styles.ratingTitle}>Could you tell it?</AppText>
                <RecallChoiceGroup disabled={saving} onSelect={(result) => { void complete(result); }} />
              </Card>
            )}
            {error ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{error}</AppText> : null}
          </View>
        ) : sessionDone ? (
          <Card style={styles.stateCard}>
            <AppText variant="section">Enough for today</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.stateCopy}>The rest can wait.</AppText>
            <Button label="New story" variant="tonal" onPress={() => router.navigate('/capture')} style={styles.stateAction} />
          </Card>
        ) : healthy.length > 0 ? (
          <Card style={styles.stateCard}>
            <AppText variant="section">Your stories are resting</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.stateCopy}>{upcomingCopy || 'Try one anytime.'}</AppText>
            <Button label="Try a story" onPress={practiceNow} style={styles.stateAction} />
            <Button label="New story" variant="tonal" onPress={() => router.navigate('/capture')} style={styles.secondaryStateAction} />
          </Card>
        ) : null}

        {reminderPrompt ? (
          <Card style={styles.reminder}>
            <AppText variant="section">Want a nudge when stories come back?</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.stateCopy}>We’ll only remind you when something is ready.</AppText>
            <Button label="Turn on" onPress={() => { void enableReminders(); }} style={styles.stateAction} />
            <Button label="Not now" variant="text" onPress={() => setReminderPrompt(false)} style={styles.secondaryStateAction} />
          </Card>
        ) : null}

        {healthy.length > 0 && current ? (
          <Button label="New story" variant="tonal" onPress={() => router.navigate('/capture')} style={styles.newStory} />
        ) : null}
      </ScrollView>
      {status ? <View pointerEvents="none" style={[styles.snackbar, { bottom: tabBar.height + spacing.md }]}><Snackbar message={status} /></View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  header: { marginBottom: spacing.md },
  subtitle: { marginTop: spacing.xxs },
  firstUse: { marginTop: spacing.xxl },
  firstCopy: { marginTop: spacing.sm, maxWidth: 420 },
  firstButton: { marginTop: spacing.xl, width: '100%' },
  section: { marginTop: spacing.xl },
  ratingTitle: { marginTop: spacing.lg },
  error: { marginTop: spacing.sm },
  stateCard: { marginTop: spacing.xl },
  stateCopy: { marginTop: spacing.xs },
  stateAction: { marginTop: spacing.lg, width: '100%' },
  secondaryStateAction: { marginTop: spacing.xs, width: '100%' },
  reminder: { marginTop: spacing.lg },
  newStory: { marginTop: spacing.lg, width: '100%' },
  snackbar: { left: spacing.lg, position: 'absolute', right: spacing.lg },
});
