import type { MemoryNote, RecallStatus } from '@core/model';

const RESULT_LABELS: Readonly<Record<RecallStatus, string>> = {
  forgot: 'Not yet',
  partial: 'Partly',
  remembered: 'Got it',
};

export function shortDateLabel(value: string, locale?: string): string | undefined {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function recallResultLabel(status: RecallStatus): string {
  return RESULT_LABELS[status];
}

export function recallCue(note: Pick<MemoryNote, 'kind' | 'recallPrompt' | 'source'>): string {
  if (note.recallPrompt?.trim()) return note.recallPrompt.trim();
  if (note.kind === 'book-learning') {
    return note.source?.trim()
      ? `What idea from “${note.source.trim()}” did you want to remember?`
      : 'What idea from this book did you want to remember?';
  }
  if (note.kind === 'experience') {
    return note.source?.trim()
      ? `What did you want to remember about “${note.source.trim()}”?`
      : 'What changed in this experience?';
  }
  return 'What did you want to remember?';
}

export function savedMemoryMessage(nextRecallAt?: string, locale?: string): string {
  const returnDate = nextRecallAt ? shortDateLabel(nextRecallAt, locale) : undefined;
  return returnDate ? `Saved privately. It returns on ${returnDate}.` : 'Saved privately.';
}

export function remainingRecallMessage(remaining: number): string {
  const safeRemaining = Math.max(0, Math.floor(remaining));
  if (safeRemaining === 0) return 'All caught up today.';
  return `${safeRemaining} ${safeRemaining === 1 ? 'recall' : 'recalls'} left today.`;
}

export function recallCompletionMessage(nextRecallAt: string, remaining: number, locale?: string): string {
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return `Practiced.${returnDate ? ` Back on ${returnDate}.` : ''} ${remainingRecallMessage(remaining)}`;
}

export function nextUpcomingRecallMessage(nextRecallAt?: string, locale?: string): string | undefined {
  if (!nextRecallAt) return undefined;
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return returnDate ? `Next memory returns on ${returnDate}.` : undefined;
}
