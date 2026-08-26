import { router } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sharedStyles, sizes, spacing } from '@/src/ui/theme';
import { AppText } from '@/src/ui/components/AppText';
import { IconButton } from '@/src/ui/components/IconButton';
import { TopAppBar } from '@/src/ui/components/TopAppBar';

export default function PrivacyScreen() {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;
      router.replace('/(tabs)/settings');
      return true;
    });
    return () => subscription.remove();
  }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/settings');
  };

  return (
    <SafeAreaView style={sharedStyles.screen} edges={['top', 'bottom']}>
      <TopAppBar
        title="Privacy policy"
        left={(
          <IconButton accessibilityLabel="Go back" onPress={goBack}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={sizes.standardIcon} tintColor={colors.action} />
          </IconButton>
        )}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText accessibilityRole="header" variant="title">Privacy policy</AppText>
        <AppText variant="metadata" tone="secondary" style={styles.updated}>Effective 26 August 2026</AppText>

        <PolicySection title="Your stories stay on your device">
          Stories keeps the content you create in the app&apos;s private storage. The app does not create an account, show ads, use analytics, or send your stories to us or to third parties.
        </PolicySection>

        <PolicySection title="Data access and sharing">
          The app accesses local story content only for capture, Library search, editing, resurfacing, sharing actions you start, and optional local reminders. Android cloud backup is disabled for Stories.
        </PolicySection>

        <PolicySection title="Retention and deletion">
          Stories remain on the device until you edit or delete them, clear the app&apos;s data, or uninstall the app. Stopping resurfacing does not delete a story; it remains in Library. Because we do not receive your stories, we cannot retrieve or delete them remotely.
        </PolicySection>

        <PolicySection title="Children and changes">
          Stories is a general productivity app and is not directed to children. If a future version adds sync, analytics, accounts, or another data practice, this policy and the Google Play Data Safety declaration will be updated before release.
        </PolicySection>

        <PolicySection title="Contact">
          Privacy questions can be raised through the support contact shown on the Stories Google Play listing.
        </PolicySection>
      </ScrollView>
    </SafeAreaView>
  );
}

function PolicySection({ children, title }: { children: string; title: string }) {
  return (
    <View style={styles.section}>
      <AppText variant="section">{title}</AppText>
      <AppText variant="body" style={styles.body}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  updated: { marginTop: spacing.xs },
  section: { marginTop: spacing.xxl },
  body: { marginTop: spacing.xs },
});
