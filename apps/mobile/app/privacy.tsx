import { router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sharedStyles } from '@/src/ui/theme';

export default function PrivacyScreen() {
  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;
      router.replace('/(tabs)/settings');
      return true;
    });
    return () => subscription.remove();
  }, []);

  const goBack = () => {
    if (Platform.OS === 'web' || router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={sharedStyles.scrollContent}>
        <Pressable accessibilityRole="button" onPress={goBack} style={styles.backButton}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text accessibilityRole="header" style={[sharedStyles.title, styles.title]}>Privacy policy</Text>
        <Text style={styles.updated}>Effective 23 August 2026</Text>

        <Text style={styles.heading}>Your memories stay on your device</Text>
        <Text style={styles.body}>
          Stories stores the notes you create as Markdown files in the app&apos;s private storage. The app does not create an account, show ads, use analytics, or send your notes to us or to third parties.
        </Text>

        <Text style={styles.heading}>Data access and sharing</Text>
        <Text style={styles.body}>
          The app accesses only the notes needed to provide its capture, library, linking, and recall features. It does not sell, share, or collect personal data. Android cloud backup is disabled for this app.
        </Text>

        <Text style={styles.heading}>Retention and deletion</Text>
        <Text style={styles.body}>
          Notes remain on the device until you edit or delete them, clear the app&apos;s data, or uninstall the app. Because we do not receive your notes, we cannot retrieve or delete them remotely.
        </Text>

        <Text style={styles.heading}>Children and changes</Text>
        <Text style={styles.body}>
          Stories is a general productivity app and is not directed to children. If a future version adds sync, analytics, accounts, or another data practice, this policy and the Google Play Data safety declaration will be updated before release.
        </Text>

        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>
          Privacy questions can be raised through the support contact shown on the Stories Google Play listing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: 'flex-start', justifyContent: 'center', minHeight: 48 },
  back: { color: colors.accent, fontSize: 16, fontWeight: '600' },
  title: { marginTop: 24 },
  updated: { color: colors.muted, fontSize: 13, marginTop: 8 },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '600', marginTop: 28 },
  body: { color: colors.ink, fontSize: 16, lineHeight: 25, marginTop: 8 },
});
