import type { MemoryNote } from '@core/model';

export function matchesLibrarySearch(note: MemoryNote, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [note.title, note.body, note.folder, note.path, note.kind, note.source || '']
    .some((value) => value.toLowerCase().includes(normalized));
}
