import { forwardRef, useCallback, useRef, useState, type MutableRefObject } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextStyle,
  type TextInputSelectionChangeEventData,
} from 'react-native';

import { colors } from './theme';

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
  const [focused, setFocused] = useState(false);

  const assignInputRef = useCallback((input: TextInput | null) => {
    inputRef.current = input;
    if (typeof forwardedRef === 'function') {
      forwardedRef(input);
    } else if (forwardedRef) {
      (forwardedRef as MutableRefObject<TextInput | null>).current = input;
    }
  }, [forwardedRef]);

  const handleSelectionChange = useCallback((
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    const selection = event.nativeEvent.selection;
    onSelectionChange?.(selection);
  }, [onSelectionChange]);

  const handleChangeText = useCallback((nextValue: string) => {
    onChangeText(nextValue);
  }, [onChangeText]);

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="sentences"
        autoCorrect
        autoFocus={autoFocus}
        editable={editable}
        multiline
        onChangeText={handleChangeText}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        ref={assignInputRef}
        selectionColor={colors.accent}
        spellCheck
        style={[styles.input, focused && styles.inputFocused, !editable && styles.inputDisabled, { minHeight }, webInputStyle]}
        textAlignVertical="top"
        value={value}
      />
    </View>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 27,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  inputFocused: {
    borderColor: colors.accent,
  },
  inputDisabled: {
    opacity: 0.65,
  },
});
