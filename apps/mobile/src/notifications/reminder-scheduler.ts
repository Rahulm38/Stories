import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { MemoryNote } from '@core/model';
import { readReminderPreferences } from './reminder-preferences';

const REMINDER_ID_KEY = 'stories-recall-reminder';

function localDateFromRecall(value: string): Date | undefined {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isFinite(date.getTime()) ? date : undefined;
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
      name: 'Recall reminders',
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
      .filter((item) => item.content.data?.[REMINDER_ID_KEY] === true)
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
  if (!prefs.enabled) return;

  const future = notes
    .filter((note) => note.parseStatus !== 'quarantine' && note.nextRecallAt)
    .map((note) => localDateFromRecall(note.nextRecallAt!))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => a.getTime() - b.getTime());
  const nextDate = future[0];
  if (!nextDate) return;

  const target = new Date(nextDate);
  target.setHours(prefs.reminderHour, prefs.reminderMinute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setTime(now.getTime() + 60_000);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Stories',
      body: 'A memory is ready to return.',
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
