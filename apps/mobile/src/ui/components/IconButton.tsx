import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { colors, radii, sizes } from '../theme';

type IconButtonProps = Omit<PressableProps, 'style'> & {
  accessibilityLabel: string;
  children: ReactNode;
  danger?: boolean;
};

export function IconButton({ accessibilityLabel, children, danger = false, disabled, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      android_ripple={{ color: colors.actionMuted, borderless: true, radius: sizes.touchMinimum / 2 }}
      disabled={disabled}
      hitSlop={2}
      style={({ pressed }) => [styles.base, danger && styles.danger, pressed && styles.pressed, disabled && styles.disabled]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: sizes.touchMinimum,
    justifyContent: 'center',
    width: sizes.touchMinimum,
  },
  danger: { backgroundColor: colors.surface },
  pressed: { backgroundColor: colors.actionMuted },
  disabled: { opacity: 0.4 },
});
