import type { MemoryKind, MemoryNote } from '@core/model';

export function folderForKind(kind: MemoryKind, note: Pick<MemoryNote, 'kind' | 'folder'>): string {
  if (kind === note.kind) return note.folder;
  if (kind === 'book-learning') return 'Books';
  if (kind === 'experience') return 'Experiences';
  return 'Inbox';
}
