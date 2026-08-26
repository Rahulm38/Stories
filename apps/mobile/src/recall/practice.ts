import type { MemoryNote } from '../../../../packages/core/src/model.ts';

function recallAnchor(note: MemoryNote): number {
  const value = note.lastRecalledAt || note.createdAt || note.updatedAt;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

export function selectPracticeMemory(notes: MemoryNote[]): MemoryNote | undefined {
  return [...notes]
    .filter((note) => note.parseStatus !== 'quarantine')
    .sort((a, b) => {
      const aHasRecall = Boolean(a.lastRecalledAt);
      const bHasRecall = Boolean(b.lastRecalledAt);
      if (aHasRecall !== bHasRecall) return aHasRecall ? 1 : -1;
      return recallAnchor(a) - recallAnchor(b) || a.id.localeCompare(b.id);
    })[0];
}
