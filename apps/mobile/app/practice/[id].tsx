import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storyTrigger } from '@core/story-cue';
import { nextPracticeMemory } from '@/src/recall/practice';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { TopAppBar } from '@/src/ui/components/TopAppBar';
import { StoryRevealSurface } from '@/src/ui/story/StoryRevealSurface';
import { StoryTriggerCard } from '@/src/ui/story/StoryTriggerCard';

type PracticeSource = 'saved' | 'today' | 'memory';
type Stage = 'trigger' | 'revealed';
type PracticeViewState = { noteId?: string; stage: Stage; hintVisible: boolean };

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; from?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sourceValue = Array.isArray(params.from) ? params.from[0] : params.from;
  const source: PracticeSource = sourceValue === 'saved' || sourceValue === 'memory' ? sourceValue : 'today';
  const { hydrated, notes, openError } = useVault();
  const note = notes.find((item) => item.id === noteId && item.parseStatus !== 'quarantine');
  const [viewState, setViewState] = useState<PracticeViewState>(() => ({ noteId, stage: 'trigger', hintVisible: false }));
  const currentView = viewState.noteId === noteId ? viewState : { noteId, stage: 'trigger' as const, hintVisible: false };

  const trigger = useMemo(() => storyTrigger(note?.body || ''), [note?.body]);
  const nextStory = useMemo(() => note ? nextPracticeMemory(notes, note.id) : undefined, [note, notes]);

  const close = () => {
    if (source === 'saved') {
      router.replace('/(tabs)');
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const anotherStory = () => {
    if (!nextStory) return;
    router.replace({ pathname: '/practice/[id]', params: { id: nextStory.id, from: 'today' } });
  };

  if (!hydrated) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><LoadingState label="Opening story…" /></SafeAreaView>;
  }

  if (openError) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="Couldn't open your stories" body={openError} action={<Button label="Go back" variant="text" onPress={close} />} /></SafeAreaView>;
  }

  if (!note) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}><ErrorState title="This story isn't available" body="It may have been deleted." action={<Button label="Go back" variant="text" onPress={close} />} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <TopAppBar
        title="Try a story"
        left={(
          <IconButton accessibilityLabel="Go back" onPress={close}>
            <SymbolView name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} />
          </IconButton>
        )}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {currentView.stage === 'trigger' ? (
          <StoryTriggerCard
            trigger={trigger}
            hintVisible={currentView.hintVisible}
            onNeedHint={trigger.secondary ? () => setViewState({ noteId, stage: 'trigger', hintVisible: true }) : undefined}
            onShowStory={() => setViewState({ noteId, stage: 'revealed', hintVisible: currentView.hintVisible })}
          />
        ) : (
          <Card>
            <StoryRevealSurface body={note.body} />
            <AppText variant="supporting" tone="secondary" style={styles.explainer}>That’s it. We’ll bring it back later.</AppText>
            <Button label="Done" onPress={close} style={styles.primary} />
            {source === 'today' && nextStory ? <Button label="Another story" variant="tonal" onPress={anotherStory} style={styles.secondary} /> : null}
            <Button label="Try again" variant="text" onPress={() => setViewState({ noteId, stage: 'trigger', hintVisible: false })} style={styles.secondary} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  explainer: { marginTop: spacing.lg },
  primary: { marginTop: spacing.lg, width: '100%' },
  secondary: { marginTop: spacing.xs, width: '100%' },
});