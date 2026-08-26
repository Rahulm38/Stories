import { File, Paths } from 'expo-file-system';
import { incrementDailyReviewSession, sessionForDay, type DailyReviewSession } from './daily-session';

function sessionFile(): File {
  return new File(Paths.document, 'stories-daily-review.json');
}

export async function readDailyReviewSession(now = new Date()): Promise<DailyReviewSession> {
  try {
    const file = sessionFile();
    if (!file.exists) return sessionForDay(undefined, now);
    const parsed = JSON.parse(await file.text()) as Partial<DailyReviewSession>;
    return sessionForDay(parsed, now);
  } catch {
    return sessionForDay(undefined, now);
  }
}

export async function writeDailyReviewSession(session: DailyReviewSession): Promise<void> {
  const file = sessionFile();
  file.create({ overwrite: true });
  file.write(JSON.stringify(session));
}

export async function recordDailyReviewHandled(now = new Date()): Promise<DailyReviewSession> {
  const current = await readDailyReviewSession(now);
  const next = incrementDailyReviewSession(current, now);
  await writeDailyReviewSession(next);
  return next;
}
