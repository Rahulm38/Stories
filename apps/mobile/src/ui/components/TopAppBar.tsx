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
      <View style={[styles.side, styles.left]}>{left}</View>
      <View pointerEvents="none" style={styles.titleWrap}>
        <AppText variant="action" numberOfLines={1} style={styles.title}>{title}</AppText>
      </View>
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
    position: 'relative',
  },
  side: { flex: 1, minHeight: sizes.touchMinimum, justifyContent: 'center' },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
  titleWrap: { alignItems: 'center', left: 112, position: 'absolute', right: 112 },
  title: { textAlign: 'center' },
});
