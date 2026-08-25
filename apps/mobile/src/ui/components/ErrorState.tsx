import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../theme';

type ErrorStateProps = {
  title: string;
  body: string;
  hint?: string;
  action?: ReactNode;
};

export function ErrorState({ action, body, hint, title }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <AppText accessibilityRole="header" variant="section" style={styles.center}>{title}</AppText>
      <AppText accessibilityRole="alert" variant="supporting" tone="danger" style={[styles.body, styles.center]}>{body}</AppText>
      {hint ? <AppText variant="supporting" tone="secondary" style={[styles.hint, styles.center]}>{hint}</AppText> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl },
  center: { textAlign: 'center' },
  body: { marginTop: spacing.xs, maxWidth: 340 },
  hint: { marginTop: spacing.xs, maxWidth: 340 },
  action: { marginTop: spacing.md },
});
