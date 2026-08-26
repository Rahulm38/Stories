import { forwardRef, useCallback, useRef, type MutableRefObject } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
  type TextStyle,
} from 'react-native';

import { colors, spacing, typography } from './theme';

export type MarkdownSelection = {
  start: number;
  end: number;
};

const webInputStyle = Platform.OS === 'web'
  ? ({ outlineStyle: 'none' } as unknown as TextStyle)
  : null;

export type MarkdownEditorProps = {
  value: string;
  onChangeText: (value: string) => void;
  accessibilityLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
  minHeight?: number;
  onSelectionChange?: (selection: MarkdownSelection) => void;
};

/**
 * Plain-text-first editor.
 *
 * Stories can still read legacy Markdown files, but composing on a phone should
 * feel like writing a note, not editing syntax. Formatting controls intentionally
 * live outside this component.
 */
export const MarkdownEditor = forwardRef<TextInput, MarkdownEditorProps>(function MarkdownEditor(
  {
    value,
    onChangeText,
    accessibilityLabel,
    placeholder,
    autoFocus,
    editable = true,
    minHeight = 260,
    onSelectionChange,
  },
  forwardedRef,
) {
  const inputRef = useRef<TextInput | null>(null);

  const assignInputRef = useCallback((input: TextInput | null) => {
    inputRef.current = input;
    if (typeof forwardedRef === 'function') forwardedRef(input);
    else if (forwardedRef) (forwardedRef as MutableRefObject<TextInput | null>).current = input;
  }, [forwardedRef]);

  const handleSelectionChange = useCallback((event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    onSelectionChange?.(event.nativeEvent.selection);
  }, [onSelectionChange]);

  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      autoCapitalize="sentences"
      autoCorrect
      autoFocus={autoFocus}
      editable={editable}
      multiline
      onChangeText={onChangeText}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textSecondary}
      ref={assignInputRef}
      selectionColor={colors.action}
      spellCheck
      style={[styles.input, !editable && styles.inputDisabled, { minHeight }, webInputStyle]}
      textAlignVertical="top"
      value={value}
    />
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.canvas,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
    ...typography.body,
  },
  inputDisabled: { opacity: 0.65 },
});
