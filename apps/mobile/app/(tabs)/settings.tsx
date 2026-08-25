import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { useVault } from '@/src/vault/provider';
import { DEFAULT_REMINDER_PREFS, reminderStatusCopy, type ReminderPreferences } from '@/src/notifications/reminder-service';
import { readReminderPreferences, writeReminderPreferences } from '@/src/notifications/reminder-preferences';
import { reconcileRecallReminder } from '@/src/notifications/reminder-scheduler';
import { checkNotificationPermission, openDeviceNotificationSettings, requestNotificationPermission, type PermissionStatus } from '@/src/notifications/device-permissions';

export default function SettingsScreen() {
  const { notes, storageLocation } = useVault();
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
        'Stories only uses local notifications to tell you when a memory is ready to return.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { void openDeviceNotificationSettings(); } },
        ],
      );
      return;
    }

    const result = currentStatus === 'granted' ? currentStatus : await requestNotificationPermission();
    setPermissionStatus(result);
    if (result === 'granted') {
      await persistReminders({ ...reminderPrefs, enabled: true });
    }
  };

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.scrollContent}>
        <Text accessibilityRole="header" style={sharedStyles.title}>Settings</Text>
        <Text style={sharedStyles.subtitle}>Local by default. Recall on your terms.</Text>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>Remembering</Text>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.title}>New memories return in 3 days</Text>
              <Text style={styles.detail}>You can choose one week or turn recall off for an individual memory while capturing it.</Text>
            </View>
          </View>
          <View style={[styles.row, styles.rowWithoutTopBorder]}>
            <View style={styles.copy}>
              <Text style={styles.title}>Quiet reminder</Text>
              <Text style={styles.detail}>{reminderStatusCopy(reminderPrefs, permissionStatus === 'blocked')}</Text>
              {permissionStatus === 'blocked' ? (
                <Pressable accessibilityRole="button" onPress={() => { void openDeviceNotificationSettings(); }} style={styles.permissionActionRow}>
                  <Text style={styles.permissionActionText}>Open device settings →</Text>
                </Pressable>
              ) : null}
            </View>
            <Switch
              accessibilityLabel="Enable quiet recall reminder"
              onValueChange={(value) => { void toggleReminders(value); }}
              thumbColor={colors.onAction}
              trackColor={{ false: colors.controlLine, true: colors.accent }}
              value={reminderPrefs.enabled && permissionStatus === 'granted'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>Storage & privacy</Text>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.title}>Stored on this device</Text>
              <Text style={styles.detail}>Each memory is a local Markdown file. Stories does not upload your memory content or require an account.</Text>
            </View>
            <Text style={styles.value}>Local</Text>
          </View>
          <View style={[styles.row, styles.rowWithoutTopBorder]}>
            <View style={styles.copy}>
              <Text style={styles.title}>Vault location</Text>
              <Text style={styles.detail}>Stories uses its app-private document folder.</Text>
              <Text accessibilityLabel={`Vault location ${storageLocation}`} selectable style={styles.path}>{storageLocation}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>About</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/privacy')} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <View style={styles.copy}>
              <Text style={styles.title}>Privacy policy</Text>
              <Text style={styles.detail}>How Stories handles your memories and device data.</Text>
            </View>
            <Text style={styles.action}>Read</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl },
  row: { alignItems: 'flex-start', borderBottomColor: colors.divider, borderTopColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: sizes.rowMinimum, paddingVertical: spacing.md },
  rowWithoutTopBorder: { borderTopWidth: 0 },
  copy: { flex: 1, paddingRight: spacing.md },
  title: { color: colors.textPrimary, ...typography.action },
  detail: { color: colors.textSecondary, marginTop: spacing.xxs, ...typography.supporting },
  value: { color: colors.success, fontSize: 14, fontWeight: '600', marginTop: 2 },
  action: { color: colors.accent, fontSize: 14, fontWeight: '600', marginTop: 2 },
  pressed: { opacity: 0.65 },
  path: { color: colors.textPrimary, marginTop: spacing.xs, ...typography.metadata },
  permissionActionRow: { marginTop: 6, paddingVertical: 2 },
  permissionActionText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
