import type { MemoryNote } from '@core/model';

export const STORY_COACHING_CUES = [
  'Start with where you were.',
  'Get to what changed.',
  'What made this worth telling?',
  'Tell it in under a minute.',
] as const;

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Coaching is tiny, deterministic and non-judgmental. It rotates as a story gains
 * strength or gets told, so practice develops fluency without becoming a course.
 */
export function storyCoachingCue(note: Pick<MemoryNote, 'id' | 'reviewStrengthDays' | 'toldCount'>): string {
  const phase = `${note.reviewStrengthDays || 0}:${note.toldCount || 0}`;
  return STORY_COACHING_CUES[stableHash(`${note.id}:${phase}`) % STORY_COACHING_CUES.length];
}
