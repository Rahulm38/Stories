import type { RecallStatus } from '@core/model';

const RESULT_LABELS: Readonly<Record<RecallStatus, string>> = {
  forgot: 'Forgot',
  partial: 'Close',
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

export function shortDateLabel(value: string, locale?: string): string | undefined {
  const date = localDate(value) ?? new Date(value);
  if (!Number.isFinite(date.getTime())) return undefined;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
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
  return returnDate ? `Saved. Comes back on ${returnDate}.` : 'Saved.';
}

export function remainingStoryMessage(remaining: number): string {
  const safeRemaining = Math.max(0, Math.floor(remaining));
  if (safeRemaining === 0) return 'Done for now.';
  return `${safeRemaining} ${safeRemaining === 1 ? 'memory' : 'memories'} left for now.`;
}

export function recallCompletionMessage(nextRecallAt: string, remaining: number, locale?: string): string {
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return `${returnDate ? `Back on ${returnDate}.` : 'Done.'} ${remainingStoryMessage(remaining)}`;
}

export function nextUpcomingRecallMessage(nextRecallAt?: string, locale?: string): string | undefined {
  if (!nextRecallAt) return undefined;
  const returnDate = shortDateLabel(nextRecallAt, locale);
  return returnDate ? `Your next story comes back on ${returnDate}.` : undefined;
}
