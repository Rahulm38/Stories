import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MemoryNote } from '@core/model';
import { memoryTitle, storyCue } from '@core/story-cue';
import { matchesLibrarySearch } from '@/src/navigation/library-search';
import { cleanSnippet } from '@/src/navigation/snippet';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { shortDateLabel } from '@/src/recall/presentation';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { EmptyState } from '@/src/ui/components/EmptyState';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { ListRow } from '@/src/ui/components/ListRow';
import { LoadingState } from '@/src/ui/components/LoadingState';

export default function FilesScreen() {
  const router = useRouter();
  const { hydrated, notes, openError, readIssues } = useVault();
  const [query, setQuery] = useState('');

  const visibleNotes = useMemo(() => notes
    .filter((note) => note.parseStatus !== 'quarantine')
    .filter((note) => matchesLibrarySearch(note, query))
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime() || 0;
      const bTime = new Date(b.updatedAt).getTime() || 0;
      return bTime - aTime || a.title.localeCompare(b.title);
    }), [notes, query]);

  if (!hydrated) {
    return <SafeAreaView style={sharedStyles.screen} edges={['top']}><LoadingState label="Opening your memories…" /></SafeAreaView>;
  }

  if (openError) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <ErrorState title="Couldn't open your memories" body={openError} hint="Your memories were left unchanged. Close and reopen Stories to try again." />
      </SafeAreaView>
    );
  }

  if (notes.length === 0 && readIssues.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <View style={[sharedStyles.scrollContent, styles.emptyScreen]}>
          <AppText accessibilityRole="header" variant="display">Library</AppText>
          <EmptyState
            icon={<SymbolView name={{ ios: 'bubble.left.and.bubble.right', android: 'chat_bubble', web: 'chat_bubble' }} size={sizes.primaryIcon} tintColor={colors.action} />}
            title="Your stories start here"
            body="Save moments and ideas you want available when it’s time to tell them."
            action={<Button label="Save your first memory" leading={<SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={sizes.compactIcon} tintColor={colors.onAction} />} onPress={() => router.navigate('/capture')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderMemory = ({ item, index }: { item: MemoryNote; index: number }) => {
    const snippet = cleanSnippet(item.body, item.title) || storyCue(item.body);
    const updated = shortDateLabel(item.updatedAt);
    return (
      <ListRow
        accessibilityLabel={`Open ${memoryTitle(item.body)}`}
        leading={(
          <View style={styles.memoryIcon}>
            <SymbolView name={{ ios: 'quote.bubble', android: 'chat_bubble', web: 'chat_bubble' }} size={sizes.compactIcon} tintColor={colors.action} />
          </View>
        )}
        metadata={updated}
        onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
        showTopDivider={index > 0}
        subtitle={snippet}
        title={memoryTitle(item.body)}
        trailing={<SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.textSecondary} />}
      />
    );
  };

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <FlatList
        data={visibleNotes}
        keyExtractor={(note) => note.id}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={sharedStyles.scrollContent}
        ListHeaderComponent={(
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <AppText accessibilityRole="header" variant="display">Library</AppText>
                <AppText accessibilityLabel={`${notes.length} memories`} variant="supporting" tone="secondary" style={styles.count}>
                  {notes.length} {notes.length === 1 ? 'memory' : 'memories'}
                </AppText>
              </View>
              <Button
                label="New"
                variant="text"
                leading={<SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={sizes.compactIcon} tintColor={colors.action} />}
                onPress={() => router.navigate('/capture')}
              />
            </View>

            {readIssues.length > 0 ? (
              <View accessibilityRole="alert" style={styles.issueBanner}>
                <AppText variant="supporting" tone="danger" style={styles.issueTitle}>
                  {readIssues.length === 1 ? 'One memory could not be opened' : `${readIssues.length} memories could not be opened`}
                </AppText>
                <AppText variant="metadata" tone="secondary" style={styles.issueCopy}>The affected memory was left unchanged. Reopen Stories to retry.</AppText>
              </View>
            ) : null}

            <View style={styles.searchField}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
              <TextInput
                accessibilityLabel="Search memories"
                autoCapitalize="none"
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
            icon={<SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={sizes.primaryIcon} tintColor={colors.action} />}
            title="Nothing matched"
            body="Try a person, place, event, or phrase you remember."
            action={<Button label="Clear search" variant="secondary" onPress={() => setQuery('')} />}
          />
        )}
        renderItem={renderMemory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyScreen: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: spacing.xl },
  headerCopy: { flex: 1 },
  count: { marginTop: spacing.xxs },
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
  memoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.actionMuted,
    borderRadius: radii.compact,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
