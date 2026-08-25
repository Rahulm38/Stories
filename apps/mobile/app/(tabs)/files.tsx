import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { MemoryNote } from '@core/model';
import { dueRecalls } from '@core/recall';
import { matchesLibrarySearch } from '@/src/navigation/library-search';
import { cleanSnippet } from '@/src/navigation/snippet';
import { useVault } from '@/src/vault/provider';
import { colors, sharedStyles } from '@/src/ui/theme';

type FolderNode = {
  count: number;
  name: string;
  notes: MemoryNote[];
  path: string;
  children: FolderNode[];
};

type LibraryRow =
  | { type: 'folder'; key: string; folder: FolderNode; depth: number; expanded: boolean }
  | { type: 'note'; key: string; note: MemoryNote; depth: number; first: boolean }
  | { type: 'folder-empty'; key: string; depth: number };

const REQUIRED_ROOT_FOLDERS = ['Books', 'Experiences', 'Inbox'] as const;

type MutableFolderNode = Omit<FolderNode, 'children'> & {
  children: Map<string, MutableFolderNode>;
};

function canonicalFolderSegments(folder: string): string[] {
  return folder
    .split(/[\\/]+/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment, index) => {
      if (index !== 0) return segment;
      return REQUIRED_ROOT_FOLDERS.find((required) => required.toLowerCase() === segment.toLowerCase()) || segment;
    });
}

function createFolderNode(name: string, path: string): MutableFolderNode {
  return { children: new Map(), count: 0, name, notes: [], path };
}

function folderSort(left: FolderNode, right: FolderNode): number {
  const leftRequired = REQUIRED_ROOT_FOLDERS.indexOf(left.name as typeof REQUIRED_ROOT_FOLDERS[number]);
  const rightRequired = REQUIRED_ROOT_FOLDERS.indexOf(right.name as typeof REQUIRED_ROOT_FOLDERS[number]);
  if (leftRequired !== -1 || rightRequired !== -1) {
    if (leftRequired === -1) return 1;
    if (rightRequired === -1) return -1;
    return leftRequired - rightRequired;
  }
  return left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
}

function finalizeFolder(node: MutableFolderNode): FolderNode {
  const children = Array.from(node.children.values(), finalizeFolder).sort(folderSort);
  return {
    children,
    count: node.notes.length + children.reduce((total, child) => total + child.count, 0),
    name: node.name,
    notes: node.notes,
    path: node.path,
  };
}

function buildFolderTree(notes: MemoryNote[], includeRequiredRoots: boolean): FolderNode[] {
  const root = createFolderNode('', '');

  if (includeRequiredRoots) {
    REQUIRED_ROOT_FOLDERS.forEach((name) => root.children.set(name, createFolderNode(name, name)));
  }

  notes.forEach((note) => {
    const segments = canonicalFolderSegments(note.folder || 'Inbox');
    const safeSegments = segments.length > 0 ? segments : ['Inbox'];
    let parent = root;
    let path = '';

    safeSegments.forEach((name) => {
      path = path ? `${path}/${name}` : name;
      const existing = parent.children.get(name);
      if (existing) {
        parent = existing;
        return;
      }
      const child = createFolderNode(name, path);
      parent.children.set(name, child);
      parent = child;
    });
    parent.notes.push(note);
  });

  return Array.from(root.children.values(), finalizeFolder).sort(folderSort);
}

function flattenFolder(
  folder: FolderNode,
  depth: number,
  expandedFolders: Record<string, boolean>,
  searching: boolean,
  defaultExpandedRootPath?: string,
): LibraryRow[] {
  const expanded = searching
    ? folder.count > 0
    : expandedFolders[folder.path] ?? (folder.path === defaultExpandedRootPath);
  const rows: LibraryRow[] = [{
    type: 'folder',
    key: `folder:${folder.path}`,
    folder,
    depth,
    expanded,
  }];

  if (!expanded) return rows;
  if (folder.count === 0) {
    return searching ? [] : [...rows, { type: 'folder-empty', key: `empty:${folder.path}`, depth }];
  }

  rows.push(...folder.notes.map<LibraryRow>((note, index) => ({
    type: 'note',
    key: `note:${note.id}`,
    note,
    depth,
    first: index === 0,
  })));
  folder.children.forEach((child) => rows.push(...flattenFolder(child, depth + 1, expandedFolders, searching, defaultExpandedRootPath)));
  return rows;
}

export default function FilesScreen() {
  const router = useRouter();
  const { hydrated, notes, openError } = useVault();
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'folders' | 'all'>('folders');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const normalizedQuery = query.trim().toLowerCase();

  const duplicateTitles = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => counts.set(note.title.toLowerCase(), (counts.get(note.title.toLowerCase()) || 0) + 1));
    return new Set(Array.from(counts).filter(([, count]) => count > 1).map(([title]) => title));
  }, [notes]);

  const recallDueIds = useMemo(() => new Set(dueRecalls(notes, new Date()).map((n) => n.id)), [notes]);

  const rows = useMemo<LibraryRow[]>(() => {
    const matchingNotes = normalizedQuery
      ? notes.filter((note) => matchesLibrarySearch(note, normalizedQuery))
      : notes;

    if (viewMode === 'all') {
      const sorted = [...matchingNotes].sort((a, b) => {
        const timeA = new Date(a.updatedAt).getTime() || 0;
        const timeB = new Date(b.updatedAt).getTime() || 0;
        return timeB - timeA || a.title.localeCompare(b.title);
      });
      return sorted.map<LibraryRow>((note, index) => ({
        type: 'note',
        key: `note:${note.id}`,
        note,
        depth: 0,
        first: index === 0,
      }));
    }

    const folderTree = buildFolderTree(matchingNotes, !normalizedQuery);
    const defaultExpandedRootPath = folderTree.find((folder) => folder.count > 0)?.path;
    return folderTree.flatMap((folder) => flattenFolder(folder, 0, expandedFolders, Boolean(normalizedQuery), defaultExpandedRootPath));
  }, [expandedFolders, normalizedQuery, notes, viewMode]);

  const hasSearchResults = !normalizedQuery || rows.some((row) => row.type === 'note');

  if (!hydrated) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}><Text style={styles.muted}>Opening Library…</Text></SafeAreaView>;
  }

  if (openError) {
    return <SafeAreaView style={[sharedStyles.screen, styles.center]} edges={['top']}><Text accessibilityRole="alert" style={[styles.muted, styles.error]}>{openError}</Text></SafeAreaView>;
  }

  if (notes.length === 0) {
    return (
      <SafeAreaView style={sharedStyles.screen} edges={['top']}>
        <View style={[sharedStyles.scrollContent, styles.emptyScreen]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={sharedStyles.title}>Library</Text>
            <Pressable accessibilityLabel="New memory" accessibilityRole="button" onPress={() => router.navigate('/capture')} style={({ pressed }) => [styles.newButton, pressed && styles.pressedButton]}>
              <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={colors.accent} />
              <Text style={styles.newButtonText}>New memory</Text>
            </Pressable>
          </View>

          <Text style={styles.emptyCopy}>Start with one thought. Your saved memories will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.key}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={sharedStyles.scrollContent}
        ListHeaderComponent={(
          <>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text accessibilityRole="header" style={sharedStyles.title}>Library</Text>
                <Text accessibilityLabel={`${notes.length} memories`} style={styles.count}>{notes.length} {notes.length === 1 ? 'memory' : 'memories'}</Text>
              </View>
              <Pressable accessibilityLabel="New memory" accessibilityRole="button" onPress={() => router.navigate('/capture')} style={({ pressed }) => [styles.newButton, pressed && styles.pressedButton]}>
                <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={18} tintColor={colors.accent} />
                <Text style={styles.newButtonText}>New</Text>
              </Pressable>
            </View>

            <View style={styles.searchField}>
              <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={19} tintColor={colors.muted} />
              <TextInput
                accessibilityLabel="Search library"
                autoCapitalize="none"
                clearButtonMode="while-editing"
                onChangeText={setQuery}
                placeholder="Search memories"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                style={styles.searchInput}
                value={query}
              />
            </View>
            <Text style={styles.searchScopeIndicator}>Searching titles, body text, and sources</Text>

            <View style={styles.toggleSection}>
              <View style={styles.viewToggle}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'folders' }}
                  onPress={() => setViewMode('folders')}
                  style={[styles.viewToggleBtn, viewMode === 'folders' && styles.viewToggleBtnSelected]}
                >
                  <Text style={[styles.viewToggleText, viewMode === 'folders' && styles.viewToggleTextSelected]}>By folder</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: viewMode === 'all' }}
                  onPress={() => setViewMode('all')}
                  style={[styles.viewToggleBtn, viewMode === 'all' && styles.viewToggleBtnSelected]}
                >
                  <Text style={[styles.viewToggleText, viewMode === 'all' && styles.viewToggleTextSelected]}>All memories</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionLabel}>{normalizedQuery ? 'Results' : viewMode === 'folders' ? 'Folders' : 'All memories'}</Text>
            </View>
          </>
        )}

        ListFooterComponent={!hasSearchResults ? (
          <View style={styles.noResults}>
            <Text style={styles.noResultsTitle}>Nothing matches</Text>
            <Text style={styles.muted}>Try another word or clear your search.</Text>
            <Pressable accessibilityRole="button" onPress={() => setQuery('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear search</Text>
            </Pressable>
          </View>
        ) : null}
        renderItem={({ item }) => {
          if (item.type === 'folder') {
            const memoryLabel = `${item.folder.count} ${item.folder.count === 1 ? 'memory' : 'memories'}`;
            let folderColor = 'transparent';
            if (item.depth === 0) {
              if (item.folder.name === 'Books') folderColor = '#D4A574';
              else if (item.folder.name === 'Experiences') folderColor = '#2D7A5F';
              else if (item.folder.name === 'Inbox' || item.folder.name === 'Notes') folderColor = '#3F5F83';
            }

            return (
              <Pressable
                accessibilityHint={normalizedQuery ? 'Folders stay expanded while searching' : undefined}
                accessibilityLabel={`${item.folder.name} folder, ${memoryLabel}, ${item.expanded ? 'expanded' : 'collapsed'}`}
                accessibilityRole="button"
                accessibilityState={{ disabled: Boolean(normalizedQuery), expanded: item.expanded }}
                disabled={Boolean(normalizedQuery)}
                onPress={() => {
                  setExpandedFolders((current) => ({ ...current, [item.folder.path]: !item.expanded }));
                }}
                style={({ pressed }) => [
                  styles.folderRow,
                  normalizedQuery && styles.folderRowDisabled,
                  pressed && styles.pressedRow,
                  { paddingLeft: item.depth * 18, borderLeftWidth: 3, borderLeftColor: folderColor },
                ]}
              >
                <SymbolView
                  name={{ ios: item.expanded ? 'chevron.down' : 'chevron.right', android: item.expanded ? 'expand_more' : 'chevron_right', web: item.expanded ? 'expand_more' : 'chevron_right' }}
                  size={18}
                  tintColor={colors.muted}
                />
                <SymbolView name={{ ios: 'folder', android: 'folder', web: 'folder' }} size={20} tintColor={item.expanded ? colors.accent : colors.ink} />
                <Text style={[styles.folderName, item.expanded && styles.folderNameExpanded]}>{item.folder.name}</Text>
                <Text style={styles.folderCount}>{item.folder.count}</Text>
              </Pressable>
            );
          }

          if (item.type === 'folder-empty') {
            return <Text style={[styles.folderEmpty, { marginLeft: 47 + item.depth * 18 }]}>No memories here yet.</Text>;
          }

          const showPath = duplicateTitles.has(item.note.title.toLowerCase());
          const snippet = cleanSnippet(item.note.body, item.note.title);
          return (
            <Pressable
              accessibilityLabel={`${item.note.title}, ${showPath ? item.note.path : item.note.folder}`}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/note/[id]', params: { id: item.note.id } })}
              style={({ pressed }) => [styles.fileRow, pressed && styles.pressedRow, { marginLeft: 27 + item.depth * 18 }, item.first && styles.fileRowFirst]}
            >
              <View style={styles.fileIcon}>
                <SymbolView name={{ ios: 'doc.text', android: 'description', web: 'description' }} size={17} tintColor={colors.accent} />
              </View>
              <View style={styles.fileCopy}>
                <View style={styles.fileTitleRow}>
                  <Text numberOfLines={1} style={styles.fileTitle}>{item.note.title}</Text>
                  {recallDueIds.has(item.note.id) ? <View style={styles.recallDot} /> : null}
                </View>
                {snippet ? <Text numberOfLines={1} style={styles.fileSnippet}>{snippet}</Text> : null}
                {showPath ? <Text numberOfLines={1} style={styles.filePath}>{item.note.path}</Text> : null}
              </View>
              <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.muted} />
            </Pressable>
          );
        }}
      />
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

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  error: { color: colors.danger, maxWidth: 310, textAlign: 'center' },
  emptyScreen: { flex: 1 },
  emptyCopy: { color: colors.muted, fontSize: 16, lineHeight: 23, maxWidth: 290 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  headerCopy: { gap: 5 },
  count: { color: colors.muted, fontSize: 14 },
  newButton: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 6, minHeight: 44, paddingHorizontal: 10 },
  newButtonText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  pressedButton: { opacity: 0.65 },
  searchField: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.controlLine, borderRadius: 12, borderWidth: 1, flexDirection: 'row', gap: 10, minHeight: 48, paddingHorizontal: 14 },
  searchInput: { color: colors.ink, flex: 1, fontSize: 16, paddingVertical: 0 },
  searchScopeIndicator: { color: colors.muted, fontSize: 13, marginTop: 10, paddingHorizontal: 4 },
  toggleSection: { marginTop: 22 },
  viewToggle: { backgroundColor: colors.surface, borderColor: colors.controlLine, borderRadius: 10, borderWidth: 1, flexDirection: 'row', padding: 3 },
  viewToggleBtn: { alignItems: 'center', borderRadius: 8, flex: 1, justifyContent: 'center', minHeight: 36, paddingHorizontal: 12 },
  viewToggleBtnSelected: { backgroundColor: colors.accentSoft },
  viewToggleText: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  viewToggleTextSelected: { color: colors.accent },
  sectionLabel: { color: colors.muted, fontSize: 13, fontWeight: '600', letterSpacing: 0.2, marginBottom: 6, marginTop: 18 },
  folderRow: { alignItems: 'center', borderBottomColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, minHeight: 56 },
  folderRowDisabled: { opacity: 0.58 },
  pressedRow: { opacity: 0.72 },
  folderName: { color: colors.ink, flex: 1, fontSize: 16, fontWeight: '600' },
  folderNameExpanded: { color: colors.accent },
  folderCount: { color: colors.muted, fontSize: 13, minWidth: 24, textAlign: 'right' },
  folderEmpty: { color: colors.muted, fontSize: 14, lineHeight: 20, marginLeft: 47, paddingVertical: 16 },
  fileRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: 64, paddingVertical: 9 },
  fileRowFirst: { borderTopWidth: 0 },
  fileIcon: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 8, height: 32, justifyContent: 'center', marginRight: 11, width: 32 },
  fileCopy: { flex: 1, paddingRight: 10 },
  fileTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  fileTitle: { color: colors.ink, flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  recallDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accentWarm, flexShrink: 0 },
  fileSnippet: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  filePath: { color: colors.muted, fontSize: 11, marginTop: 2 },
  noResults: { alignItems: 'flex-start', paddingBottom: 24, paddingTop: 36 },
  noResultsTitle: { color: colors.ink, fontSize: 18, fontWeight: '600', marginBottom: 7 },
  clearButton: { alignItems: 'center', borderColor: colors.accent, borderRadius: 10, borderWidth: 1, justifyContent: 'center', marginTop: 16, minHeight: 44, paddingHorizontal: 14 },
  clearButtonText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  fab: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 28, bottom: 16, height: 56, justifyContent: 'center', position: 'absolute', right: 16, width: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  fabPressed: { opacity: 0.8 },
});
