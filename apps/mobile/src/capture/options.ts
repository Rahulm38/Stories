import type { MemoryKind } from '@core/model';

export const MEMORY_KIND_OPTIONS: ReadonlyArray<{ label: string; value: MemoryKind }> = [
  { label: 'Note', value: 'note' },
  { label: 'Book learning', value: 'book-learning' },
  { label: 'Experience', value: 'experience' },
];

export type RecallChoice = 'off' | 'three-days' | 'week';

export const DEFAULT_RECALL_CHOICE: RecallChoice = 'three-days';

export const RECALL_OPTIONS: ReadonlyArray<{ label: string; value: RecallChoice }> = [
  { label: '3 days', value: 'three-days' },
  { label: '1 week', value: 'week' },
  { label: 'Off', value: 'off' },
];

export function recallDaysForChoice(choice: RecallChoice): number | undefined {
  if (choice === 'three-days') return 3;
  if (choice === 'week') return 7;
  return undefined;
}
