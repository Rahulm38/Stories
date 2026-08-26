import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storyCue } from '@core/story-cue';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { MemoryText } from '@/src/ui/MemoryText';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Card } from '@/src/ui/components/Card';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { IconButton } from '@/src/ui/components/IconButton';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

type PracticeSource = 'saved' | 'today' | 'memory';
type Stage = 'hidden' | 'revealed';

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[]; from?: string | string[] }>();
  const noteId = Array.isArray(params.id) ? params.id[0] : params.id;
  const sourceValue = Array.isArray(params.from) ? params.from[0] : params.from;
  const source: PracticeSource = sourceValue === 'saved' || sourceValue === 'memory' ? sourceValue : 'today';
  const { hydrated, notes, openError } = useVault();
  const note = notes.find((item) => item.id === noteId && item.parseStatus !== 'quarantine');
  const [stage, setStage] = useState<Stage>('hidden');

  const close = () => {
    if (source === 'saved') {
      router.replace('/(tabs)');
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
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
        title="Try telling"
        left={(
          <IconButton accessibilityLabel="Go back" onPress={close}>
            <SymbolView name={{ android: 'arrow_back', ios: 'chevron.left', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} />
          </IconButton>
        )}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card accent>
          <View style={styles.kicker}>
            <View style={styles.icon}>
              <SymbolView name={{ android: 'chat_bubble', ios: 'quote.bubble.fill', web: 'chat_bubble' }} size={sizes.compactIcon} tintColor={colors.action} />
            </View>
            <AppText variant="metadata" tone="secondary">Practice, not a test</AppText>
          </View>

          {stage === 'hidden' ? (
            <>
              <AppText accessibilityRole="header" variant="title" style={styles.cue}>{storyCue(note.body)}</AppText>
              <AppText variant="body" tone="secondary" style={styles.copy}>Tell the memory in your own words before you look. Exact wording does not matter.</AppText>
              <Button
                label="Reveal original"
                leading={<SymbolView name={{ android: 'visibility', ios: 'eye', web: 'visibility' }} size={sizes.compactIcon} tintColor={colors.onAction} />}
                onPress={() => setStage('revealed')}
                style={styles.primary}
              />
            </>
          ) : (
            <View accessibilityLiveRegion="polite">
              <AppText variant="metadata" tone="secondary">Original memory</AppText>
              <View style={styles.original}><MemoryText body={note.body} /></View>
              <View style={styles.explainer}>
                <SymbolView name={{ android: 'history', ios: 'clock.arrow.circlepath', web: 'history' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
                <AppText variant="supporting" tone="secondary" style={styles.flex}>
                  {source === 'saved'
                    ? 'That’s the loop. We’ll bring this back later when remembering takes more effort.'
                    : 'This practice does not change when the story is scheduled to come back.'}
                </AppText>
              </View>
              <Button label="Done" onPress={close} style={styles.primary} />
              <Button label="Try again" variant="text" onPress={() => setStage('hidden')} style={styles.secondaryAction} />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  kicker: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  icon: { alignItems: 'center', backgroundColor: colors.actionMuted, borderRadius: radii.compact, height: 36, justifyContent: 'center', width: 36 },
  cue: { marginTop: spacing.xl },
  copy: { marginTop: spacing.md },
  primary: { marginTop: spacing.xl, width: '100%' },
  original: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth, marginTop: spacing.sm, paddingTop: spacing.lg },
  explainer: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xl },
  flex: { flex: 1 },
  secondaryAction: { marginTop: spacing.sm, width: '100%' },
});
