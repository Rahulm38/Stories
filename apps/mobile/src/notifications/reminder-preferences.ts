import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { DEFAULT_REMINDER_PREFS, type ReminderPreferences } from './reminder-service';

function preferencesFile(): File {
  return new File(Paths.document, 'stories-reminder-preferences.json');
}

export async function readReminderPreferences(): Promise<ReminderPreferences> {
  if (Platform.OS === 'web') return DEFAULT_REMINDER_PREFS;
  try {
    const file = preferencesFile();
    if (!file.exists) return DEFAULT_REMINDER_PREFS;
    const parsed = JSON.parse(await file.text()) as Partial<ReminderPreferences>;
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
  if (Platform.OS === 'web') return;
  const file = preferencesFile();
  file.create({ overwrite: true });
  file.write(JSON.stringify(preferences));
}
