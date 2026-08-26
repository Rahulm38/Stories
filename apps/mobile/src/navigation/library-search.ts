import type { MemoryNote } from '../../../../packages/core/src/model.ts';
import { plainStoryText } from '../../../../packages/core/src/story-cue.ts';

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function tokenScore(queryToken: string, words: string[], haystack: string): number | null {
  if (words.includes(queryToken)) return 0;
  if (words.some((word) => word.startsWith(queryToken) || (word.length >= 3 && queryToken.startsWith(word)))) return 1;
  if (haystack.includes(queryToken)) return 1;
  if (queryToken.length < 4) return null;
  const tolerance = queryToken.length >= 8 ? 2 : 1;
  return words.some((word) => Math.abs(word.length - queryToken.length) <= tolerance && editDistance(word, queryToken) <= tolerance)
    ? 2
    : null;
}

export function librarySearchScore(note: MemoryNote, query: string): number | null {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return 0;

  const haystack = normalizeSearch([
    plainStoryText(note.title),
    plainStoryText(note.body),
    note.source || '',
  ].join(' '));
  const words = haystack.split(/\s+/).filter(Boolean);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = haystack.includes(normalizedQuery) ? -3 : 0;

  for (const token of tokens) {
    const next = tokenScore(token, words, haystack);
    if (next === null) return null;
    score += next;
  }
  return score;
}

export function matchesLibrarySearch(note: MemoryNote, query: string): boolean {
  return librarySearchScore(note, query) !== null;
}
