import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scheduleFirstRecall } from '@core/recall';
import { markStoryTold, storyReadiness, storyReadinessLabel } from '@core/story-state';
import { memoryTitle, plainStoryText } from '@core/story-cue';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { MemoryEditor } from '@/src/ui/MemoryEditor';
import { AppText } from '@/src/ui/components/AppText';
import { ActionSheet, type ActionSheetAction } from '@/src/ui/components/ActionSheet';
import { Button } from '@/src/ui/components/Button';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

type NavigationAction = unknown;
type BeforeRemoveEvent = { data: { action: NavigationAction }; preventDefault: () => void };
type Navigation = {
  dispatch: (action: NavigationAction) => void;
  addListener: (event: 'beforeRemove', listener: (event: BeforeRemoveEvent) => void) => () => void;
};

function returnLabel(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return `Back ${date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export default function NoteScreen() {
  const router = useRouter();
  const navigation = useNavigation<Navigation>();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { hydrated, notes, openError, saveNote, deleteNote } = useVault();
  const note = notes.find((item) => item.id === noteId);

  const [draft, setDraft] = useState('');
  const [persistedBody, setPersistedBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const [actionsOpen, setActionsOpen] = useState(false);

  const mountedRef = useRef(true);
  const loadedIdRef = useRef<string | undefined>(undefined);
  const latestBodyRef = useRef('');
  const persistedBodyRef = useRef('');
  const saveRequestedRef = useRef(false);
  const saveLoopRef = useRef<Promise<void> | null>(null);
  const allowNextRemovalRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!outcomeMessage) return undefined;
    const timer = setTimeout(() => setOutcomeMessage(''), 6_000);
    return () => clearTimeout(timer);
  }, [outcomeMessage]);

  useEffect(() => {
    if (!note || loadedIdRef.current === note.id) return;
    const body = plainStoryText(note.body);
    loadedIdRef.current = note.id;
    latestBodyRef.current = body;
    persistedBodyRef.current = body;
    dirtyRef.current = false;
    setDraft(body);
    setPersistedBody(body);
    setSaveError('');
  }, [note]);

  const runSaveLoop = useCallback((): Promise<void> => {
    if (!note) return Promise.resolve();
    saveRequestedRef.current = true;
    if (saveLoopRef.current) return saveLoopRef.current;

    const loop = (async () => {
      if (mountedRef.current) setSaving(true);
      while (saveRequestedRef.current) {
        saveRequestedRef.current = false;
        const body = latestBodyRef.current;
        if (!body.trim() || body === persistedBodyRef.current) continue;
        try {
          await saveNote({ id: note.id, title: memoryTitle(body), body });
          persistedBodyRef.current = body;
          dirtyRef.current = latestBodyRef.current !== body;
          if (mountedRef.current) {
            setPersistedBody(body);
            setSaveError('');
          }
        } catch (error) {
          if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be saved');
          throw error;
        }
      }
    })().finally(() => {
      saveLoopRef.current = null;
      if (mountedRef.current) setSaving(false);
    });

    saveLoopRef.current = loop;
    return loop;
  }, [note, saveNote]);

  useEffect(() => {
    if (!note || !draft.trim() || draft === persistedBody || leaving || deleting) return undefined;
    const timer = setTimeout(() => { void runSaveLoop(); }, 650);
    return () => clearTimeout(timer);
  }, [deleting, draft, leaving, note, persistedBody, runSaveLoop]);

  const flushLatest = useCallback(async () => {
    if (!latestBodyRef.current.trim()) throw new Error('A story cannot be empty');
    await runSaveLoop();
    if (latestBodyRef.current !== persistedBodyRef.current) await runSaveLoop();
  }, [runSaveLoop]);

  const restoreSavedBody = useCallback(() => {
    const saved = persistedBodyRef.current;
    latestBodyRef.current = saved;
    dirtyRef.current = false;
    setDraft(saved);
    setSaveError('');
  }, []);

  useEffect(() => navigation.addListener('beforeRemove', (event) => {
    if (allowNextRemovalRef.current) {
      allowNextRemovalRef.current = false;
      return;
    }
    if (!dirtyRef.current && !saveLoopRef.current) return;

    event.preventDefault();
    if (!latestBodyRef.current.trim()) {
      Alert.alert('Story can’t be empty', 'Restore the last saved version or keep writing.', [
        { text: 'Keep writing', style: 'cancel' },
        { text: 'Restore saved version', onPress: restoreSavedBody },
      ]);
      return;
    }

    setLeaving(true);
    void flushLatest()
      .then(() => {
        allowNextRemovalRef.current = true;
        navigation.dispatch(event.data.action);
      })
      .catch(() => {
        if (mountedRef.current) setLeaving(false);
      });
  }), [flushLatest, navigation, restoreSavedBody]);

  const leaveNote = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/files');
  };

  const tryTelling = async () => {
    if (!note || deleting || leaving) return;
    setSaveError('');
    try {
      await flushLatest();
      if (!mountedRef.current) return;
      router.push({ pathname: '/practice/[id]', params: { id: note.id, from: 'memory' } });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be opened');
    }
  };

  const markAsTold = async () => {
    if (!note || deleting || leaving) return;
    setSaveError('');
    try {
      await flushLatest();
      const latestNote = { ...note, body: latestBodyRef.current };
      await saveNote(markStoryTold(latestNote));
      if (mountedRef.current) setOutcomeMessage('Nice. That’s what Stories is for.');
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be updated');
    }
  };

  const stopReturning = async () => {
    if (!note) return;
    setSaveError('');
    try {
      await flushLatest();
      await saveNote({ id: note.id, body: latestBodyRef.current, nextRecallAt: undefined });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be updated');
    }
  };

  const bringBackSoon = async () => {
    if (!note) return;
    setSaveError('');
    try {
      await flushLatest();
      await saveNote({
        id: note.id,
        body: latestBodyRef.current,
        nextRecallAt: scheduleFirstRecall(new Date(), 3),
        recallStatus: undefined,
        lastRecalledAt: undefined,
        reviewStrengthDays: undefined,
      });
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be updated');
    }
  };

  const performDelete = async (id: string) => {
    if (deleting) return;
    setDeleting(true);
    setSaveError('');
    try {
      await deleteNote(id);
      if (!mountedRef.current) return;
      allowNextRemovalRef.current = true;
      router.dismissTo('/(tabs)/files');
    } catch (error) {
      if (mountedRef.current) setSaveError(error instanceof Error ? error.message : 'This story could not be deleted');
    } finally {
      if (mountedRef.current) setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (!note || deleting) return;
    Alert.alert('Delete this story?', 'This permanently removes it from this device. This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void performDelete(note.id); } },
    ]);
  };

  if (!hydrated) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><LoadingState label="Opening story…" /></SafeAreaView>;
  if (openError) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="Couldn't open your stories" body={openError} action={<Button label="Go back" variant="text" onPress={leaveNote} />} /></SafeAreaView>;
  if (!note) return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="This story isn't available" body="It may have been deleted." action={<Button label="Back to Library" variant="text" onPress={() => router.dismissTo('/(tabs)/files')} />} /></SafeAreaView>;

  const returns = returnLabel(note.nextRecallAt);
  const readiness = storyReadiness(note);
  const readinessLabel = storyReadinessLabel(note);
  const sheetActions: ActionSheetAction[] = [
    {
      label: 'Try telling',
      icon: <SymbolView name={{ ios: 'quote.bubble', android: 'chat_bubble', web: 'chat_bubble' }} size={sizes.compactIcon} tintColor={colors.action} />,
      onPress: () => { void tryTelling(); },
    },
    {
      label: 'I told this',
      icon: <SymbolView name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }} size={sizes.compactIcon} tintColor={colors.action} />,
      onPress: () => { void markAsTold(); },
    },
    {
      label: 'Share',
      icon: <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={sizes.compactIcon} tintColor={colors.action} />,
      onPress: () => { void Share.share({ title: memoryTitle(draft), message: draft }); },
    },
    note.nextRecallAt
      ? {
          label: 'Stop resurfacing',
          icon: <SymbolView name={{ ios: 'archivebox', android: 'archive', web: 'archive' }} size={sizes.compactIcon} tintColor={colors.action} />,
          onPress: () => { void stopReturning(); },
        }
      : {
          label: 'Bring back in 3 days',
          icon: <SymbolView name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} size={sizes.compactIcon} tintColor={colors.action} />,
          onPress: () => { void bringBackSoon(); },
        },
    {
      label: 'Delete story',
      destructive: true,
      icon: <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={sizes.compactIcon} tintColor={colors.danger} />,
      onPress: confirmDelete,
    },
  ];

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <TopAppBar
        title=""
        left={<IconButton accessibilityLabel="Go back" disabled={leaving} onPress={leaveNote}><SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} /></IconButton>}
        right={<IconButton accessibilityLabel="More story actions" disabled={deleting || leaving || !draft.trim()} onPress={() => setActionsOpen(true)}><SymbolView name={{ ios: 'ellipsis', android: 'more_vert', web: 'more_vert' }} size={sizes.standardIcon} tintColor={colors.action} /></IconButton>}
      />

      <KeyboardAvoidingView behavior="height" style={styles.editorWrap}>
        <ScrollView contentContainerStyle={styles.editorContent} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">
          <MemoryEditor
            value={draft}
            onChangeText={(body) => {
              latestBodyRef.current = body;
              dirtyRef.current = body !== persistedBodyRef.current;
              setDraft(body);
              if (saveError) setSaveError('');
            }}
            accessibilityLabel="Story"
            placeholder="Write what’s worth telling…"
            editable={!deleting && !leaving}
            minHeight={420}
          />

          <View style={styles.metaRow}>
            <SymbolView name={{ ios: readiness === 'ready' ? 'checkmark.circle' : returns ? 'clock' : 'archivebox', android: readiness === 'ready' ? 'check_circle' : returns ? 'schedule' : 'inventory_2', web: readiness === 'ready' ? 'check_circle' : returns ? 'schedule' : 'inventory_2' }} size={sizes.compactIcon} tintColor={readiness === 'ready' ? colors.action : colors.textSecondary} />
            <View style={styles.metaCopy}>
              <AppText variant="metadata" tone={readiness === 'ready' ? 'action' : 'secondary'}>{readinessLabel}</AppText>
              <AppText variant="metadata" tone="secondary" style={styles.returnMeta}>{returns || 'In Library'}</AppText>
            </View>
            <AppText accessibilityLiveRegion="polite" variant="metadata" tone={saveError ? 'danger' : 'secondary'}>
              {saveError ? 'Save failed' : saving || draft !== persistedBody ? 'Saving…' : 'Saved'}
            </AppText>
          </View>
          {outcomeMessage ? <AppText accessibilityLiveRegion="polite" variant="supporting" tone="action" style={styles.outcome}>{outcomeMessage}</AppText> : null}
          {saveError ? <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={styles.error}>{saveError}</AppText> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <ActionSheet visible={actionsOpen} title="Story" actions={sheetActions} onClose={() => setActionsOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  editorWrap: { flex: 1 },
  editorContent: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  metaRow: { alignItems: 'center', borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg, paddingTop: spacing.md },
  metaCopy: { flex: 1 },
  returnMeta: { marginTop: spacing.xxs },
  outcome: { marginTop: spacing.sm },
  error: { marginTop: spacing.sm },
});
