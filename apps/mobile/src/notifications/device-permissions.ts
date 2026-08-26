import { PermissionsAndroid, Platform } from 'react-native';
import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'blocked';

function androidApiLevel(): number {
  return typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
}

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  if (androidApiLevel() < 33) return 'granted';
  try {
    const permission = 'android.permission.POST_NOTIFICATIONS' as const;
    return await PermissionsAndroid.check(permission) ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (androidApiLevel() < 33) return 'granted';
  try {
    const permission = 'android.permission.POST_NOTIFICATIONS' as const;
    const result = await PermissionsAndroid.request(permission, {
      title: 'Story reminders',
      message: 'Stories sends quiet reminders when a story is ready to come back.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not now',
    });
    if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
    return 'denied';
  } catch {
    return 'denied';
  }
}

export async function openDeviceNotificationSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Device settings are optional; reminders must never block the app.
  }
}
