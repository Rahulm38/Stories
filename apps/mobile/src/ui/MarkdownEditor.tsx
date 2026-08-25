import { forwardRef, useCallback, useRef, useState, type MutableRefObject } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
  type TextStyle,
} from 'react-native';

import { colors, radii, sizes, spacing, typography } from './theme';

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
  showToolbar?: boolean;
  onSelectionChange?: (selection: MarkdownSelection) => void;
};

const FORMAT_BUTTONS = [
  { label: 'H', accessibilityLabel: 'Heading', prefix: '## ', suffix: '' },
  { label: 'B', accessibilityLabel: 'Bold', prefix: '**', suffix: '**' },
  { label: 'I', accessibilityLabel: 'Italic', prefix: '*', suffix: '*' },
  { label: '>', accessibilityLabel: 'Quote', prefix: '> ', suffix: '' },
  { label: '•', accessibilityLabel: 'Bulleted list', prefix: '- ', suffix: '' },
  { label: '☐', accessibilityLabel: 'Checklist', prefix: '- [ ] ', suffix: '' },
  { label: '</>', accessibilityLabel: 'Inline code', prefix: '`', suffix: '`' },
  { label: '[[', accessibilityLabel: 'Link to another memory', prefix: '[[', suffix: ']]' },
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
    showToolbar = true,
    onSelectionChange,
  },
  forwardedRef,
) {
  const inputRef = useRef<TextInput | null>(null);
  const [focused, setFocused] = useState(false);
  const [selection, setSelection] = useState<MarkdownSelection>({ start: 0, end: 0 });

  const assignInputRef = useCallback((input: TextInput | null) => {
    inputRef.current = input;
    if (typeof forwardedRef === 'function') forwardedRef(input);
    else if (forwardedRef) (forwardedRef as MutableRefObject<TextInput | null>).current = input;
  }, [forwardedRef]);

  const handleSelectionChange = useCallback((event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
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
  }, [onChangeText, selection.end, selection.start, value]);

  return (
    <View style={styles.container}>
      {showToolbar ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar} keyboardShouldPersistTaps="always">
          {FORMAT_BUTTONS.map(({ label, accessibilityLabel: buttonLabel, prefix, suffix }) => (
            <Pressable
              accessibilityLabel={buttonLabel}
              accessibilityRole="button"
              android_ripple={{ color: colors.actionMuted }}
              disabled={!editable}
              key={label}
              onPress={() => applyFormat(prefix, suffix)}
              style={({ pressed }) => [styles.formatButton, pressed && styles.formatButtonPressed, !editable && styles.inputDisabled]}
            >
              <Text style={styles.formatButtonText}>{label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="sentences"
        autoCorrect
        autoFocus={autoFocus}
        editable={editable}
        multiline
        onChangeText={onChangeText}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        ref={assignInputRef}
        selectionColor={colors.action}
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
  container: { backgroundColor: colors.canvas },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
  },
  inputFocused: { borderColor: colors.action },
  inputDisabled: { opacity: 0.65 },
  toolbar: {
    borderBottomColor: colors.controlBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingBottom: spacing.xs,
  },
  formatButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.compact,
    borderWidth: 1,
    height: sizes.touchMinimum,
    justifyContent: 'center',
    marginRight: spacing.xs,
    minWidth: sizes.touchMinimum,
  },
  formatButtonPressed: { backgroundColor: colors.actionMuted, borderColor: colors.action },
  formatButtonText: { color: colors.textPrimary, ...typography.action },
});
