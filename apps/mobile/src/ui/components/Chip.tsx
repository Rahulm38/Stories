import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { colors, radii, sizes, spacing } from '../theme';

type ChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  selected?: boolean;
};

export function Chip({ disabled, label, selected = false, ...props }: ChipProps) {
  return (
    <Pressable
      {...props}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      android_ripple={{ color: colors.actionMuted }}
      disabled={disabled}
      style={({ pressed }) => [styles.base, selected && styles.selected, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <AppText variant="metadata" tone={selected ? 'action' : 'secondary'} style={styles.label}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderColor: colors.controlBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: sizes.touchMinimum,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
  },
  selected: {
    backgroundColor: colors.actionMuted,
    borderColor: colors.action,
  },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.45 },
  label: { fontWeight: '600' },
});
