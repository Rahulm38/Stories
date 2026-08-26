import type { MemoryKind, MemoryNote, RecallStatus } from '@core/model';

const RESULT_LABELS: Readonly<Record<RecallStatus, string>> = {
  forgot: 'Not yet',
  partial: 'Partly',
  remembered: 'Got it',
};

function localDate(value: string): Date | undefined {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// Legacy helper retained for older data and tests. New mobile flows do not ask
// people to create a separate reflection during review.
export function reflectionPrompt(kind: MemoryKind): string {
  if (kind === 'book-learning') return 'Where could this idea matter in your life now?';
  if (kind === 'experience') return 'What would you do differently now?';
  return 'Where could this matter now?';
}

export function shortDateLabel(value: string, locale?: string): string | undefined {
  const date = localDate(value) ?? new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function recallResultLabel(status: RecallStatus): string {
  return RESULT_LABELS[status];
}

// Legacy helper retained so older custom prompts continue to work. New review
// surfaces use the memory title instead of exposing a "recall cue" concept.
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
  return returnDate ? `Saved. We’ll show it again on ${returnDate}.` : 'Saved.';
}

export function practiceCompletionMessage(nextRecallAt?: string, locale?: string): string {
  const returnDate = nextRecallAt ? shortDateLabel(nextRecallAt, locale) : undefined;
  return returnDate ? `Review complete. It still returns on ${returnDate}.` : 'Review complete.';
}

export function remainingRecallMessage(remaining: number): string {
  const safeRemaining = Math.max(0, Math.floor(remaining));
  if (safeRemaining === 0) return 'All caught up today.';
  return `${safeRemaining} ${safeRemaining === 1 ? 'review' : 'reviews'} left today.`;
}

export function recallCompletionMessage(nextRecallAt: string, remaining: number, locale?: string): string {
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return `Reviewed.${returnDate ? ` Back on ${returnDate}.` : ''} ${remainingRecallMessage(remaining)}`;
}

export function nextUpcomingRecallMessage(nextRecallAt?: string, locale?: string): string | undefined {
  if (!nextRecallAt) return undefined;
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return returnDate ? `Next memory returns on ${returnDate}.` : undefined;
}
