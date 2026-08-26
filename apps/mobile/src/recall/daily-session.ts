import { MAX_SESSION_MEMORIES } from '@core/recall';

export type DailyReviewSession = {
  day: string;
  handled: number;
};

export function localDayStamp(now = new Date()): string {
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
}

export function sessionForDay(value: Partial<DailyReviewSession> | undefined, now = new Date()): DailyReviewSession {
  const today = localDayStamp(now);
  const handled = Number(value?.handled);
  if (value?.day !== today || !Number.isInteger(handled) || handled < 0) return { day: today, handled: 0 };
  return { day: today, handled };
}

export function incrementDailyReviewSession(
  value: Partial<DailyReviewSession> | undefined,
  now = new Date(),
): DailyReviewSession {
  const current = sessionForDay(value, now);
  return { ...current, handled: current.handled + 1 };
}

export function remainingDailyReviewCapacity(
  value: Partial<DailyReviewSession> | undefined,
  now = new Date(),
): number {
  return Math.max(0, MAX_SESSION_MEMORIES - sessionForDay(value, now).handled);
}

export function dailyReviewComplete(value: Partial<DailyReviewSession> | undefined, now = new Date()): boolean {
  return remainingDailyReviewCapacity(value, now) === 0;
}
