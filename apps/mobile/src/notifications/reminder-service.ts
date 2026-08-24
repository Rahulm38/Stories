export type ReminderPreferences = {
  enabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export const DEFAULT_REMINDER_PREFS: ReminderPreferences = {
  enabled: false,
  reminderHour: 9,
  reminderMinute: 0,
};

export function formatReminderTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

export function reminderNotificationMessage(dueCount: number): string | undefined {
  if (dueCount <= 0) return undefined;
  if (dueCount === 1) return 'You have 1 memory ready to recall today.';
  return `You have ${dueCount} memories ready to recall today.`;
}

export function nextReminderDate(prefs: ReminderPreferences, now = new Date()): Date {
  const target = new Date(now);
  target.setHours(prefs.reminderHour, prefs.reminderMinute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

export function reminderStatusCopy(prefs: ReminderPreferences, isBlocked = false): string {
  if (isBlocked) {
    return 'Notifications are blocked on your device. Tap to open Settings and enable them.';
  }
  if (prefs.enabled) {
    return `Quiet reminder at ${formatReminderTime(prefs.reminderHour, prefs.reminderMinute)} when memories are due.`;
  }
  return 'Receive a quiet offline alert when memories are due for recall.';
}

export function firstMemoryReminderPrompt(days = 3): string {
  return `Your memory is scheduled to return in ${days} days. Enable quiet reminders so you don't miss it?`;
}
