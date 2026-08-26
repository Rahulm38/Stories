import type { MemoryNote } from '../../../../packages/core/src/model.ts';

function recallAnchor(note: MemoryNote): number {
  const value = note.lastRecalledAt || note.createdAt || note.updatedAt;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

function practiceCandidates(notes: MemoryNote[]): MemoryNote[] {
  return [...notes]
    .filter((note) => note.parseStatus !== 'quarantine')
    .sort((a, b) => {
      const aHasRecall = Boolean(a.lastRecalledAt);
      const bHasRecall = Boolean(b.lastRecalledAt);
      if (aHasRecall !== bHasRecall) return aHasRecall ? 1 : -1;
      return recallAnchor(a) - recallAnchor(b) || a.id.localeCompare(b.id);
    });
}

export function selectPracticeMemory(notes: MemoryNote[], offset = 0): MemoryNote | undefined {
  const candidates = practiceCandidates(notes);
  if (candidates.length === 0) return undefined;
  const safeOffset = Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
  return candidates[safeOffset % candidates.length];
}

export function nextPracticeMemory(notes: MemoryNote[], currentId: string): MemoryNote | undefined {
  const candidates = practiceCandidates(notes);
  if (candidates.length <= 1) return undefined;
  const currentIndex = candidates.findIndex((note) => note.id === currentId);
  if (currentIndex < 0) return candidates[0];
  return candidates[(currentIndex + 1) % candidates.length];
}
