import type { MemoryNote, NoteDraft, RecallStatus } from './model.ts';

export const RECALL_INTERVAL_DAYS: Readonly<Record<RecallStatus, number>> = {
  remembered: 14,
  partial: 4,
  forgot: 1,
};

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

function addDays(isoDate: string, days: number): string {
  const date = parseRecallDate(isoDate);
  if (!date) throw new Error('Cannot schedule recall from an invalid date');
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function localDateStamp(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function normalizeRecallTimestamp(value: string | undefined): string | undefined {
  return parseRecallDate(value)?.toISOString();
}

export function dueRecalls(notes: MemoryNote[], now = new Date()): MemoryNote[] {
  const nowTime = now.getTime();
  return notes
    .filter((note) => {
      if (note.parseStatus === 'quarantine') return false;
      if (!note.nextRecallAt) return false;
      const dueTime = parseRecallDate(note.nextRecallAt)?.getTime();
      return dueTime !== undefined && dueTime <= nowTime;
    })
    .sort((a, b) => {
      const timeDifference = parseRecallDate(a.nextRecallAt)!.getTime() - parseRecallDate(b.nextRecallAt)!.getTime();
      return timeDifference || a.path.localeCompare(b.path) || a.id.localeCompare(b.id);
    });
}

export function scheduleFirstRecall(now = new Date(), days = 1): string {
  return addDays(now.toISOString(), days);
}

export function appendRecallReflection(body: string, reflection: string, now = new Date()): string {
  const content = reflection.trim();
  if (!content) return body;

  const section = `## Recall reflection\n\n${localDateStamp(now)}\n\n${content}`;
  return [body.trimEnd(), section].filter(Boolean).join('\n\n');
}

export function gradeRecall(note: MemoryNote, status: RecallStatus, now = new Date()): NoteDraft {
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
    nextRecallAt: addDays(now.toISOString(), RECALL_INTERVAL_DAYS[status]),
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
    nextRecallAt: addDays(now.toISOString(), 1),
  };
}
