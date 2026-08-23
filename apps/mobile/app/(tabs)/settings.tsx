import React from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sharedStyles } from '@/src/ui/theme';
import { useVault } from '@/src/vault/provider';

export default function SettingsScreen() {
  const { storageLocation } = useVault();

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top']}>
      <ScrollView style={sharedStyles.screen} contentContainerStyle={sharedStyles.scrollContent}>
      <Text style={sharedStyles.title}>Settings</Text>
      <Text style={sharedStyles.subtitle}>Local by default. Recall on your terms.</Text>

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
            <Text style={styles.detail}>Coming after Android permission and delivery testing. Your in-app recall queue already works offline.</Text>
          </View>
          <Text style={styles.pending}>Later</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={sharedStyles.sectionLabel}>Storage</Text>
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
            <Text style={styles.detail}>How Stories handles notes and device data.</Text>
          </View>
          <Text style={styles.value}>Read</Text>
        </Pressable>
      </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 34 },
  row: { alignItems: 'flex-start', borderBottomColor: colors.line, borderTopColor: colors.line, borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 16 },
  rowWithoutTopBorder: { borderTopWidth: 0 },
  copy: { flex: 1, paddingRight: 16 },
  title: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  detail: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  value: { color: colors.green, fontSize: 14, fontWeight: '600', marginTop: 2 },
  pending: { color: colors.muted, fontSize: 13, fontWeight: '500', marginTop: 2 },
  pressed: { opacity: 0.65 },
  path: { color: colors.ink, fontSize: 12, lineHeight: 18, marginTop: 9 },
  body: { color: colors.ink, fontSize: 17, lineHeight: 27 },
});
