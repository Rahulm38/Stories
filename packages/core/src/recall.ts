import type { MemoryNote, NoteDraft, RecallStatus } from './model.ts';

export const MAX_SESSION_MEMORIES = 5;

export const RECALL_INTERVAL_DAYS: Readonly<Record<RecallStatus, number>> = {
  remembered: 14,
  partial: 4,
  forgot: 1,
};

function localDateStamp(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function parseRecallDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const calendarDate = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?=$|T)/);
  if (!calendarDate) return undefined;
  const [, yearText, monthText, dayText] = calendarDate;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return undefined;
  if (trimmed.length === 10) return new Date(year, month - 1, day);
  const parsed = new Date(trimmed);
  return Number.isFinite(parsed.getTime()) ? parsed : undefined;
}

function recallCalendarDay(value: string | undefined): string | undefined {
  const parsed = parseRecallDate(value);
  return parsed ? localDateStamp(parsed) : undefined;
}

function addDays(isoDate: string, days: number): string {
  const date = parseRecallDate(isoDate);
  if (!date) throw new Error('Cannot schedule recall from an invalid date');
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function daysBetween(from: string | undefined, to: string | undefined): number | undefined {
  const fromDate = parseRecallDate(from);
  const toDate = parseRecallDate(to);
  if (!fromDate || !toDate) return undefined;
  const difference = Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  return difference > 0 ? difference : undefined;
}

function storedStrength(note: MemoryNote): number | undefined {
  if (Number.isInteger(note.reviewStrengthDays) && (note.reviewStrengthDays || 0) > 0) return note.reviewStrengthDays;
  // Compatibility fallback for memories saved by builds before reviewStrengthDays existed.
  return daysBetween(note.lastRecalledAt, note.nextRecallAt);
}

function nextIntervalDays(note: MemoryNote, status: RecallStatus): number {
  const previousInterval = storedStrength(note);
  if (!previousInterval) return RECALL_INTERVAL_DAYS[status];
  if (status === 'forgot') return 1;
  if (status === 'partial') {
    if (previousInterval <= 7) return 7;
    if (previousInterval <= 14) return 14;
    if (previousInterval <= 30) return 30;
    return 60;
  }
  if (previousInterval <= 14) return 30;
  if (previousInterval <= 30) return 90;
  if (previousInterval <= 90) return 180;
  return 365;
}

export function normalizeRecallTimestamp(value: string | undefined): string | undefined {
  return parseRecallDate(value)?.toISOString();
}

export function dueRecalls(notes: MemoryNote[], now = new Date()): MemoryNote[] {
  const today = localDateStamp(now);
  return notes
    .filter((note) => {
      if (note.parseStatus === 'quarantine' || !note.nextRecallAt) return false;
      const dueDay = recallCalendarDay(note.nextRecallAt);
      return dueDay !== undefined && dueDay <= today;
    })
    .sort((a, b) => {
      const aDay = recallCalendarDay(a.nextRecallAt) || '';
      const bDay = recallCalendarDay(b.nextRecallAt) || '';
      return aDay.localeCompare(bDay) || a.path.localeCompare(b.path) || a.id.localeCompare(b.id);
    });
}

export function scheduleFirstRecall(now = new Date(), days = 1): string {
  return addDays(now.toISOString(), days);
}

// Kept only to read and preserve older stored memories. The mobile UI does not create reflections.
export function appendRecallReflection(body: string, reflection: string, now = new Date()): string {
  const content = reflection.trim();
  if (!content) return body;
  const section = `## Recall reflection\n\n${localDateStamp(now)}\n\n${content}`;
  return [body.trimEnd(), section].filter(Boolean).join('\n\n');
}

export function gradeRecall(note: MemoryNote, status: RecallStatus, now = new Date()): NoteDraft {
  const today = localDateStamp(now);
  const scheduledDay = recallCalendarDay(note.nextRecallAt);
  const isEarlyPractice = Boolean(note.nextRecallAt && scheduledDay && scheduledDay > today);
  const nextDays = nextIntervalDays(note, status);
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    kind: note.kind,
    folder: note.folder,
    source: note.source,
    recallPrompt: note.recallPrompt,
    recallStatus: status,
    lastRecalledAt: now.toISOString(),
    reviewStrengthDays: isEarlyPractice ? note.reviewStrengthDays : nextDays,
    nextRecallAt: isEarlyPractice ? note.nextRecallAt : addDays(now.toISOString(), nextDays),
  };
}

export function practiceRecall(note: MemoryNote, status: RecallStatus, reflection = '', now = new Date()): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    body: appendRecallReflection(note.body, reflection, now),
    kind: note.kind,
    folder: note.folder,
    source: note.source,
    recallPrompt: note.recallPrompt,
    recallStatus: status,
    lastRecalledAt: now.toISOString(),
    reviewStrengthDays: note.reviewStrengthDays,
    nextRecallAt: note.nextRecallAt,
  };
}

export function deferRecall(note: MemoryNote, now = new Date()): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    kind: note.kind,
    folder: note.folder,
    source: note.source,
    recallPrompt: note.recallPrompt,
    recallStatus: note.recallStatus,
    lastRecalledAt: note.lastRecalledAt,
    reviewStrengthDays: note.reviewStrengthDays,
    nextRecallAt: addDays(now.toISOString(), 1),
  };
}

export function stopResurfacing(note: MemoryNote): NoteDraft {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    kind: note.kind,
    folder: note.folder,
    source: note.source,
    recallPrompt: note.recallPrompt,
    recallStatus: note.recallStatus,
    lastRecalledAt: note.lastRecalledAt,
    reviewStrengthDays: note.reviewStrengthDays,
    nextRecallAt: undefined,
  };
}
