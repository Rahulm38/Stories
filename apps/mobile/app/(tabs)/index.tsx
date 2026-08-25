import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ColorValue } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appendRecallReflection, deferRecall, dueRecalls, gradeRecall } from '@core/recall';
import type { MemoryKind, MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles } from '@/src/ui/theme';
import { noteKindLabel } from '@/src/ui/MarkdownBody';
import { nextUpcomingRecallMessage, recallCompletionMessage, recallCue, recallResultLabel, reflectionPrompt, remainingRecallMessage, savedMemoryMessage, shortDateLabel, timeGreeting } from '@/src/recall/presentation';
import { checkNotificationPermission, requestNotificationPermission, type PermissionStatus } from '@/src/notifications/device-permissions';

type RecallStage = 'cue' | 'attempt' | 'revealed';
type AppSymbol = {
  android: 'add' | 'book_2' | 'check_circle' | 'chevron_right' | 'edit_note' | 'lightbulb' | 'person' | 'schedule';
  ios: 'book.closed' | 'checkmark.circle' | 'chevron.right' | 'clock' | 'lightbulb' | 'pencil' | 'person' | 'plus';
};

function Icon({ color = colors.accent, name, size = 22 }: { color?: ColorValue; name: AppSymbol; size?: number }) {
  return <SymbolView name={{ android: name.android, ios: name.ios, web: name.android }} size={size} tintColor={color} />;
}

const icons = {
  add: { android: 'add', ios: 'plus' },
  book: { android: 'book_2', ios: 'book.closed' },
  check: { android: 'check_circle', ios: 'checkmark.circle' },
  chevron: { android: 'chevron_right', ios: 'chevron.right' },
  edit: { android: 'edit_note', ios: 'pencil' },
  experience: { android: 'person', ios: 'person' },
  lightbulb: { android: 'lightbulb', ios: 'lightbulb' },
  later: { android: 'schedule', ios: 'clock' },
} satisfies Record<string, AppSymbol>;

function displayDate(date: string) {
  return shortDateLabel(date) || 'Unknown date';
}


function kindIcon(kind: MemoryKind): AppSymbol {
  return kind === 'book-learning' ? icons.book : kind === 'experience' ? icons.experience : icons.edit;
}

export default function TodayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ nextRecallAt?: string | string[]; saved?: string | string[]; first?: string | string[]; noteId?: string | string[] }>();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [recallStage, setRecallStage] = useState<RecallStage>('cue');
  const [activeRecallId, setActiveRecallId] = useState<string>();
  const [activeRecallVersion, setActiveRecallVersion] = useState<string>();
  const [reflection, setReflection] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [recallError, setRecallError] = useState('');
  const [savingRecall, setSavingRecall] = useState(false);
  const [notifStatus, setNotifStatus] = useState<PermissionStatus>('denied');
  const mountedRef = useRef(true);
  const savingRecallRef = useRef(false);
  const [stageFade] = useState(() => new Animated.Value(1));

  useEffect(() => () => { mountedRef.current = false; }, []);

  const firstParam = Array.isArray(params.first) ? params.first[0] : params.first;
  const noteIdParam = Array.isArray(params.noteId) ? params.noteId[0] : params.noteId;

  useEffect(() => {
    void checkNotificationPermission().then((res) => {
      if (mountedRef.current) setNotifStatus(res);
    });
  }, []);

  useEffect(() => {
    const saved = Array.isArray(params.saved) ? params.saved[0] : params.saved;
    if (saved !== '1' || firstParam === '1') return;

    const nextRecallAt = Array.isArray(params.nextRecallAt) ? params.nextRecallAt[0] : params.nextRecallAt;
    const timer = setTimeout(() => {
      setStatusMessage(savedMemoryMessage(nextRecallAt));
      router.setParams({ nextRecallAt: undefined, saved: undefined });
    }, 0);
    return () => clearTimeout(timer);
  }, [firstParam, params.nextRecallAt, params.saved, router]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(''), 6_000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setNow(new Date());
        void checkNotificationPermission().then((res) => {
          if (mountedRef.current) setNotifStatus(res);
        });
      }
    });
    return () => {
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, []));

  const healthyNotes = useMemo(() => notes.filter((note) => note.parseStatus !== 'quarantine'), [notes]);
  const firstMemoryPromptNote = firstParam === '1' && noteIdParam ? healthyNotes.find((n) => n.id === noteIdParam) : undefined;
  const dueNotes = useMemo(() => dueRecalls(healthyNotes, now), [healthyNotes, now]);
  const activeCandidate = dueNotes.find((note) => note.id === activeRecallId) || (firstMemoryPromptNote && firstMemoryPromptNote.id === activeRecallId ? firstMemoryPromptNote : undefined);
  const activeDueNote = activeCandidate && activeCandidate.updatedAt === activeRecallVersion ? activeCandidate : undefined;
  const dueNote = activeDueNote || dueNotes[0];
  const visibleRecallStage = activeDueNote ? recallStage : 'cue';
  const recentNotes = healthyNotes.filter((note) => note.id !== dueNote?.id).slice(0, 3);

  const upcomingRecallNote = useMemo(() => {
    if (dueNotes.length > 0) return undefined;
    const futureNotes = healthyNotes
      .filter((note) => {
        if (!note.nextRecallAt) return false;
        const time = new Date(note.nextRecallAt).getTime();
        return Number.isFinite(time) && time > now.getTime();
      })
      .sort((a, b) => new Date(a.nextRecallAt!).getTime() - new Date(b.nextRecallAt!).getTime());
    return futureNotes[0];
  }, [dueNotes.length, healthyNotes, now]);

  const upcomingMessage = upcomingRecallNote?.nextRecallAt ? nextUpcomingRecallMessage(upcomingRecallNote.nextRecallAt) : undefined;

  const startRecall = (note: MemoryNote) => {
    Animated.sequence([
      Animated.timing(stageFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(stageFade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setActiveRecallId(note.id);
    setActiveRecallVersion(note.updatedAt);
    setRecallStage('attempt');
    setReflection('');
    setStatusMessage('');
    setRecallError('');
  };

  const saveRecall = async (status: RecallStatus) => {
    if (!dueNote || savingRecallRef.current) return;
    savingRecallRef.current = true;
    const recalledAt = new Date();
    const graded = gradeRecall(dueNote, status, recalledAt);
    setSavingRecall(true);
    setRecallError('');
    try {
      await saveNote({
        ...graded,
        body: appendRecallReflection(graded.body, reflection, recalledAt),
      });
      if (!mountedRef.current) return;
      const remaining = Math.max(0, dueNotes.length - 1);
      setStatusMessage(recallCompletionMessage(graded.nextRecallAt!, remaining));
      setActiveRecallId(undefined);
      setActiveRecallVersion(undefined);
      setRecallStage('cue');
      setReflection('');
      setNow(new Date());
    } catch (error) {
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'The recall result could not be saved');
    } finally {
      savingRecallRef.current = false;
      if (mountedRef.current) setSavingRecall(false);
    }
  };

  const postponeRecall = async () => {
    if (!dueNote || savingRecallRef.current) return;
    savingRecallRef.current = true;
    setSavingRecall(true);
    setRecallError('');
    try {
      await saveNote(deferRecall(dueNote));
      if (!mountedRef.current) return;
      const remaining = Math.max(0, dueNotes.length - 1);
      setStatusMessage(`Moved to tomorrow. ${remainingRecallMessage(remaining)}`);
      setActiveRecallId(undefined);
      setActiveRecallVersion(undefined);
      setRecallStage('cue');
      setReflection('');
      setNow(new Date());
    } catch (error) {
      if (mountedRef.current) setRecallError(error instanceof Error ? error.message : 'This recall could not be moved');
    } finally {
      savingRecallRef.current = false;
      if (mountedRef.current) setSavingRecall(false);
    }
  };

  if (!hydrated) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}><Text style={styles.muted}>Opening your local vault…</Text></SafeAreaView>;
  }

  if (openError) {
    return (
      <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}>
        <Text accessibilityRole="header" style={styles.errorTitle}>Your vault could not be opened</Text>
        <Text accessibilityRole="alert" style={[styles.muted, styles.errorCopy]}>{openError}</Text>
        <Text style={styles.errorHint}>Your files were not replaced. Close and reopen Stories to try again.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View>
              <Text accessibilityRole="header" style={sharedStyles.title}>
                {timeGreeting()}
              </Text>
              <Text style={sharedStyles.subtitle}>Here&apos;s what returns today</Text>
            </View>
          </View>

          {firstMemoryPromptNote && visibleRecallStage === 'cue' ? (
            <View accessibilityLiveRegion="polite" style={styles.firstMemoryCard}>
              <View style={styles.firstMemoryHeader}>
                <View style={styles.firstMemoryIcon}><Icon name={icons.lightbulb} size={22} /></View>
                <View style={styles.firstMemoryCopy}>
                  <Text style={styles.firstMemoryTitle}>Your first memory is saved!</Text>
                  <Text style={styles.firstMemorySubtitle}>
                    {savedMemoryMessage(firstMemoryPromptNote.nextRecallAt)}
                  </Text>
                </View>
              </View>
              <Text style={styles.firstMemoryBody}>
                Want to try a quick practice recall now to see how Stories brings it back?
              </Text>
              <View style={styles.firstMemoryActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    startRecall(firstMemoryPromptNote);
                    router.setParams({ first: undefined, noteId: undefined, saved: undefined, nextRecallAt: undefined });
                  }}
                  style={styles.firstMemoryPrimaryButton}
                >
                  <Text style={styles.firstMemoryPrimaryText}>Try practice recall</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.setParams({ first: undefined, noteId: undefined, saved: undefined, nextRecallAt: undefined })}
                  style={styles.firstMemoryDismissButton}
                >
                  <Text style={styles.firstMemoryDismissText}>Maybe later</Text>
                </Pressable>
              </View>

              {notifStatus === 'denied' ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={async () => {
                    const res = await requestNotificationPermission();
                    setNotifStatus(res);
                  }}
                  style={styles.firstMemoryNotifButton}
                >
                  <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={15} tintColor={colors.accent} />
                  <Text style={styles.firstMemoryNotifText}>Allow quiet device reminders</Text>
                </Pressable>
              ) : notifStatus === 'granted' ? (
                <View style={styles.firstMemoryNotifGranted}>
                  <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={14} tintColor={colors.green} />
                  <Text style={styles.firstMemoryNotifGrantedText}>Quiet recall reminders enabled</Text>
                </View>
              ) : null}
            </View>
          ) : statusMessage ? (
            <View accessibilityLiveRegion="polite" style={styles.successMessage}>
              <Icon color={colors.green} name={icons.check} size={18} />
              <Text style={styles.successText}>{statusMessage}</Text>
            </View>
          ) : null}

          {!dueNote && !firstMemoryPromptNote ? <CaptureEntry isEmpty={notes.length === 0} onPress={() => router.navigate('/capture')} /> : null}

          {!dueNote && upcomingMessage && !firstMemoryPromptNote ? (
            <View style={styles.upcomingSection}>
              <Icon color={colors.accent} name={icons.later} size={16} />
              <Text style={styles.upcomingText}>{upcomingMessage}</Text>
            </View>
          ) : null}

          {dueNote ? (
            <View style={styles.section}>
              <View style={styles.recallSectionHeader}>
                <Text style={sharedStyles.sectionLabel}>Due recall</Text>
                <View style={styles.progressPill}>
                  <Text style={styles.progressText}>{Math.max(0, dueNotes.length - (visibleRecallStage !== 'cue' ? 0 : 0))} due</Text>
                </View>
              </View>
              <Animated.View style={[styles.recallCard, { opacity: stageFade }]}>
                <View style={styles.recallHeader}>
                  <View style={styles.recallIcon}><Icon name={kindIcon(dueNote.kind)} size={23} /></View>
                  <View style={styles.recallCopy}>
                    <Text accessibilityRole="header" style={styles.recallTitle}>{recallCue(dueNote)}</Text>
                    <Text style={styles.recallMeta}>
                      {dueNote.source || noteKindLabel(dueNote)} · {dueNotes.length} due
                    </Text>
                  </View>
                </View>

                <View style={styles.recallDivider} />

                {visibleRecallStage === 'cue' ? (
                  <View style={styles.recallActions}>
                    <Pressable accessibilityRole="button" accessibilityState={{ busy: savingRecall, disabled: savingRecall }} disabled={savingRecall} onPress={() => startRecall(dueNote)} style={[styles.primaryButton, savingRecall && styles.buttonDisabled]}>
                      <Text style={styles.primaryButtonText}>Try to recall</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" accessibilityState={{ busy: savingRecall, disabled: savingRecall }} disabled={savingRecall} onPress={() => { void postponeRecall(); }} style={[styles.laterButton, savingRecall && styles.buttonDisabled]}>
                      <Icon name={icons.later} size={19} />
                      <Text style={styles.laterText}>Tomorrow</Text>
                    </Pressable>
                  </View>
                ) : visibleRecallStage === 'attempt' ? (
                  <View accessibilityLiveRegion="polite" style={styles.attemptBlock}>
                    <Icon name={icons.lightbulb} size={21} />
                    <Text style={styles.attemptText}>Say the idea in your own words. The memory is still hidden.</Text>
                    <Pressable accessibilityRole="button" disabled={savingRecall} onPress={() => { Animated.sequence([Animated.timing(stageFade, { toValue: 0, duration: 120, useNativeDriver: true }), Animated.timing(stageFade, { toValue: 1, duration: 200, useNativeDriver: true })]).start(); setRecallStage('revealed'); }} style={[styles.primaryButton, savingRecall && styles.buttonDisabled]}>
                      <Text style={styles.primaryButtonText}>Reveal memory</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View accessibilityLiveRegion="polite" style={styles.revealBlock}>
                    <Text style={styles.revealedBody}>{dueNote.body}</Text>
                    <TextInput
                      accessibilityLabel="Optional recall reflection"
                      editable={!savingRecall}
                      onChangeText={setReflection}
                      placeholder={reflectionPrompt(dueNote.kind)}
                      placeholderTextColor={colors.muted}
                      style={styles.reflectionInput}
                      value={reflection}
                    />
                    <Text style={styles.ratingPrompt}>How well did you remember it?</Text>
                    <View style={styles.ratingRow}>
                      {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                        <Pressable
                          accessibilityHint="Saves this recall result immediately"
                          accessibilityLabel={savingRecall ? `Saving ${recallResultLabel(status)} recall` : `Mark recall ${recallResultLabel(status)}`}
                          accessibilityRole="button"
                          accessibilityState={{ busy: savingRecall, disabled: savingRecall }}
                          disabled={savingRecall}
                          key={status}
                          onPress={() => { void saveRecall(status); }}
                          style={[styles.ratingButton, savingRecall && styles.buttonDisabled]}
                        >
                          <Text style={styles.ratingText}>{recallResultLabel(status)}</Text>
                        </Pressable>
                      ))}
                    </View>
                    {savingRecall ? <Text accessibilityLiveRegion="polite" style={styles.savingStatus}>Saving recall…</Text> : null}
                  </View>
                )}
              </Animated.View>
              {recallError ? <Text accessibilityRole="alert" style={styles.error}>{recallError}</Text> : null}
            </View>
          ) : null}

          {dueNote ? <CaptureEntry isEmpty={false} onPress={() => router.navigate('/capture')} /> : null}

          {recentNotes.length > 0 ? (
            <View style={styles.section}>
              <Text style={sharedStyles.sectionLabel}>Recent</Text>
              <View style={styles.recentList}>
                {recentNotes.map((note, index) => (
                  <Pressable
                    key={note.id}
                    accessibilityLabel={`Open ${note.title}`}
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: '/note/[id]', params: { id: note.id } })}
                    style={[styles.recentRow, index > 0 && styles.recentRowBorder]}
                  >
                    <View style={styles.recentIcon}><Icon name={kindIcon(note.kind)} size={21} /></View>
                    <View style={styles.recentCopy}>
                      <Text numberOfLines={2} style={styles.recentTitle}>{note.title}</Text>
                      <Text style={styles.recentSubtitle}>{noteKindLabel(note)} · {displayDate(note.updatedAt)}</Text>
                    </View>
                    <Icon color={colors.muted} name={icons.chevron} size={19} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <Pressable
        accessibilityLabel="New memory"
        accessibilityRole="button"
        onPress={() => router.navigate('/capture')}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={24} tintColor={colors.onAction} />
      </Pressable>
    </SafeAreaView>
  );
}

function CaptureEntry({ isEmpty, onPress }: { isEmpty: boolean; onPress: () => void }) {
  return (
    <View style={styles.captureSection}>
      <Text style={sharedStyles.sectionLabel}>Capture</Text>
      {isEmpty ? <Text style={styles.emptyPromise}>Save something worth remembering. Stories will bring it back later.</Text> : null}
      <Pressable accessibilityRole="button" onPress={onPress} style={styles.captureRow}>
        <Icon name={icons.edit} size={25} />
        <Text style={styles.captureTitle}>What is worth remembering?</Text>
        <Icon name={icons.add} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 36, paddingHorizontal: 20, paddingTop: 18 },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 16 },
  errorTitle: { color: colors.ink, fontSize: 21, fontWeight: '700', textAlign: 'center' },
  errorCopy: { marginTop: 10, maxWidth: 310, textAlign: 'center' },
  errorHint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310, textAlign: 'center' },
  header: { marginBottom: 0 },
  section: { marginTop: 29 },
  recallSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  progressPill: { backgroundColor: colors.accentSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  progressText: { color: colors.accent, fontSize: 12, fontWeight: '600' },
  captureSection: { marginTop: 29 },
  captureRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.controlLine, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 13, minHeight: 64, paddingHorizontal: 15 },
  captureTitle: { color: colors.muted, flex: 1, fontSize: 17 },
  emptyPromise: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 12, marginTop: -1, maxWidth: 330 },
  firstMemoryCard: { backgroundColor: colors.surface, borderColor: colors.accent, borderRadius: 16, borderWidth: 1.5, marginTop: 16, padding: 18 },
  firstMemoryHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  firstMemoryIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  firstMemoryCopy: { flex: 1 },
  firstMemoryTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  firstMemorySubtitle: { color: colors.muted, fontSize: 13, marginTop: 3 },
  firstMemoryBody: { color: colors.ink, fontSize: 15, lineHeight: 22, marginTop: 14 },
  firstMemoryActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  firstMemoryPrimaryButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 10, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  firstMemoryPrimaryText: { color: colors.onAction, fontSize: 14, fontWeight: '600' },
  firstMemoryDismissButton: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 14 },
  firstMemoryDismissText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  firstMemoryNotifButton: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 10, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 42, marginTop: 12, paddingHorizontal: 12 },
  firstMemoryNotifText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  firstMemoryNotifGranted: { alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', marginTop: 12, paddingVertical: 4 },
  firstMemoryNotifGrantedText: { color: colors.green, fontSize: 12, fontWeight: '600' },
  successMessage: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14 },
  successText: { color: colors.green, flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  recallCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: colors.accentWarm, padding: 16 },
  recallHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  recallIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  recallCopy: { flex: 1 },
  recallTitle: { color: colors.ink, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  recallMeta: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5 },
  recallDivider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginVertical: 15 },
  recallActions: { gap: 8 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 11, justifyContent: 'center', minHeight: 48, paddingHorizontal: 16 },
  primaryButtonText: { color: colors.onAction, fontSize: 15, fontWeight: '600' },
  buttonDisabled: { opacity: 0.52 },
  laterButton: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 46 },
  laterText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  attemptBlock: { gap: 13 },
  attemptText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  revealBlock: { gap: 13 },
  revealedBody: { color: colors.ink, fontSize: 16, lineHeight: 25 },
  reflectionInput: { borderColor: colors.controlLine, borderRadius: 11, borderWidth: 1, color: colors.ink, fontSize: 15, lineHeight: 21, minHeight: 46, paddingHorizontal: 12, paddingVertical: 10 },
  ratingPrompt: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: 7 },
  ratingButton: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 6 },
  ratingText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  savingStatus: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, marginTop: 10 },
  upcomingSection: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 22 },
  upcomingText: { color: colors.muted, fontSize: 14, fontWeight: '500' },
  recentList: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  recentRow: { alignItems: 'center', flexDirection: 'row', minHeight: 68, paddingVertical: 10 },
  recentRowBorder: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  recentIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 21, height: 42, justifyContent: 'center', marginRight: 12, width: 42 },
  recentCopy: { flex: 1, paddingRight: 10 },
  recentTitle: { color: colors.ink, fontSize: 16, fontWeight: '600', lineHeight: 21 },
  recentSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  fab: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 28, bottom: 16, height: 56, justifyContent: 'center', position: 'absolute', right: 16, width: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  fabPressed: { opacity: 0.8 },
});
