import type { MemoryNote, NoteDraft } from './model.ts';

export type StoryReadiness = 'new' | 'coming-back' | 'ready';

export const READY_STRENGTH_DAYS = 30;

/**
 * Readiness is deliberately derived rather than persisted. A story becomes ready
 * after the user has either told it in real life or built enough durable recall
 * strength through successful returns. This keeps motivation tied to outcomes,
 * not streaks or arbitrary points.
 */
export function storyReadiness(note: MemoryNote): StoryReadiness {
  if ((note.toldCount || 0) > 0) return 'ready';
  if (note.recallStatus === 'remembered' && (note.reviewStrengthDays || 0) >= READY_STRENGTH_DAYS) return 'ready';
  if (note.lastRecalledAt || note.recallStatus || (note.reviewStrengthDays || 0) > 0) return 'coming-back';
  return 'new';
}

export function storyReadinessLabel(note: MemoryNote): string {
  const readiness = storyReadiness(note);
  if (readiness === 'ready') return 'Ready';
  if (readiness === 'coming-back') return 'Getting ready';
  return 'New';
}

export function readyStoryCount(notes: MemoryNote[]): number {
  return notes.reduce((count, note) => count + (storyReadiness(note) === 'ready' ? 1 : 0), 0);
}

/** Records a user-confirmed real-world telling without changing recall scheduling. */
export function markStoryTold(note: MemoryNote, now = new Date()): NoteDraft {
  return {
    id: note.id,
    body: note.body,
    toldCount: Math.max(0, Math.trunc(note.toldCount || 0)) + 1,
    lastToldAt: now.toISOString(),
  };
}
