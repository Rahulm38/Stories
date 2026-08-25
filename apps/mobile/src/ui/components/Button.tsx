import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, sizes, spacing } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({ disabled, label, leading, style, variant = 'primary', ...props }: ButtonProps) {
  const textTone = variant === 'primary' ? 'onAction' : variant === 'danger' ? 'danger' : 'action';
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      android_ripple={{ color: colors.actionMuted }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'text' && styles.text,
        variant === 'danger' && styles.danger,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <AppText variant="action" tone={textTone}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.control,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: sizes.touchMinimum,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
  },
  primary: { backgroundColor: colors.action },
  secondary: { backgroundColor: colors.surface, borderColor: colors.controlBorder, borderWidth: 1 },
  text: { backgroundColor: 'transparent', paddingHorizontal: spacing.sm },
  danger: { backgroundColor: 'transparent', paddingHorizontal: spacing.sm },
  leading: { marginRight: spacing.xs },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.45 },
});
