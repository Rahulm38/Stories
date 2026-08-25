import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MemoryKind, MemoryNote } from '@core/model';
import { matchesLibrarySearch } from '@/src/navigation/library-search';
import { cleanSnippet } from '@/src/navigation/snippet';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles } from '@/src/ui/theme';
import { noteKindLabel } from '@/src/ui/MarkdownBody';

type Filter = 'all' | MemoryKind;

const FILTERS: ReadonlyArray<{ label: string; value: Filter }> = [
  { label: 'All', value: 'all' },
  { label: 'Books', value: 'book-learning' },
  { label: 'Experiences', value: 'experience' },
  { label: 'Notes', value: 'note' },
];

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
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}><Text style={styles.muted}>Opening Library…</Text></SafeAreaView>;
  }

  if (openError) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}><Text accessibilityRole="alert" style={[styles.muted, styles.error]}>{openError}</Text></SafeAreaView>;
  }

  if (notes.length === 0 && readIssues.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <View style={[sharedStyles.scrollContent, styles.emptyScreen]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={sharedStyles.title}>Library</Text>
            <Pressable accessibilityLabel="New memory" accessibilityRole="button" onPress={() => router.navigate('/capture')} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={colors.accent} />
              <Text style={styles.newButtonText}>New memory</Text>
            </Pressable>
          </View>
          <Text style={styles.emptyCopy}>Your saved memories will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderMemory = ({ item }: { item: MemoryNote }) => {
    const snippet = cleanSnippet(item.body, item.title);
    return (
      <Pressable
        accessibilityLabel={`${item.title}, ${noteKindLabel(item)}`}
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.id } })}
        style={({ pressed }) => [styles.memoryRow, pressed && styles.pressed]}
      >
        <View style={styles.memoryIcon}>
          <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={17} tintColor={colors.accent} />
        </View>
        <View style={styles.memoryCopy}>
          <Text numberOfLines={1} style={styles.memoryTitle}>{item.title}</Text>
          {snippet ? <Text numberOfLines={2} style={styles.memorySnippet}>{snippet}</Text> : null}
          <Text style={styles.memoryMeta}>{item.source ? `${item.source} · ` : ''}{noteKindLabel(item)}</Text>
        </View>
        <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.muted} />
      </Pressable>
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
              <View>
                <Text accessibilityRole="header" style={sharedStyles.title}>Library</Text>
                <Text accessibilityLabel={`${notes.length} memories`} style={styles.count}>{notes.length} {notes.length === 1 ? 'memory' : 'memories'}</Text>
              </View>
              <Pressable accessibilityLabel="New memory" accessibilityRole="button" onPress={() => router.navigate('/capture')} style={({ pressed }) => [styles.newButton, pressed && styles.pressed]}>
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={colors.accent} />
                <Text style={styles.newButtonText}>New</Text>
              </Pressable>
            </View>

            {readIssues.length > 0 ? (
              <View accessibilityRole="alert" style={styles.issueBanner}>
                <Text style={styles.issueTitle}>{readIssues.length === 1 ? 'One memory could not be read' : `${readIssues.length} memories could not be read`}</Text>
                <Text style={styles.issueCopy}>The affected file{readIssues.length === 1 ? ' was' : 's were'} left unchanged. Reopen Stories to retry.</Text>
                {readIssues.slice(0, 2).map((issue) => <Text key={issue.path} numberOfLines={1} style={styles.issuePath}>{issue.path}</Text>)}
              </View>
            ) : null}

            <View style={styles.searchField}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={19} tintColor={colors.muted} />
              <TextInput accessibilityLabel="Search library" autoCapitalize="none" clearButtonMode="while-editing" onChangeText={setQuery} placeholder="Search memories" placeholderTextColor={colors.muted} returnKeyType="search" style={styles.searchInput} value={query} />
            </View>

            <View accessibilityRole="radiogroup" accessibilityLabel="Filter memories" style={styles.filterRow}>
              {FILTERS.map((option) => {
                const selected = filter === option.value;
                return (
                  <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setFilter(option.value)} style={[styles.filterChip, selected && styles.filterChipSelected]}>
                    <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
        ListEmptyComponent={(
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>Nothing matches</Text>
            <Text style={styles.muted}>Try another word or choose a different filter.</Text>
            {normalizedQuery ? <Pressable accessibilityRole="button" onPress={() => setQuery('')} style={styles.clearButton}><Text style={styles.clearButtonText}>Clear search</Text></Pressable> : null}
          </View>
        )}
        renderItem={renderMemory}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  error: { color: colors.danger, maxWidth: 310, textAlign: 'center' },
  emptyScreen: { flex: 1 },
  emptyCopy: { color: colors.muted, fontSize: 16, lineHeight: 23, maxWidth: 290 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  count: { color: colors.muted, fontSize: 14, marginTop: 4 },
  newButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 6, minHeight: 44, paddingHorizontal: 10 },
  newButtonText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  pressed: { opacity: 0.68 },
  issueBanner: { backgroundColor: colors.surface, borderColor: colors.danger, borderRadius: 12, borderWidth: 1, marginBottom: 16, padding: 12 },
  issueTitle: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  issueCopy: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  issuePath: { color: colors.ink, fontSize: 12, marginTop: 6 },
  searchField: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.controlLine, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 48, paddingHorizontal: 14 },
  searchInput: { color: colors.ink, flex: 1, fontSize: 16, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, marginTop: 14 },
  filterChip: { alignItems: 'center', borderColor: colors.controlLine, borderRadius: 999, borderWidth: 1, justifyContent: 'center', minHeight: 40, paddingHorizontal: 13 },
  filterChipSelected: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  filterText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  filterTextSelected: { color: colors.accent },
  memoryRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 76, paddingVertical: 10 },
  memoryIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 8, height: 34, justifyContent: 'center', marginRight: 11, width: 34 },
  memoryCopy: { flex: 1, paddingRight: 10 },
  memoryTitle: { color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  memorySnippet: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  memoryMeta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  noResults: { alignItems: 'flex-start', paddingBottom: 24, paddingTop: 36 },
  noResultsTitle: { color: colors.ink, fontSize: 18, fontWeight: '600', marginBottom: 7 },
  clearButton: { alignItems: 'center', borderColor: colors.accent, borderRadius: 10, borderWidth: 1, justifyContent: 'center', marginTop: 16, minHeight: 44, paddingHorizontal: 14 },
  clearButtonText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
