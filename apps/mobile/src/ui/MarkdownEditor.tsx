import { forwardRef, useCallback, useRef, useState, type MutableRefObject } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  Text,
  Pressable,
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

const FORMAT_BUTTONS = [
  { label: 'H', prefix: '## ', suffix: '' },
  { label: 'B', prefix: '**', suffix: '**' },
  { label: 'I', prefix: '*', suffix: '*' },
  { label: '>', prefix: '> ', suffix: '' },
  { label: '•', prefix: '- ', suffix: '' },
  { label: '☐', prefix: '- [ ] ', suffix: '' },
  { label: '</>', prefix: '`', suffix: '`' },
  { label: '[[', prefix: '[[', suffix: ']]' },
];

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
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });

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
    const sel = event.nativeEvent.selection;
    setSelection(sel);
    onSelectionChange?.(sel);
  }, [onSelectionChange]);

  const applyFormat = useCallback((prefix: string, suffix: string) => {
    const start = selection.start;
    const end = selection.end;
    const before = value.substring(0, start);
    const selected = value.substring(start, end);
    const after = value.substring(end);
    onChangeText(`${before}${prefix}${selected}${suffix}${after}`);
  }, [value, selection, onChangeText]);

  const handleChangeText = useCallback((nextValue: string) => {
    onChangeText(nextValue);
  }, [onChangeText]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar} keyboardShouldPersistTaps="always">
        {FORMAT_BUTTONS.map(({ label, prefix, suffix }) => (
          <Pressable
            key={label}
            onPress={() => applyFormat(prefix, suffix)}
            style={({ pressed }) => [styles.formatButton, pressed && styles.formatButtonPressed]}
          >
            <Text style={styles.formatButtonText}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
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
    borderColor: colors.controlLine,
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
  toolbar: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.controlLine,
    paddingBottom: 8,
  },
  formatButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.controlLine,
  },
  formatButtonPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  formatButtonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '600',
  },
});
