import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { colors, radii, sizes, spacing, typography } from '../theme';

export function TextField({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.textSecondary}
      selectionColor={colors.action}
      style={[styles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: sizes.touchMinimum,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...typography.action,
    fontWeight: '400',
  },
});
