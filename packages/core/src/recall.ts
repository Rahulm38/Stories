import type { MemoryNote, NoteDraft, RecallStatus } from './model.ts';

export const RECALL_INTERVAL_DAYS: Readonly<Record<RecallStatus, number>> = {
  remembered: 14,
  partial: 4,
  forgot: 1,
};

function localDateStamp(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function parseCalendarDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysInMonth = new Date(year, month, 0).getDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) return undefined;
  return new Date(year, month - 1, day);
}

function addCalendarDays(value: Date | string, days: number): string {
  const date = value instanceof Date ? new Date(value) : parseCalendarDate(value);
  if (!date || !Number.isFinite(date.getTime())) throw new Error('Cannot schedule recall from an invalid date');
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateStamp(date);
}

export function normalizeRecallTimestamp(value: string | undefined): string | undefined {
  const parsed = parseCalendarDate(value);
  return parsed ? localDateStamp(parsed) : undefined;
}

export function dueRecalls(notes: MemoryNote[], now = new Date()): MemoryNote[] {
  const today = localDateStamp(now);
  return notes
    .filter((note) => note.parseStatus !== 'quarantine' && Boolean(note.nextRecallAt) && normalizeRecallTimestamp(note.nextRecallAt)! <= today)
    .sort((a, b) => {
      const aDate = normalizeRecallTimestamp(a.nextRecallAt) || '';
      const bDate = normalizeRecallTimestamp(b.nextRecallAt) || '';
      return aDate.localeCompare(bDate) || a.path.localeCompare(b.path) || a.id.localeCompare(b.id);
    });
}

export function scheduleFirstRecall(now = new Date(), days = 1): string {
  return addCalendarDays(now, days);
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
    nextRecallAt: addCalendarDays(now, RECALL_INTERVAL_DAYS[status]),
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
    nextRecallAt: addCalendarDays(now, 1),
  };
}
