import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { spacing } from '../theme';

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ action, body, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="section">{title}</AppText>
      <AppText variant="supporting" tone="secondary" style={styles.body}>{body}</AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', paddingVertical: spacing.xxl },
  body: { marginTop: spacing.xs, maxWidth: 320 },
  action: { marginTop: spacing.md },
});
