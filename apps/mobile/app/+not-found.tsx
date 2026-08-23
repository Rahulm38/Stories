import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, sharedStyles, spacing, typography } from '@/src/ui/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.textPrimary,
          title: 'Not found',
        }}
      />
      <SafeAreaView style={sharedStyles.screen} edges={['bottom']}>
        <View style={styles.container}>
          <Text style={styles.title}>This screen isn&apos;t available.</Text>
          <Text style={styles.detail}>Return to Today to continue with your memories.</Text>

          <Link href="/" replace style={styles.link}>
            <Text style={sharedStyles.quietButtonText}>Back to Today</Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
    ...typography.sectionTitle,
  },
  detail: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 300,
    textAlign: 'center',
    ...typography.supporting,
  },
  link: {
    ...sharedStyles.quietButton,
    marginTop: spacing.md,
  },
});
