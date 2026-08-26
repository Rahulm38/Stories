import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, AppState, StyleSheet, Switch, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { colors, radii, sizes, spacing } from '@/src/ui/theme';
import { useVault } from '@/src/vault/provider';
import { DEFAULT_REMINDER_PREFS, reminderStatusCopy, type ReminderPreferences } from '@/src/notifications/reminder-service';
import { readReminderPreferences, writeReminderPreferences } from '@/src/notifications/reminder-preferences';
import { reconcileRecallReminder } from '@/src/notifications/reminder-scheduler';
import { checkNotificationPermission, openDeviceNotificationSettings, requestNotificationPermission, type PermissionStatus } from '@/src/notifications/device-permissions';
import { AppText } from '@/src/ui/components/AppText';
import { AppScreen } from '@/src/ui/components/AppScreen';
import { ListRow } from '@/src/ui/components/ListRow';
import { SectionHeader } from '@/src/ui/components/SectionHeader';

export default function SettingsScreen() {
  const { notes } = useVault();
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFS);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('denied');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const refresh = async () => {
        const [status, prefs] = await Promise.all([checkNotificationPermission(), readReminderPreferences()]);
        if (!isMounted) return;
        setPermissionStatus(status);
        setReminderPrefs(prefs);
        if (status === 'granted') await reconcileRecallReminder(notes);
      };
      void refresh();
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') void refresh();
      });
      return () => {
        isMounted = false;
        sub.remove();
      };
    }, [notes]),
  );

  const persistReminders = async (next: ReminderPreferences) => {
    setReminderPrefs(next);
    await writeReminderPreferences(next);
    await reconcileRecallReminder(notes);
  };

  const toggleReminders = async (enable: boolean) => {
    if (!enable) {
      await persistReminders({ ...reminderPrefs, enabled: false });
      return;
    }

    const currentStatus = await checkNotificationPermission();
    if (currentStatus === 'blocked') {
      Alert.alert(
        'Enable notifications in Settings',
        'Stories only uses quiet local notifications when something is ready to come back.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { void openDeviceNotificationSettings(); } },
        ],
      );
      return;
    }

    const result = currentStatus === 'granted' ? currentStatus : await requestNotificationPermission();
    setPermissionStatus(result);
    if (result === 'granted') await persistReminders({ ...reminderPrefs, enabled: true, promptedAfterReview: true });
  };

  return (
    <AppScreen scroll scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <AppText accessibilityRole="header" variant="display">Settings</AppText>
      <AppText variant="supporting" tone="secondary" style={styles.subtitle}>Private by default. Quiet when you don’t need it.</AppText>

      <View style={styles.section}>
        <SectionHeader>Reminders</SectionHeader>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <SymbolView name={{ ios: 'bell', android: 'notifications', web: 'notifications' }} size={sizes.compactIcon} tintColor={colors.action} />
          </View>
          <View style={styles.copy}>
            <AppText variant="action">Quiet reminder</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.detail}>{reminderStatusCopy(reminderPrefs, permissionStatus === 'blocked')}</AppText>
            {permissionStatus === 'blocked' ? (
              <ListRow
                showTopDivider={false}
                title="Open device settings"
                onPress={() => { void openDeviceNotificationSettings(); }}
                trailing={<SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.textSecondary} />}
              />
            ) : null}
          </View>
          <Switch
            accessibilityLabel="Enable memory reminders"
            onValueChange={(value) => { void toggleReminders(value); }}
            thumbColor={colors.onAction}
            trackColor={{ false: colors.controlBorder, true: colors.action }}
            value={reminderPrefs.enabled && permissionStatus === 'granted'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader>Privacy</SectionHeader>
        <View style={styles.settingRow}>
          <View style={styles.settingIcon}>
            <SymbolView name={{ ios: 'lock', android: 'lock', web: 'lock' }} size={sizes.compactIcon} tintColor={colors.action} />
          </View>
          <View style={styles.copy}>
            <AppText variant="action">Stays on this device</AppText>
            <AppText variant="supporting" tone="secondary" style={styles.detail}>Your memories stay local. Stories does not require an account or upload your content.</AppText>
          </View>
          <AppText variant="metadata" tone="success" style={styles.value}>Local</AppText>
        </View>
        <ListRow
          title="Privacy policy"
          subtitle="How Stories handles your memories and device data."
          onPress={() => router.push('/privacy')}
          trailing={<SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.textSecondary} />}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xxs },
  section: { marginTop: spacing.xxl },
  settingRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: sizes.rowMinimum,
    paddingVertical: spacing.md,
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: colors.actionMuted,
    borderRadius: radii.compact,
    height: 36,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 36,
  },
  copy: { flex: 1, paddingRight: spacing.md },
  detail: { marginTop: spacing.xxs },
  value: { fontWeight: '600', marginTop: spacing.xxs },
});
