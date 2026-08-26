import type { MemoryNote } from '@core/model';
import { plainMemoryText } from '@core/story-cue';

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function matchesLibrarySearch(note: MemoryNote, query: string): boolean {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeSearch([
    plainMemoryText(note.title),
    plainMemoryText(note.body),
    note.source || '',
  ].join(' '));

  return tokens.every((token) => haystack.includes(token));
}
