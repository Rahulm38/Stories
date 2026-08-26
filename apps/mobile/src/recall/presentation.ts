import type { RecallStatus } from '@core/model';

const RESULT_LABELS: Readonly<Record<RecallStatus, string>> = {
  forgot: 'Not yet',
  partial: 'Mostly',
  remembered: 'Yes',
};

function displayDate(value: string): Date | undefined {
  const trimmed = value.trim();
  const calendarOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (calendarOnly) {
    const date = new Date(Number(calendarOnly[1]), Number(calendarOnly[2]) - 1, Number(calendarOnly[3]));
    return Number.isFinite(date.getTime()) ? date : undefined;
  }
  const date = new Date(trimmed);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function shortDateLabel(value: string, locale?: string): string | undefined {
  const date = displayDate(value);
  return date?.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

export function memoryAgeLabel(value: string, now = new Date()): string {
  const created = new Date(value);
  if (!Number.isFinite(created.getTime())) return 'From earlier';
  const days = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86_400_000));
  if (days === 0) return 'From today';
  if (days === 1) return 'From yesterday';
  if (days < 14) return `From ${days} days ago`;
  return `From ${created.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export function recallResultLabel(status: RecallStatus): string {
  return RESULT_LABELS[status];
}

export function savedMemoryMessage(nextRecallAt?: string, locale?: string): string {
  const returnDate = nextRecallAt ? shortDateLabel(nextRecallAt, locale) : undefined;
  return returnDate ? `Saved. Back on ${returnDate}.` : 'Saved.';
}

export function remainingStoryMessage(remaining: number): string {
  const safeRemaining = Math.max(0, Math.floor(remaining));
  if (safeRemaining === 0) return 'Done for now.';
  return `${safeRemaining} ${safeRemaining === 1 ? 'story' : 'stories'} left for now.`;
}

export function recallCompletionMessage(nextRecallAt: string, remaining: number, locale?: string): string {
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return `${returnDate ? `Back on ${returnDate}.` : 'Done.'} ${remainingStoryMessage(remaining)}`;
}

export function nextUpcomingRecallMessage(nextRecallAt?: string, locale?: string): string | undefined {
  if (!nextRecallAt) return undefined;
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return returnDate ? `Next story comes back on ${returnDate}.` : undefined;
}
