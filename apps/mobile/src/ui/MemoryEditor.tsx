import { forwardRef } from 'react';
import { Platform, StyleSheet, TextInput, type TextStyle } from 'react-native';
import { colors, spacing, typography } from './theme';

const webInputStyle = Platform.OS === 'web'
  ? ({ outlineStyle: 'none' } as unknown as TextStyle)
  : null;

type MemoryEditorProps = {
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  minHeight?: number;
};

export const MemoryEditor = forwardRef<TextInput, MemoryEditorProps>(function MemoryEditor(
  { value, onChangeText, accessibilityLabel, placeholder, autoFocus, editable = true, minHeight = 260 },
  ref,
) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      autoCapitalize="sentences"
      autoCorrect
      autoFocus={autoFocus}
      editable={editable}
      multiline
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      ref={ref}
      selectionColor={colors.action}
      spellCheck
      style={[styles.input, !editable && styles.disabled, { minHeight }, webInputStyle]}
      textAlignVertical="top"
      value={value}
    />
  );
});

MemoryEditor.displayName = 'MemoryEditor';

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.canvas,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
    ...typography.body,
  },
  disabled: { opacity: 0.65 },
});
