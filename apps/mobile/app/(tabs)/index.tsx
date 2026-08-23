import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ColorValue } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appendRecallReflection, deferRecall, dueRecalls, gradeRecall } from '@core/recall';
import type { MemoryKind, MemoryNote, RecallStatus } from '@core/model';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles } from '@/src/ui/theme';
import { noteKindLabel } from '@/src/ui/MarkdownBody';

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
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function todayDate() {
  return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

function kindIcon(kind: MemoryKind): AppSymbol {
  return kind === 'book-learning' ? icons.book : kind === 'experience' ? icons.experience : icons.edit;
}

export default function TodayScreen() {
  const router = useRouter();
  const { hydrated, notes, openError, saveNote } = useVault();
  const [now, setNow] = useState(() => new Date());
  const [recallStage, setRecallStage] = useState<RecallStage>('cue');
  const [activeRecallId, setActiveRecallId] = useState<string>();
  const [activeRecallVersion, setActiveRecallVersion] = useState<string>();
  const [reflection, setReflection] = useState('');
  const [recallMessage, setRecallMessage] = useState('');
  const [recallError, setRecallError] = useState('');
  const [savingRecall, setSavingRecall] = useState(false);
  const mountedRef = useRef(true);
  const savingRecallRef = useRef(false);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useFocusEffect(useCallback(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => {
      clearInterval(timer);
      appStateSubscription.remove();
    };
  }, []));

  const dueNotes = useMemo(() => dueRecalls(notes, now), [notes, now]);
  const activeCandidate = dueNotes.find((note) => note.id === activeRecallId);
  const activeDueNote = activeCandidate && activeCandidate.updatedAt === activeRecallVersion ? activeCandidate : undefined;
  const dueNote = activeDueNote || dueNotes[0];
  const visibleRecallStage = activeDueNote ? recallStage : 'cue';
  const duePosition = Math.max(1, dueNotes.findIndex((note) => note.id === dueNote?.id) + 1);
  const recentNotes = notes.filter((note) => note.id !== dueNote?.id).slice(0, 3);

  const startRecall = (note: MemoryNote) => {
    setActiveRecallId(note.id);
    setActiveRecallVersion(note.updatedAt);
    setRecallStage('attempt');
    setReflection('');
    setRecallMessage('');
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
      setRecallMessage('Recall saved. It will return at the right time.');
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
      setRecallMessage('Moved to tomorrow.');
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text accessibilityRole="header" style={sharedStyles.title}>Today</Text>
            <Text style={sharedStyles.subtitle}>{todayDate()}</Text>
          </View>
        </View>

        <Text style={sharedStyles.sectionLabel}>Capture</Text>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/capture')} style={styles.captureRow}>
          <Icon name={icons.edit} size={25} />
          <Text style={styles.captureTitle}>What is worth keeping?</Text>
          <Icon name={icons.add} size={22} />
        </Pressable>
        <View style={styles.quickKindRow}>
          <QuickCapture
            icon={icons.book}
            label="Book learning"
            onPress={() => router.navigate({ pathname: '/capture', params: { kind: 'book-learning' } })}
          />
          <QuickCapture
            icon={icons.experience}
            label="Experience"
            onPress={() => router.navigate({ pathname: '/capture', params: { kind: 'experience' } })}
          />
        </View>

        {recallMessage ? (
          <View accessibilityLiveRegion="polite" style={styles.successMessage}>
            <Icon color={colors.green} name={icons.check} size={18} />
            <Text style={styles.successText}>{recallMessage}</Text>
          </View>
        ) : null}

        {dueNote ? (
          <View style={styles.section}>
            <Text style={sharedStyles.sectionLabel}>Due recall</Text>
            <View style={styles.recallCard}>
              <View style={styles.recallHeader}>
                <View style={styles.recallIcon}><Icon name={kindIcon(dueNote.kind)} size={23} /></View>
                <View style={styles.recallCopy}>
                  <Text accessibilityRole="header" style={styles.recallTitle}>{recallCue(dueNote)}</Text>
                  <Text style={styles.recallMeta}>
                    {dueNote.source || noteKindLabel(dueNote)} · {duePosition} of {dueNotes.length}
                  </Text>
                </View>
              </View>

              <View style={styles.recallDivider} />

              {visibleRecallStage === 'cue' ? (
                <View style={styles.recallActions}>
                  <Pressable accessibilityRole="button" disabled={savingRecall} onPress={() => startRecall(dueNote)} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Try to recall</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" disabled={savingRecall} onPress={() => { void postponeRecall(); }} style={styles.laterButton}>
                    <Icon name={icons.later} size={19} />
                    <Text style={styles.laterText}>Later</Text>
                  </Pressable>
                </View>
              ) : visibleRecallStage === 'attempt' ? (
                <View accessibilityLiveRegion="polite" style={styles.attemptBlock}>
                  <Icon name={icons.lightbulb} size={21} />
                  <Text style={styles.attemptText}>Say the idea in your own words. The note is still hidden.</Text>
                  <Pressable accessibilityRole="button" onPress={() => setRecallStage('revealed')} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Reveal memory</Text>
                  </Pressable>
                </View>
              ) : (
                <View accessibilityLiveRegion="polite" style={styles.revealBlock}>
                  <Text style={styles.revealedBody}>{dueNote.body}</Text>
                  <TextInput
                    accessibilityLabel="Optional recall reflection"
                    editable={!savingRecall}
                    multiline
                    onChangeText={setReflection}
                    placeholder="Optional: what came to mind?"
                    placeholderTextColor={colors.muted}
                    style={styles.reflectionInput}
                    textAlignVertical="top"
                    value={reflection}
                  />
                  <Text style={styles.ratingPrompt}>How well did you remember it?</Text>
                  <View accessibilityRole="radiogroup" accessibilityLabel="Recall result" style={styles.ratingRow}>
                    {(['forgot', 'partial', 'remembered'] as const).map((status) => (
                      <Pressable key={status} accessibilityRole="button" disabled={savingRecall} onPress={() => { void saveRecall(status); }} style={styles.ratingButton}>
                        <Text style={styles.ratingText}>{status === 'partial' ? 'Partly' : status[0].toUpperCase() + status.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
            {recallError ? <Text accessibilityRole="alert" style={styles.error}>{recallError}</Text> : null}
          </View>
        ) : null}

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
                    <Text numberOfLines={1} style={styles.recentTitle}>{note.title}</Text>
                    <Text style={styles.recentSubtitle}>{noteKindLabel(note)} · {displayDate(note.updatedAt)}</Text>
                  </View>
                  <Icon color={colors.muted} name={icons.chevron} size={19} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCapture({ icon, label, onPress }: { icon: AppSymbol; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={`Capture a ${label.toLowerCase()}`} accessibilityRole="button" onPress={onPress} style={styles.quickKindButton}>
      <Icon name={icon} size={22} />
      <Text style={styles.quickKindText}>{label}</Text>
      <Icon color={colors.muted} name={icons.chevron} size={18} />
    </Pressable>
  );
}

function recallCue(note: MemoryNote): string {
  if (note.recallPrompt) return note.recallPrompt;
  if (note.kind === 'book-learning') return 'What idea from this book did you want to remember?';
  if (note.kind === 'experience') return 'What changed in this experience?';
  return 'What did you want to remember?';
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 36, paddingHorizontal: 20, paddingTop: 18 },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 16 },
  errorTitle: { color: colors.ink, fontSize: 21, fontWeight: '700', textAlign: 'center' },
  errorCopy: { marginTop: 10, maxWidth: 310, textAlign: 'center' },
  errorHint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 310, textAlign: 'center' },
  header: { marginBottom: 32 },
  captureRow: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 13, minHeight: 64, paddingHorizontal: 15 },
  captureTitle: { color: colors.muted, flex: 1, fontSize: 17 },
  quickKindRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  quickKindButton: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 13, borderWidth: 1, flex: 1, flexDirection: 'row', gap: 10, minHeight: 58, paddingHorizontal: 12 },
  quickKindText: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 18 },
  section: { marginTop: 29 },
  successMessage: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 14 },
  successText: { color: colors.green, flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  recallCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, padding: 16 },
  recallHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 12 },
  recallIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  recallCopy: { flex: 1 },
  recallTitle: { color: colors.ink, fontSize: 17, fontWeight: '600', lineHeight: 22 },
  recallMeta: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5 },
  recallDivider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginVertical: 15 },
  recallActions: { gap: 8 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 11, justifyContent: 'center', minHeight: 48, paddingHorizontal: 16 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  laterButton: { alignItems: 'center', flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 46 },
  laterText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  attemptBlock: { gap: 13 },
  attemptText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  revealBlock: { gap: 13 },
  revealedBody: { color: colors.ink, fontSize: 16, lineHeight: 25 },
  reflectionInput: { borderColor: colors.line, borderRadius: 11, borderWidth: 1, color: colors.ink, fontSize: 15, lineHeight: 21, minHeight: 78, paddingHorizontal: 12, paddingVertical: 10 },
  ratingPrompt: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', gap: 7 },
  ratingButton: { alignItems: 'center', borderColor: colors.line, borderRadius: 10, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 6 },
  ratingText: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, marginTop: 10 },
  recentList: { borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  recentRow: { alignItems: 'center', flexDirection: 'row', minHeight: 68, paddingVertical: 10 },
  recentRowBorder: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  recentIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 21, height: 42, justifyContent: 'center', marginRight: 12, width: 42 },
  recentCopy: { flex: 1, paddingRight: 10 },
  recentTitle: { color: colors.ink, fontSize: 16, fontWeight: '600', lineHeight: 21 },
  recentSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
