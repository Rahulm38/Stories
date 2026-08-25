import { StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../theme';

export function SectionHeader({ children }: { children: string }) {
  return <AppText variant="metadata" tone="action" style={styles.label}>{children}</AppText>;
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
  },
});
