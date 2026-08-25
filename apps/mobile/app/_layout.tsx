import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider } from '@/src/vault/provider';
import { colors } from '@/src/ui/theme';
import { configureReminderPresentation } from '@/src/notifications/reminder-scheduler';

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  useEffect(() => {
    void configureReminderPresentation().catch(() => {
      // Notifications are optional; app startup and local memories must remain available.
    });
  }, []);

  return (
    <SafeAreaProvider style={styles.provider}>
      <View style={styles.appFrame}>
        <VaultProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="capture" />
            <Stack.Screen name="note/[id]" />
            <Stack.Screen name="privacy" />
          </Stack>
        </VaultProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    backgroundColor: colors.paper,
    flex: 1,
  },
  appFrame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    width: '100%',
  },
});
