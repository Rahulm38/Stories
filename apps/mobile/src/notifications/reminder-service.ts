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
  if (dueCount === 1) return '1 memory is ready to review.';
  return `${dueCount} memories are ready to review.`;
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
    return `Quiet reminder at ${formatReminderTime(prefs.reminderHour, prefs.reminderMinute)} when a memory is ready.`;
  }
  return 'Get a quiet offline alert when a memory is ready to review.';
}

export function firstMemoryReminderPrompt(days = 3): string {
  return `This memory comes back in ${days} days. Turn on a quiet reminder so you don’t miss it?`;
}
