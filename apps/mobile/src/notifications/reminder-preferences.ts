import { File, Paths } from 'expo-file-system';
import { DEFAULT_REMINDER_PREFS, type ReminderPreferences } from './reminder-service';

const preferencesFile = new File(Paths.document, 'stories-reminder-preferences.json');

export async function readReminderPreferences(): Promise<ReminderPreferences> {
  try {
    if (!preferencesFile.exists) return DEFAULT_REMINDER_PREFS;
    const parsed = JSON.parse(await preferencesFile.text()) as Partial<ReminderPreferences>;
    const hour = Number(parsed.reminderHour);
    const minute = Number(parsed.reminderMinute);
    if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) {
      return DEFAULT_REMINDER_PREFS;
    }
    return { enabled: parsed.enabled === true, reminderHour: hour, reminderMinute: minute };
  } catch {
    return DEFAULT_REMINDER_PREFS;
  }
}

export async function writeReminderPreferences(preferences: ReminderPreferences): Promise<void> {
  preferencesFile.create({ overwrite: true });
  preferencesFile.write(JSON.stringify(preferences));
}
