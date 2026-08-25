import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../theme';

export function Snackbar({ message }: { message: string }) {
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" style={styles.bar}>
      <AppText variant="supporting" tone="onAction" style={styles.text}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.textPrimary,
    borderRadius: radii.control,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: { fontWeight: '600' },
});
