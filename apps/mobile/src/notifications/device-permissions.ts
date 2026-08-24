import { PermissionsAndroid, Platform } from 'react-native';
import * as Linking from 'expo-linking';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export async function checkNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
    if (apiLevel >= 33) {
      try {
        const permission = 'android.permission.POST_NOTIFICATIONS' as const;
        const hasPermission = await PermissionsAndroid.check(permission);
        return hasPermission ? 'granted' : 'denied';
      } catch {
        return 'denied';
      }
    }
    return 'granted';
  }

  if (Platform.OS === 'web') {
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') return 'granted';
      if (Notification.permission === 'denied') return 'blocked';
      return 'denied';
    }
    return 'unavailable';
  }

  return 'granted';
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : parseInt(String(Platform.Version), 10);
    if (apiLevel >= 33) {
      try {
        const permission = 'android.permission.POST_NOTIFICATIONS' as const;
        const result = await PermissionsAndroid.request(permission, {
          title: 'Recall Reminders',
          message: 'Stories sends quiet reminders when your memories are ready for recall.',
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
    return 'granted';
  }

  if (Platform.OS === 'web') {
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        const res = await Notification.requestPermission();
        return res === 'granted' ? 'granted' : 'blocked';
      } catch {
        return 'denied';
      }
    }
    return 'unavailable';
  }

  return 'granted';
}

export async function openDeviceNotificationSettings(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await Linking.openSettings();
    }
  } catch {
    // Graceful fallback if settings cannot be opened
  }
}
