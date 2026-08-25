import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MemoryKind, MemoryNote } from '@core/model';
import { matchesLibrarySearch } from '@/src/navigation/library-search';
import { cleanSnippet } from '@/src/navigation/snippet';
import { useVault } from '@/src/vault/provider';
import { colors, radii, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { noteKindLabel } from '@/src/ui/MarkdownBody';
import { AppText } from '@/src/ui/components/AppText';
import { Button } from '@/src/ui/components/Button';
import { Chip } from '@/src/ui/components/Chip';
import { EmptyState } from '@/src/ui/components/EmptyState';
import { ErrorState } from '@/src/ui/components/ErrorState';
import { ListRow } from '@/src/ui/components/ListRow';
import { LoadingState } from '@/src/ui/components/LoadingState';

type Filter = 'all' | MemoryKind;

const FILTERS: ReadonlyArray<{ label: string; value: Filter }> = [
  { label: 'All', value: 'all' },
  { label: 'Books', value: 'book-learning' },
  { label: 'Experiences', value: 'experience' },
  { label: 'Notes', value: 'note' },
];

function memorySymbol(kind: MemoryKind) {
  if (kind === 'book-learning') return { ios: 'book.closed', android: 'book_2', web: 'book_2' } as const;
  if (kind === 'experience') return { ios: 'person', android: 'person', web: 'person' } as const;
  return { ios: 'doc.text', android: 'edit_note', web: 'edit_note' } as const;
}

export default function FilesScreen() {
  const router = useRouter();
  const { hydrated, notes, openError, readIssues } = useVault();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const normalizedQuery = query.trim().toLowerCase();

  const visibleNotes = useMemo(() => notes
    .filter((note) => note.parseStatus !== 'quarantine')
    .filter((note) => filter === 'all' || note.kind === filter)
    .filter((note) => matchesLibrarySearch(note, normalizedQuery))
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime() || 0;
      const bTime = new Date(b.updatedAt).getTime() || 0;
      return bTime - aTime || a.title.localeCompare(b.title);
    }), [filter, normalizedQuery, notes]);

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

  if (notes.length === 0 && readIssues.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <View style={[sharedStyles.scrollContent, styles.emptyScreen]}>
          <AppText accessibilityRole="header" variant="display">Library</AppText>
          <EmptyState
            title="Your memories live here"
            body="Save ideas, lessons and experiences you want to find again."
            action={<Button label="Create your first memory" onPress={() => router.navigate('/capture')} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderMemory = ({ item, index }: { item: MemoryNote; index: number }) => {
    const snippet = cleanSnippet(item.body, item.title);
    const metadata = `${item.source ? `${item.source} · ` : ''}${noteKindLabel(item)}`;
    return (
      <ListRow
        accessibilityLabel={`${item.title}, ${noteKindLabel(item)}`}
        leading={(
          <View style={styles.memoryIcon}>
            <SymbolView name={memorySymbol(item.kind)} size={sizes.compactIcon} tintColor={colors.action} />
          </View>
        )}
        metadata={metadata}
        onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
        showTopDivider={index > 0}
        subtitle={snippet || undefined}
        title={item.title}
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
              <Button label="New" variant="text" onPress={() => router.navigate('/capture')} />
            </View>

            {readIssues.length > 0 ? (
              <View accessibilityRole="alert" style={styles.issueBanner}>
                <AppText variant="supporting" tone="danger" style={styles.issueTitle}>
                  {readIssues.length === 1 ? 'One memory could not be read' : `${readIssues.length} memories could not be read`}
                </AppText>
                <AppText variant="metadata" tone="secondary" style={styles.issueCopy}>
                  The affected file{readIssues.length === 1 ? ' was' : 's were'} left unchanged. Reopen Stories to retry.
                </AppText>
                {readIssues.slice(0, 2).map((issue) => (
                  <AppText key={issue.path} numberOfLines={1} variant="metadata" style={styles.issuePath}>{issue.path}</AppText>
                ))}
              </View>
            ) : null}

            <View style={styles.searchField}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
              <TextInput
                accessibilityLabel="Search library"
                autoCapitalize="none"
                clearButtonMode="while-editing"
                onChangeText={setQuery}
                placeholder="Search memories"
                placeholderTextColor={colors.textSecondary}
                returnKeyType="search"
                selectionColor={colors.action}
                style={styles.searchInput}
                value={query}
              />
            </View>

            <ScrollView
              accessibilityRole="radiogroup"
              accessibilityLabel="Filter memories"
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map((option) => (
                <Chip key={option.value} label={option.label} selected={filter === option.value} onPress={() => setFilter(option.value)} />
              ))}
            </ScrollView>
          </>
        )}
        ListEmptyComponent={(
          <EmptyState
            title="No memories found"
            body="Try another search or filter."
            action={<Button label="Clear filters" variant="secondary" onPress={() => { setQuery(''); setFilter('all'); }} />}
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
  issuePath: { marginTop: spacing.xs },
  searchField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchMinimum,
    paddingHorizontal: spacing.sm,
  },
  searchInput: { color: colors.textPrimary, flex: 1, paddingVertical: 0, ...typography.action, fontWeight: '400' },
  filterRow: { gap: spacing.xs, paddingBottom: spacing.md, paddingTop: spacing.sm },
  memoryIcon: {
    alignItems: 'center',
    backgroundColor: colors.actionMuted,
    borderRadius: radii.compact,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
