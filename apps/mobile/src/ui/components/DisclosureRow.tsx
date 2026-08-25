import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { colors, sizes, spacing } from '../theme';

type DisclosureRowProps = Omit<PressableProps, 'style'> & {
  title: string;
  summary?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function DisclosureRow({ leading, summary, title, trailing, ...props }: DisclosureRowProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      android_ripple={{ color: colors.actionMuted }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.copy}>
        <AppText variant="action">{title}</AppText>
        {summary ? <AppText variant="metadata" tone="secondary" style={styles.summary}>{summary}</AppText> : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', minHeight: sizes.rowMinimum, paddingVertical: spacing.xs },
  pressed: { backgroundColor: colors.surfaceMuted },
  leading: { marginRight: spacing.sm },
  copy: { flex: 1 },
  summary: { marginTop: spacing.xxs },
  trailing: { marginLeft: spacing.sm },
});
