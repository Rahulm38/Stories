import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, AppState, PixelRatio, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deferRecall, dueRecalls, gradeRecall, MAX_SESSION_MEMORIES, stopResurfacing } from '@core/recall';
import { memoryTitle, storyCue } from '@core/story-cue';
import type { MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { tabBarMetrics } from '@/src/navigation/tab-bar';
import { memoryAgeLabel, nextUpcomingRecallMessage, recallCompletionMessage, recallResultLabel, remainingStoryMessage, savedMemoryMessage, shortDateLabel, timeGreeting } from '@/src/recall/presentation';
import { readReminderPreferences, writeReminderPreferences } from '@/src/notifications/reminder-preferences';
import { checkNotificationPermission, requestNotificationPermission } from '@/src/notifications/device-permissions';
import { reconcileRecallReminder } from '@/src/notifications/reminder-scheduler';
import { readDailyReviewSession, recordDailyReviewHandled } from '@/src/recall/daily-session-store';
import { incrementDailyReviewSession, sessionForDay, type DailyReviewSession } from '@/src/recall/daily-session';
import { MemoryText } from '@/src/ui/MemoryText';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { ListRow } from '@/src/ui/components/ListRow';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { SectionHeader } from '@/src/ui/components/SectionHeader';
import { Snackbar } from '@/src/ui/components/Snackbar';

type Stage = 'hidden' | 'revealed';

const symbol = (ios: string, android: string, tint = colors.action) => (
  <SymbolView name={{ ios: ios as never, android: android as never, web: android as never }} size={sizes.compactIcon} tintColor={tint} />
);

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const fontScale = PixelRatio.getFontScale();
  const params = useLocalSearchParams<{ nextRecallAt?: string | string[]; saved?: string | string[] }>();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [stage, setStage] = useState<Stage>('hidden');
  const [session, setSession] = useState<DailyReviewSession | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reminderPrompt, setReminderPrompt] = useState(false);
  const mounted = useRef(true);
  const savingRef = useRef(false);

  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
    if (saved !== '1') return undefined;
    const next = Array.isArray(params.nextRecallAt) ? params.nextRecallAt[0] : params.nextRecallAt;
    const timer = setTimeout(() => {
      if (!mounted.current) return;
      setStatus(savedMemoryMessage(next));
      router.setParams({ saved: undefined, nextRecallAt: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [params.nextRecallAt, params.saved, router]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(''), 6_000);
    return () => clearTimeout(timer);
  }, [status]);

  useFocusEffect(useCallback(() => {
    let active = true;
    const focusedAt = new Date();
    setNow(focusedAt);
    setStage('hidden');
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
  const recent = healthy.filter((note) => note.id !== current?.id).slice(0, 3);
  const upcoming = useMemo(
    () => healthy
      .filter((note) => note.nextRecallAt && !due.some((item) => item.id === note.id))
      .sort((a, b) => (a.nextRecallAt || '').localeCompare(b.nextRecallAt || ''))[0],
    [due, healthy],
  );
  const upcomingCopy = upcoming?.nextRecallAt ? nextUpcomingRecallMessage(upcoming.nextRecallAt) : undefined;
  const stackRatings = width < 390 || fontScale >= 1.3;
  const stackActions = width < 360 || fontScale >= 1.5;

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
    setStage('hidden');
    setNow(new Date());
  };

  const offerReminder = async (firstReturn: boolean) => {
    if (!firstReturn || Platform.OS === 'web') return;
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
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This memory could not be updated');
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
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This memory could not be moved');
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
      if (mounted.current) setError(cause instanceof Error ? cause.message : 'This memory could not be updated');
    } finally {
      savingRef.current = false;
      if (mounted.current) setSaving(false);
    }
  };

  const actions = (note: MemoryNote) => Alert.alert('Memory', undefined, [
    { text: 'Open memory', onPress: () => router.push({ pathname: '/note/[id]', params: { id: note.id } }) },
    { text: 'Stop resurfacing', onPress: () => { void stop(); } },
    { text: 'Cancel', style: 'cancel' },
  ]);

  const enableReminders = async () => {
    const currentPermission = await checkNotificationPermission();
    const permission = currentPermission === 'granted' ? currentPermission : await requestNotificationPermission();
    setReminderPrompt(false);
    if (permission !== 'granted') return;
    const prefs = await readReminderPreferences();
    await writeReminderPreferences({ ...prefs, enabled: true, promptedAfterReview: true });
    await reconcileRecallReminder(notes);
    if (mounted.current) setStatus('Quiet reminders are on.');
  };

  if (!hydrated || !session) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><LoadingState label="Opening your memories…" /></SafeAreaView>;
  }
  if (openError) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><ErrorState title="Couldn't open your memories" body={openError} hint="Your memories were left unchanged. Close and reopen Stories to try again." /></SafeAreaView>;
  }

  const sessionDone = capped && due.length > 0;
  const tabBar = tabBarMetrics(insets.bottom, Platform.OS === 'ios');
  const subtitle = healthy.length === 0
    ? 'Keep the good moments available.'
    : current
      ? (due.length > visibleDue ? 'A few memories are back today.' : `${visibleDue} ${visibleDue === 1 ? 'memory is' : 'memories are'} back today.`)
      : sessionDone
        ? 'That’s enough for today.'
        : 'Nothing needs your attention right now.';

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <AppText accessibilityRole="header" variant="display">{timeGreeting()}</AppText>
          <AppText variant="supporting" tone="secondary" style={styles.subtitle}>{subtitle}</AppText>
        </View>

        {healthy.length === 0 ? (
          <View style={styles.firstUse}>
            <View style={styles.hero}>{symbol('quote.bubble.fill', 'chat_bubble')}</View>
            <AppText variant="title">Save it now. Tell it later.</AppText>
            <AppText variant="body" tone="secondary" style={styles.firstCopy}>Stories brings useful moments and ideas back with a small clue. Try telling them before you look.</AppText>
            <Button label="Save your first memory" leading={symbol('plus', 'add', colors.onAction)} onPress={() => router.navigate('/capture')} style={styles.firstButton} />
          </View>
        ) : null}

        {current ? (
          <View style={styles.section}>
            <SectionHeader>Back today</SectionHeader>
            <Card accent>
              <View style={styles.reviewTop}>
                <View style={styles.smallIcon}>{symbol('bubble.left.fill', 'chat_bubble')}</View>
                <AppText variant="metadata" tone="secondary" style={styles.age}>{memoryAgeLabel(current.createdAt, now)}</AppText>
                <IconButton accessibilityLabel="Memory options" disabled={saving} onPress={() => actions(current)}>
                  <SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={sizes.standardIcon} tintColor={colors.textSecondary} />
                </IconButton>
              </View>

              {stage === 'hidden' ? (
                <>
                  <AppText accessibilityRole="header" variant="title" style={styles.cue}>{storyCue(current.body)}</AppText>
                  <View style={styles.tell}>
                    {symbol('quote.bubble', 'chat_bubble_outline', colors.textSecondary)}
                    <AppText variant="supporting" tone="secondary" style={styles.flex}>Try telling it without looking. Out loud if you can.</AppText>
                  </View>
                  <View style={[styles.actions, stackActions && styles.actionsStack]}>
                    <Button disabled={saving} label="Reveal" leading={symbol('eye', 'visibility', colors.onAction)} onPress={() => setStage('revealed')} style={stackActions ? styles.fullWidth : styles.flex} />
                    <Button disabled={saving} label="Tomorrow" leading={symbol('clock', 'schedule')} variant="text" onPress={() => { void tomorrow(); }} style={stackActions ? styles.fullWidth : undefined} />
                  </View>
                </>
              ) : (
                <View accessibilityLiveRegion="polite">
                  <View style={styles.original}><MemoryText body={current.body} /></View>
                  <AppText variant="section" style={styles.ratingTitle}>Could you tell it?</AppText>
                  <View style={[styles.ratings, stackRatings && styles.ratingsStack]}>
                    {(['forgot', 'partial', 'remembered'] as const).map((result) => (
                      <Button
                        key={result}
                        disabled={saving}
                        label={recallResultLabel(result)}
                        variant={result === 'remembered' ? 'primary' : 'secondary'}
                        onPress={() => { void complete(result); }}
                        style={stackRatings ? styles.fullWidth : styles.rating}
                      />
                    ))}
                  </View>
                </View>
              )}
            </Card>
            {error ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{error}</AppText> : null}
          </View>
        ) : sessionDone ? (
          <Card style={styles.done}>
            <View style={styles.doneRow}>
              <View style={styles.smallIcon}>{symbol('checkmark', 'check', colors.success)}</View>
              <View style={styles.flex}>
                <AppText variant="section">Done for today</AppText>
                <AppText variant="supporting" tone="secondary" style={styles.tinyTop}>Five is enough. The rest can wait until tomorrow.</AppText>
              </View>
            </View>
          </Card>
        ) : upcomingCopy ? (
          <View style={styles.upcoming}>
            {symbol('clock.arrow.circlepath', 'history', colors.textSecondary)}
            <AppText variant="supporting" tone="secondary" style={styles.flex}>{upcomingCopy}</AppText>
          </View>
        ) : null}

        {reminderPrompt ? (
          <Card style={styles.reminder}>
            <View style={styles.doneRow}>
              <View style={styles.smallIcon}>{symbol('bell', 'notifications')}</View>
              <View style={styles.flex}>
                <AppText variant="section">Want a quiet reminder?</AppText>
                <AppText variant="supporting" tone="secondary" style={styles.tinyTop}>We’ll only nudge you when something is ready to come back.</AppText>
              </View>
            </View>
            <View style={[styles.actions, stackActions && styles.actionsStack]}>
              <Button label="Turn on" onPress={() => { void enableReminders(); }} style={stackActions ? styles.fullWidth : styles.flex} />
              <Button label="Not now" variant="text" onPress={() => setReminderPrompt(false)} style={stackActions ? styles.fullWidth : undefined} />
            </View>
          </Card>
        ) : null}

        {healthy.length > 0 ? (
          <View style={styles.section}>
            <Button label="New memory" leading={symbol('plus', 'add', current ? colors.action : colors.onAction)} variant={current ? 'secondary' : 'primary'} onPress={() => router.navigate('/capture')} />
          </View>
        ) : null}

        {recent.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader>Recent</SectionHeader>
            {recent.map((note, index) => (
              <ListRow
                key={note.id}
                accessibilityLabel={`Open ${memoryTitle(note.body)}`}
                metadata={shortDateLabel(note.updatedAt)}
                onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                showTopDivider={index > 0}
                title={memoryTitle(note.body)}
                trailing={<SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />}
              />
            ))}
            {healthy.length > recent.length ? <Button label="Search Library" leading={symbol('magnifyingglass', 'search')} variant="text" onPress={() => router.navigate('/(tabs)/files')} /> : null}
          </View>
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
  hero: { alignItems: 'center', backgroundColor: colors.actionMuted, borderRadius: radii.card, height: 56, justifyContent: 'center', marginBottom: spacing.lg, width: 56 },
  firstCopy: { marginTop: spacing.sm, maxWidth: 360 },
  firstButton: { marginTop: spacing.xl },
  section: { marginTop: spacing.xxl },
  reviewTop: { alignItems: 'center', flexDirection: 'row' },
  smallIcon: { alignItems: 'center', backgroundColor: colors.actionMuted, borderRadius: radii.compact, height: 36, justifyContent: 'center', marginRight: spacing.sm, width: 36 },
  age: { flex: 1, fontWeight: '600', letterSpacing: 0.2 },
  cue: { marginTop: spacing.lg },
  tell: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  flex: { flex: 1 },
  fullWidth: { width: '100%' },
  actions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  actionsStack: { alignItems: 'stretch', flexDirection: 'column' },
  original: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.md, paddingTop: spacing.lg },
  ratingTitle: { marginTop: spacing.md },
  ratings: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  ratingsStack: { flexDirection: 'column' },
  rating: { flex: 1, paddingHorizontal: spacing.xs },
  error: { marginTop: spacing.sm },
  done: { marginTop: spacing.xxl },
  doneRow: { alignItems: 'center', flexDirection: 'row' },
  tinyTop: { marginTop: spacing.xxs },
  upcoming: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xl },
  reminder: { marginTop: spacing.lg },
  snackbar: { left: spacing.lg, position: 'absolute', right: spacing.lg },
});
