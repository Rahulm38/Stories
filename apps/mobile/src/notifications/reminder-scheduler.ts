import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { MemoryNote } from '@core/model';
import { readReminderPreferences } from './reminder-preferences';
import { reminderNotificationMessage } from './reminder-service';
import { readDailyReviewSession } from '@/src/recall/daily-session-store';

const REMINDER_ID_KEY = 'stories-return-reminder';
const LEGACY_REMINDER_ID_KEY = 'stories-recall-reminder';

function localDateFromRecall(value: string): Date | undefined {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date : undefined;
}

function startOfLocalDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function tomorrowAt(hour: number, minute: number, now: Date): Date {
  const target = startOfLocalDay(now);
  target.setDate(target.getDate() + 1);
  target.setHours(hour, minute, 0, 0);
  return target;
}

export async function configureReminderPresentation(): Promise<void> {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('recall', {
      name: 'Story reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      vibrationPattern: null,
    });
  }
}

export async function reconcileRecallReminder(notes: MemoryNote[], now = new Date()): Promise<void> {
  if (Platform.OS === 'web') return;
  const prefs = await readReminderPreferences();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.content.data?.[REMINDER_ID_KEY] === true || item.content.data?.[LEGACY_REMINDER_ID_KEY] === true)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
  if (!prefs.enabled) return;

  const recallDates = notes
    .filter((note) => note.parseStatus !== 'quarantine' && note.nextRecallAt)
    .map((note) => localDateFromRecall(note.nextRecallAt!))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime());
  if (recallDates.length === 0) return;

  const today = startOfLocalDay(now);
  const dueCount = recallDates.filter((date) => date.getTime() <= today.getTime()).length;
  const dailySession = await readDailyReviewSession(now);

  let target: Date;
  if (dueCount > 0 && dailySession.handled > 0) {
    // Once the user has engaged with Today's session, never nag again a minute later.
    // Any remaining backlog gets one calm opportunity tomorrow.
    target = tomorrowAt(prefs.reminderHour, prefs.reminderMinute, now);
  } else {
    target = new Date(recallDates[0]);
    target.setHours(prefs.reminderHour, prefs.reminderMinute, 0, 0);
    if (target.getTime() <= now.getTime()) target.setTime(now.getTime() + 60_000);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Stories',
      body: reminderNotificationMessage(Math.max(1, dueCount)) || 'A memory is ready to come back.',
      data: { [REMINDER_ID_KEY]: true },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: target,
      ...(Platform.OS === 'android' ? { channelId: 'recall' } : {}),
    },
  });
}
