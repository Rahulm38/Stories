import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, sizes, spacing } from '../theme';

type TopAppBarProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
};

export function TopAppBar({ left, right, title }: TopAppBarProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.side}>{left}</View>
      <AppText variant="action" numberOfLines={1} style={styles.title}>{title}</AppText>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    borderBottomColor: colors.divider,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: spacing.sm,
  },
  side: { minHeight: sizes.touchMinimum, minWidth: sizes.touchMinimum, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  title: { flex: 1, paddingHorizontal: spacing.xs, textAlign: 'center' },
});
