import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../theme';

type StatusMessageProps = {
  message: string;
  tone?: 'success' | 'danger' | 'info';
};

export function StatusMessage({ message, tone = 'info' }: StatusMessageProps) {
  const textTone = tone === 'success' ? 'success' : tone === 'danger' ? 'danger' : 'action';
  return (
    <View accessibilityLiveRegion="polite" style={[styles.base, tone === 'success' && styles.success, tone === 'danger' && styles.danger]}>
      <AppText variant="supporting" tone={textTone} style={styles.text}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colors.actionMuted, borderRadius: radii.control, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  success: { backgroundColor: colors.surfaceMuted },
  danger: { backgroundColor: colors.surface },
  text: { fontWeight: '600' },
});
