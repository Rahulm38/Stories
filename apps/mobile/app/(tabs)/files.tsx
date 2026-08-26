import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MemoryNote } from '@core/model';
import { readyStoryCount, storyReadiness } from '@core/story-state';
import { librarySearchScore } from '@/src/navigation/library-search';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { shortDateLabel } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { EmptyState } from '@/src/ui/components/EmptyState';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { LoadingState } from '@/src/ui/components/LoadingState';
import { StoryListItem } from '@/src/ui/story/StoryListItem';

export default function FilesScreen() {
  const router = useRouter();
  const { hydrated, notes, openError, readIssues } = useVault();
  const [query, setQuery] = useState('');

  const healthyStories = useMemo(() => notes.filter((note) => note.parseStatus !== 'quarantine'), [notes]);
  const readyCount = useMemo(() => readyStoryCount(healthyStories), [healthyStories]);
  const visibleStories = useMemo(() => healthyStories
    .map((note) => ({ note, score: librarySearchScore(note, query) }))
    .filter((item): item is { note: MemoryNote; score: number } => item.score !== null)
    .sort((a, b) => {
      if (query.trim() && a.score !== b.score) return a.score - b.score;
      const aTime = new Date(a.note.updatedAt).getTime() || 0;
      const bTime = new Date(b.note.updatedAt).getTime() || 0;
      return bTime - aTime || a.note.id.localeCompare(b.note.id);
    })
    .map((item) => item.note), [healthyStories, query]);

  if (!hydrated) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><LoadingState label="Opening your stories…" /></SafeAreaView>;
  }

  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <ErrorState title="Couldn't open your stories" body={openError} hint="Your stories were left unchanged. Close and reopen Stories to try again." />
      </SafeAreaView>
    );
  }

  if (healthyStories.length === 0 && readIssues.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <View style={[sharedStyles.scrollContent, styles.emptyScreen]}>
          <AppText accessibilityRole="header" variant="display">Library</AppText>
          <EmptyState
            title="Nothing saved yet"
            body="Stories you save will stay easy to find here."
            action={<Button label="Save your first story" onPress={() => router.navigate('/capture')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <FlatList
        data={visibleStories}
        keyExtractor={(story) => story.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={sharedStyles.scrollContent}
        ListHeaderComponent={(
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <AppText accessibilityRole="header" variant="display">Library</AppText>
                <AppText accessibilityLabel={`${healthyStories.length} stories`} variant="supporting" tone="secondary" style={styles.count}>
                  {healthyStories.length} {healthyStories.length === 1 ? 'story' : 'stories'}
                </AppText>
                {readyCount > 0 ? <AppText variant="metadata" tone="action" style={styles.readyCount}>{readyCount} ready to tell</AppText> : null}
              </View>
              <Button label="New" variant="text" onPress={() => router.navigate('/capture')} />
            </View>

            {readIssues.length > 0 ? (
              <View accessibilityRole="alert" style={styles.issueBanner}>
                <AppText variant="supporting" tone="danger" style={styles.issueTitle}>
                  {readIssues.length === 1 ? 'One story could not be opened' : `${readIssues.length} stories could not be opened`}
                </AppText>
                <AppText variant="metadata" tone="secondary" style={styles.issueCopy}>The affected story was left unchanged. Reopen Stories to retry.</AppText>
              </View>
            ) : null}

            <View style={styles.searchField}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
              <TextInput
                accessibilityLabel="Search stories"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                onChangeText={setQuery}
                placeholder="Search people, places, moments…"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                selectionColor={colors.action}
                style={styles.searchInput}
                value={query}
              />
            </View>
          </>
        )}
        ListEmptyComponent={(
          <EmptyState
            title="Nothing matched"
            body="Try a name, place, or shorter phrase. Small typos are okay."
            action={<Button label="Clear search" variant="tonal" onPress={() => setQuery('')} />}
          />
        )}
        renderItem={({ item, index }) => (
          <StoryListItem
            body={item.body}
            dateLabel={shortDateLabel(item.updatedAt)}
            readinessLabel={storyReadiness(item) === 'ready' ? 'Ready' : undefined}
            onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
            showTopDivider={index > 0}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyScreen: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.xl },
  headerCopy: { flex: 1 },
  count: { marginTop: spacing.xxs },
  readyCount: { marginTop: spacing.xxs },
  issueBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radii.control,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.sm,
  },
  issueTitle: { fontWeight: '700' },
  issueCopy: { marginTop: spacing.xxs },
  searchField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
    minHeight: sizes.touchMinimum,
    paddingHorizontal: spacing.sm,
  },
  searchInput: { color: colors.textPrimary, flex: 1, paddingVertical: spacing.none, ...typography.action, fontWeight: '400' },
});
