import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, spacing } from '../theme';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  accent?: boolean;
}>;

export function Card({ accent = false, children, style }: CardProps) {
  return <View style={[styles.card, accent && styles.accent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.divider,
    borderRadius: radii.card,
    borderWidth: 1,
    padding: spacing.md,
  },
  accent: {
    borderLeftColor: colors.accentWarm,
    borderLeftWidth: 3,
  },
});
