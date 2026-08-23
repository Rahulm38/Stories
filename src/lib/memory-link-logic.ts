export type LinkMemory = {
  id: string;
  title: string;
  folderPath?: string;
};

export function memoryFileName(memory: Pick<LinkMemory, 'title'>): string {
  const slug = memory.title
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 58);

  return `${slug || 'untitled-note'}.md`;
}

export function memoryFilePath(memory: Pick<LinkMemory, 'title' | 'folderPath'>): string {
  return `${memory.folderPath || 'Inbox'}/${memoryFileName(memory)}`;
}

function normalizeTarget(value: string) {
  return value.trim().replace(/\.md$/i, '').replace(/\\/g, '/').toLowerCase();
}

function compactTarget(value: string) {
  return normalizeTarget(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function isLinkToMemory(target: string, memory: LinkMemory) {
  const normalizedTarget = normalizeTarget(target);
  const compactedTarget = compactTarget(target);
  const candidates = [memoryFileName(memory), memoryFilePath(memory), memory.title].map(normalizeTarget);
  const compactCandidates = candidates.map(compactTarget);

  return candidates.some((candidate) => candidate === normalizedTarget || candidate.endsWith(`/${normalizedTarget}`))
    || compactCandidates.some((candidate) => candidate === compactedTarget || candidate.endsWith(`-${compactedTarget}`));
}

export function findLinkedMemory<T extends LinkMemory>(target: string, memories: T[]): T | undefined {
  const normalizedTarget = normalizeTarget(target);
  if (!normalizedTarget) return undefined;

  const exactTitleMatches = memories.filter((memory) => normalizeTarget(memory.title) === normalizedTarget);
  if (exactTitleMatches.length === 1) return exactTitleMatches[0];

  const exactPathMatches = memories.filter((memory) => normalizeTarget(memoryFilePath(memory)) === normalizedTarget);
  if (exactPathMatches.length === 1) return exactPathMatches[0];

  const exactFileMatches = memories.filter((memory) => normalizeTarget(memoryFileName(memory)) === normalizedTarget);
  if (exactFileMatches.length === 1) return exactFileMatches[0];

  if (!/^[a-z0-9][a-z0-9 /_-]*$/i.test(normalizedTarget)) return undefined;
  const fuzzyMatches = memories.filter((memory) => isLinkToMemory(target, memory));
  return fuzzyMatches.length === 1 ? fuzzyMatches[0] : undefined;
}

export type ActiveWikilink = {
  start: number;
  end: number;
  query: string;
};

export function activeWikilinkAtCursor(value: string, cursor: number): ActiveWikilink | null {
  const beforeCursor = value.slice(0, cursor);
  const start = beforeCursor.lastIndexOf('[[');
  if (start === -1) return null;

  const query = beforeCursor.slice(start + 2);
  if (query.includes(']]') || query.includes('\n') || query.includes('[') || query.includes(']')) return null;
  return { start, end: cursor, query };
}

export function wikilinkSuggestions<T extends LinkMemory>(query: string, memories: T[], currentMemoryId?: string): T[] {
  const normalizedQuery = query.trim().toLowerCase();

  const score = (memory: LinkMemory) => {
    if (!normalizedQuery) return 0;
    const values = [memory.title, memoryFileName(memory), memoryFilePath(memory)].map((value) => value.toLowerCase());
    if (values.some((value) => value.startsWith(normalizedQuery))) return 0;
    if (values.some((value) => value.split(/[^a-z0-9]+/).some((word) => word.startsWith(normalizedQuery)))) return 1;
    return 2;
  };

  return memories
    .filter((memory) => memory.id !== currentMemoryId)
    .filter((memory) => {
      if (!normalizedQuery) return true;
      return [memory.title, memoryFileName(memory), memoryFilePath(memory)]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title))
    .slice(0, 6);
}

export function insertWikilink<T extends LinkMemory>(value: string, active: ActiveWikilink, memory: T, memories: T[]) {
  const fileName = memoryFileName(memory);
  const duplicateCount = memories.filter((item) => memoryFileName(item).toLowerCase() === fileName.toLowerCase()).length;
  const target = duplicateCount > 1 ? memoryFilePath(memory) : fileName;
  const link = `[[${target}]]`;
  const nextValue = `${value.slice(0, active.start)}${link}${value.slice(active.end)}`;
  return { value: nextValue, cursor: active.start + link.length };
}

export function replaceRenamedWikilinks<T extends LinkMemory>(content: string, previous: T, next: T, memories: T[] = [previous]) {
  if (!content.includes('[[') || memoryFilePath(previous) === memoryFilePath(next)) return content;
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (whole, target: string, alias?: string) => {
    if (findLinkedMemory(target, memories)?.id !== previous.id) return whole;
    const replacement = normalizeTarget(target).includes('/') ? memoryFilePath(next) : memoryFileName(next);
    return `[[${replacement}${alias ? `|${alias}` : ''}]]`;
  });
}
