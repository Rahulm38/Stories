import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ColorValue } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { appendRecallReflection, deferRecall, dueRecalls, gradeRecall, practiceRecall } from '@core/recall';
import type { MemoryKind, MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { noteKindLabel } from '@/src/ui/MarkdownBody';
import { tabBarMetrics } from '@/src/navigation/tab-bar';
import { nextUpcomingRecallMessage, practiceCompletionMessage, recallCompletionMessage, recallCue, reflectionPrompt, remainingRecallMessage, savedMemoryMessage, shortDateLabel, timeGreeting } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { ListRow } from '@/src/ui/components/ListRow';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { SectionHeader } from '@/src/ui/components/SectionHeader';
import { Snackbar } from '@/src/ui/components/Snackbar';
import { TextField } from '@/src/ui/components/TextField';

type RecallStage = 'cue' | 'attempt' | 'revealed';
type AppSymbol = {
  android: 'add' | 'book_2' | 'chevron_right' | 'edit_note' | 'lightbulb' | 'person' | 'schedule';
  ios: 'book.closed' | 'chevron.right' | 'clock' | 'lightbulb' | 'pencil' | 'person' | 'plus';
};

function Icon({ color = colors.action, name, size = sizes.standardIcon }: { color?: ColorValue; name: AppSymbol; size?: number }) {
  return <SymbolView name={{ android: name.android, ios: name.ios, web: name.android }} size={size} tintColor={color} />;
}

const icons = {
  add: { android: 'add', ios: 'plus' },
  book: { android: 'book_2', ios: 'book.closed' },
  chevron: { android: 'chevron_right', ios: 'chevron.right' },
  edit: { android: 'edit_note', ios: 'pencil' },
  experience: { android: 'person', ios: 'person' },
  lightbulb: { android: 'lightbulb', ios: 'lightbulb' },
  later: { android: 'schedule', ios: 'clock' },
} satisfies Record<string, AppSymbol>;

function kindIcon(kind: MemoryKind): AppSymbol {
  return kind === 'book-learning' ? icons.book : kind === 'experience' ? icons.experience : icons.edit;
}

function ratingLabel(status: RecallStatus) {
  if (status === 'forgot') return 'Forgot';
  if (status === 'partial') return 'Almost';
  return 'Got it';
}

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ nextRecallAt?: string | string[]; saved?: string | string[]; first?: string | string[]; noteId?: string | string[] }>();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [recallStage, setRecallStage] = useState<RecallStage>('cue');
  const [activeRecallId, setActiveRecallId] = useState<string>();
  const [practiceNoteId, setPracticeNoteId] = useState<string>();
  const [reflection, setReflection] = useState('');
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

  const startRecall = (note: MemoryNote, practice = false) => {
    setActiveRecallId(note.id);
    setPracticeNoteId(practice ? note.id : undefined);
    setRecallStage('attempt');
    setReflection('');
    setStatusMessage('');
    setRecallError('');
    if (practice) clearFirstMemoryParams();
  };

  const finishRecallState = () => {
    setActiveRecallId(undefined);
    setPracticeNoteId(undefined);
    setRecallStage('cue');
    setReflection('');
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
        await saveNote(practiceRecall(dueNote, status, reflection, recalledAt));
        if (!mountedRef.current) return;
        setStatusMessage(practiceCompletionMessage(dueNote.nextRecallAt));
      } else {
        const graded = gradeRecall(dueNote, status, recalledAt);
        await saveNote({ ...graded, body: appendRecallReflection(graded.body, reflection, recalledAt) });
        if (!mountedRef.current) return;
        setStatusMessage(recallCompletionMessage(graded.nextRecallAt!, Math.max(0, dueNotes.length - 1)));
      }
      finishRecallState();
    } catch (error) {
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'The recall result could not be saved');
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
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'This recall could not be moved');
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
              {dueNotes.length > 0
                ? `${dueNotes.length} ${dueNotes.length === 1 ? 'memory is' : 'memories are'} ready.`
                : "You're caught up."}
            </AppText>
          </View>

          {firstMemoryPromptNote && !activeRecallId ? (
            <Card style={styles.firstMemoryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.roundIcon}><Icon name={icons.lightbulb} /></View>
                <View style={styles.cardCopy}>
                  <AppText variant="section">Your first memory is saved</AppText>
                  <AppText variant="metadata" tone="secondary" style={styles.metaTop}>{savedMemoryMessage(firstMemoryPromptNote.nextRecallAt)}</AppText>
                </View>
              </View>
              <AppText variant="supporting" tone="secondary" style={styles.firstMemoryBody}>
                {'Try the recall flow once now. Practice won\'t change its return date.'}
              </AppText>
              <View style={styles.firstMemoryActions}>
                <Button label="Try practice recall" onPress={() => startRecall(firstMemoryPromptNote, true)} style={styles.flexButton} />
                <Button label="Later" variant="text" onPress={clearFirstMemoryParams} />
              </View>
            </Card>
          ) : null}

          {dueNote ? (
            <View style={styles.section}>
              <SectionHeader>{isPractice ? 'Practice recall' : 'Ready to recall'}</SectionHeader>
              <Card accent>
                <View style={styles.cardHeader}>
                  <View style={styles.roundIcon}><Icon name={kindIcon(dueNote.kind)} /></View>
                  <View style={styles.cardCopy}>
                    <AppText accessibilityRole="header" variant="section">{recallCue(dueNote)}</AppText>
                    <AppText variant="metadata" tone="secondary" style={styles.metaTop}>{dueNote.source || noteKindLabel(dueNote)}</AppText>
                  </View>
                </View>
                <View style={styles.recallDivider} />

                {recallStage === 'cue' ? (
                  <View style={styles.recallActions}>
                    <Button disabled={savingRecall} label="Try to recall" onPress={() => startRecall(dueNote)} style={styles.flexButton} />
                    {!isPractice ? <Button disabled={savingRecall} label="Tomorrow" variant="text" onPress={() => { void postponeRecall(); }} /> : null}
                  </View>
                ) : recallStage === 'attempt' ? (
                  <View accessibilityLiveRegion="polite" style={styles.attemptBlock}>
                    <View style={styles.attemptPrompt}>
                      <Icon name={icons.lightbulb} size={sizes.compactIcon} />
                      <AppText variant="supporting" tone="secondary" style={styles.attemptCopy}>Try saying it in your own words. The memory is still hidden.</AppText>
                    </View>
                    <Button disabled={savingRecall} label="Reveal memory" onPress={() => setRecallStage('revealed')} />
                  </View>
                ) : (
                  <View accessibilityLiveRegion="polite">
                    <AppText variant="body">{dueNote.body}</AppText>
                    <TextField
                      accessibilityLabel="Optional recall reflection"
                      editable={!savingRecall}
                      multiline
                      onChangeText={setReflection}
                      placeholder={reflectionPrompt(dueNote.kind)}
                      style={styles.reflectionInput}
                      value={reflection}
                    />
                    <AppText variant="supporting" style={styles.ratingPrompt}>How well did you remember it?</AppText>
                    <View style={styles.ratingRow}>
                      {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                        <Button
                          accessibilityLabel={`Mark recall ${ratingLabel(status)}`}
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
                    {savingRecall ? <AppText accessibilityLiveRegion="polite" variant="metadata" tone="secondary" style={styles.savingStatus}>Saving recall…</AppText> : null}
                  </View>
                )}
              </Card>
              {recallError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{recallError}</AppText> : null}
            </View>
          ) : upcomingMessage ? (
            <View style={styles.upcomingSection}>
              <Icon color={colors.action} name={icons.later} size={18} />
              <AppText variant="supporting" tone="secondary" style={styles.upcomingCopy}>{upcomingMessage}</AppText>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader>Capture</SectionHeader>
            {notes.length === 0 ? <AppText variant="supporting" tone="secondary" style={styles.emptyPromise}>Save something worth remembering. Stories will bring it back later.</AppText> : null}
            <Button
              label="New memory"
              leading={<Icon name={icons.add} size={sizes.compactIcon} color={dueNote ? colors.action : colors.onAction} />}
              onPress={() => router.navigate('/capture')}
              variant={dueNote ? 'secondary' : 'primary'}
            />
          </View>

          {recentNotes.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader>Recent</SectionHeader>
              {recentNotes.map((note, index) => (
                <ListRow
                  key={note.id}
                  accessibilityLabel={`Open ${note.title}`}
                  leading={<View style={styles.compactIcon}><Icon name={kindIcon(note.kind)} size={sizes.compactIcon} /></View>}
                  metadata={`${noteKindLabel(note)} · ${shortDateLabel(note.updatedAt)}`}
                  onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                  showTopDivider={index > 0}
                  title={note.title}
                  trailing={<Icon color={colors.textSecondary} name={icons.chevron} size={18} />}
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
  section: { marginTop: spacing.xxl },
  firstMemoryCard: { marginTop: spacing.md },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  roundIcon: { alignItems: 'center', backgroundColor: colors.actionMuted, borderRadius: radii.pill, height: 44, justifyContent: 'center', width: 44 },
  compactIcon: { alignItems: 'center', backgroundColor: colors.actionMuted, borderRadius: radii.compact, height: 36, justifyContent: 'center', width: 36 },
  cardCopy: { flex: 1 },
  metaTop: { marginTop: spacing.xxs },
  firstMemoryBody: { marginTop: spacing.md },
  firstMemoryActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  flexButton: { flex: 1 },
  recallDivider: { backgroundColor: colors.divider, height: StyleSheet.hairlineWidth, marginVertical: spacing.md },
  recallActions: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  attemptBlock: { gap: spacing.md },
  attemptPrompt: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs },
  attemptCopy: { flex: 1 },
  reflectionInput: { marginTop: spacing.md, minHeight: 88, textAlignVertical: 'top' },
  ratingPrompt: { fontWeight: '600', marginTop: spacing.md },
  ratingRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  ratingButton: { flex: 1, paddingHorizontal: spacing.xs },
  savingStatus: { marginTop: spacing.xs, textAlign: 'center' },
  error: { marginTop: spacing.sm },
  upcomingSection: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xl },
  upcomingCopy: { flex: 1 },
  emptyPromise: { marginBottom: spacing.sm, maxWidth: 330 },
  snackbarOverlay: { left: 0, position: 'absolute', right: 0 },
});
