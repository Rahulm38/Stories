import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { colors, sizes, spacing } from '../theme';

type ListRowProps = Omit<PressableProps, 'style'> & {
  title: string;
  subtitle?: string;
  metadata?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showTopDivider?: boolean;
};

export function ListRow({ leading, metadata, showTopDivider = true, subtitle, title, trailing, ...props }: ListRowProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      android_ripple={{ color: colors.actionMuted }}
      style={({ pressed }) => [styles.row, showTopDivider && styles.divider, pressed && styles.pressed]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.copy}>
        <AppText variant="action" numberOfLines={1}>{title}</AppText>
        {subtitle ? <AppText variant="supporting" tone="secondary" numberOfLines={2} style={styles.subtitle}>{subtitle}</AppText> : null}
        {metadata ? <AppText variant="metadata" tone="secondary" style={styles.metadata}>{metadata}</AppText> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: sizes.rowMinimum,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: colors.surfaceMuted },
  leading: { marginRight: spacing.sm },
  copy: { flex: 1 },
  trailing: { marginLeft: spacing.sm },
  subtitle: { marginTop: spacing.xxs },
  metadata: { marginTop: spacing.xxs },
});
