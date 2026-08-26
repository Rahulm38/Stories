import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, spacing } from '../theme';

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export function EmptyState({ action, body, icon, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText variant="section">{title}</AppText>
      <AppText variant="supporting" tone="secondary" style={styles.body}>{body}</AppText>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', paddingVertical: spacing.xxl },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.actionMuted,
    borderRadius: radii.card,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 52,
  },
  body: { marginTop: spacing.xs, maxWidth: 320 },
  action: { marginTop: spacing.md },
});
