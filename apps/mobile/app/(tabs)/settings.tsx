import React, { useCallback, useMemo, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, AppState, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { dueRecalls } from '@core/recall';
import { colors, sharedStyles, sizes, spacing, typography } from '@/src/ui/theme';
import { useVault } from '@/src/vault/provider';
import { exportVault } from '@/src/vault/vault-export';
import { DEFAULT_REMINDER_PREFS, reminderStatusCopy, type ReminderPreferences } from '@/src/notifications/reminder-service';
import { checkNotificationPermission, openDeviceNotificationSettings, requestNotificationPermission, type PermissionStatus } from '@/src/notifications/device-permissions';

export default function SettingsScreen() {
  const { notes, storageLocation } = useVault();
  const [now] = useState(() => new Date());
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [reminderPrefs, setReminderPrefs] = useState<ReminderPreferences>(DEFAULT_REMINDER_PREFS);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('denied');

  const practicedCount = useMemo(() => notes.filter((n) => Boolean(n.lastRecalledAt)).length, [notes]);
  const dueCount = useMemo(() => dueRecalls(notes, now).length, [notes, now]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const updateStatus = async () => {
        const status = await checkNotificationPermission();
        if (!isMounted) return;
        setPermissionStatus(status);
        if (status !== 'granted') {
          setReminderPrefs((curr) => (curr.enabled ? { ...curr, enabled: false } : curr));
        }
      };

      void updateStatus();
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') void updateStatus();
      });
      return () => {
        isMounted = false;
        sub.remove();
      };
    }, []),
  );

  const handleExport = async () => {
    if (exporting || notes.length === 0) return;
    setExporting(true);
    setExportMessage('');
    try {
      const result = await exportVault(notes);
      setExportMessage(`Exported ${notes.length} ${notes.length === 1 ? 'memory' : 'memories'} to ${result.filename}`);
      setTimeout(() => setExportMessage(''), 6000);
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Could not export vault.');
    } finally {
      setExporting(false);
    }
  };

  const toggleReminders = async (enable: boolean) => {
    if (!enable) {
      setReminderPrefs((curr) => ({ ...curr, enabled: false }));
      return;
    }

    const currentStatus = await checkNotificationPermission();
    if (currentStatus === 'granted') {
      setReminderPrefs((curr) => ({ ...curr, enabled: true }));
      setPermissionStatus('granted');
      return;
    }

    if (currentStatus === 'blocked') {
      Alert.alert(
        'Enable Notifications in Settings',
        'Stories sends quiet reminders when your memories are ready for recall. Please enable notifications in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { void openDeviceNotificationSettings(); } },
        ],
      );
      return;
    }

    const requestResult = await requestNotificationPermission();
    setPermissionStatus(requestResult);
    if (requestResult === 'granted') {
      setReminderPrefs((curr) => ({ ...curr, enabled: true }));
    } else if (requestResult === 'blocked') {
      Alert.alert(
        'Enable Notifications in Settings',
        'Notifications were denied. You can enable them anytime in your device settings to receive recall alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { void openDeviceNotificationSettings(); } },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.scrollContent}>
        <Text accessibilityRole="header" style={sharedStyles.title}>Settings</Text>
        <Text style={sharedStyles.subtitle}>Local by default. Recall on your terms.</Text>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>Your memories</Text>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{notes.length}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{practicedCount}</Text>
              <Text style={styles.statLabel}>Practiced</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{dueCount}</Text>
              <Text style={styles.statLabel}>Due today</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>Remembering</Text>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.title}>Recall starts in 3 days</Text>
              <Text style={styles.detail}>New memories return in 3 days by default. You can choose 1 week or turn recall off while capturing.</Text>
            </View>
          </View>
          <View style={[styles.row, styles.rowWithoutTopBorder]}>
            <View style={styles.copy}>
              <Text style={styles.title}>Device reminders</Text>
              <Text style={styles.detail}>
                {reminderStatusCopy(reminderPrefs, permissionStatus === 'blocked')}
              </Text>
              {permissionStatus === 'blocked' ? (
                <Pressable accessibilityRole="button" onPress={() => { void openDeviceNotificationSettings(); }} style={styles.permissionActionRow}>
                  <Text style={styles.permissionActionText}>Open device settings →</Text>
                </Pressable>
              ) : null}
            </View>
            <Switch
              accessibilityLabel="Enable device reminders"
              onValueChange={(val) => { void toggleReminders(val); }}
              thumbColor={colors.onAction}
              trackColor={{ false: colors.controlLine, true: colors.accent }}
              value={reminderPrefs.enabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>Storage & Portability</Text>
          <View style={styles.row}>
            <View style={styles.copy}>
              <Text style={styles.title}>On this device</Text>
              <Text style={styles.detail}>One Markdown file is stored for each memory. Nothing is uploaded.</Text>
            </View>
            <Text style={styles.value}>Local</Text>
          </View>
          <View style={[styles.row, styles.rowWithoutTopBorder]}>
            <View style={styles.copy}>
              <Text style={styles.title}>Vault location</Text>
              <Text style={styles.detail}>This is an app-private folder protected by your device.</Text>
              <Text accessibilityLabel={`Vault location ${storageLocation}`} selectable style={styles.path}>{storageLocation}</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Export all memories"
            accessibilityRole="button"
            disabled={exporting || notes.length === 0}
            onPress={() => { void handleExport(); }}
            style={({ pressed }) => [styles.row, styles.rowWithoutTopBorder, pressed && styles.pressed]}
          >
            <View style={styles.copy}>
              <Text style={styles.title}>Export vault</Text>
              <Text style={styles.detail}>Download a portable backup of all your Markdown memories.</Text>
              {exportMessage ? <Text style={styles.exportSuccess}>{exportMessage}</Text> : null}
            </View>
            <View style={styles.actionPill}>
              <SymbolView name={{ ios: 'square.and.arrow.up', android: 'share', web: 'share' }} size={16} tintColor={colors.accent} />
              <Text style={styles.actionPillText}>{exporting ? 'Exporting…' : 'Export'}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={sharedStyles.sectionLabel}>About</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/privacy')}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={styles.copy}>
              <Text style={styles.title}>Privacy policy</Text>
              <Text style={styles.detail}>How Stories handles your memories and device data.</Text>
            </View>
            <Text style={styles.value}>Read</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxl },
  statGrid: { flexDirection: 'row', gap: 10, marginTop: spacing.sm },
  statBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlLine,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  statNumber: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '500', marginTop: 4 },
  row: { alignItems: 'flex-start', borderBottomColor: colors.divider, borderTopColor: colors.divider, borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', minHeight: sizes.rowMinimum, paddingVertical: spacing.md },
  rowWithoutTopBorder: { borderTopWidth: 0 },
  copy: { flex: 1, paddingRight: spacing.md },
  title: { color: colors.textPrimary, ...typography.action },
  detail: { color: colors.textSecondary, marginTop: spacing.xxs, ...typography.supporting },
  value: { color: colors.success, fontSize: 14, fontWeight: '600', marginTop: 2 },
  pressed: { opacity: 0.65 },
  path: { color: colors.textPrimary, marginTop: spacing.xs, ...typography.metadata },
  actionPill: { alignItems: 'center', backgroundColor: colors.accentSoft, borderRadius: 8, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingVertical: 6 },
  actionPillText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  exportSuccess: { color: colors.success, fontSize: 12, fontWeight: '600', marginTop: 6 },
  permissionActionRow: { marginTop: 6, paddingVertical: 2 },
  permissionActionText: { color: colors.accent, fontSize: 13, fontWeight: '600' },
});
