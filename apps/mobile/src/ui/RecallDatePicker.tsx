import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SymbolView } from 'expo-symbols';

import { dateInputFromDate, dateInputToDate } from '../navigation/local-date';
import { colors, sizes } from './theme';

export type RecallDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function labelFor(date: Date): string {
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function RecallDatePicker({ value, onChange, disabled = false }: RecallDatePickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [fallbackDate, setFallbackDate] = useState(() => new Date());

  if (Platform.OS === 'web') {
    return (
      <TextInput
        accessibilityLabel="Recall date"
        autoCapitalize="none"
        editable={!disabled}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.muted}
        style={styles.field}
        value={value}
      />
    );
  }

  const selected = dateInputToDate(value) ?? fallbackDate;

  const toggleExpanded = () => {
    setFallbackDate(new Date());
    setExpanded((open) => !open);
  };

  const handlePicked = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setExpanded(false);
    if (event.type === 'neutralButtonPressed') {
      onChange('');
      return;
    }
    if (event.type !== 'set' || !date) return;
    onChange(dateInputFromDate(date));
  };

  return (
    <View>
      <Pressable
        accessibilityHint={expanded ? 'Hides the calendar' : 'Shows the calendar'}
        accessibilityLabel="Recall date"
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled }}
        accessibilityValue={{ text: value ? labelFor(selected) : 'Not set' }}
        disabled={disabled}
        onPress={toggleExpanded}
        style={({ pressed }) => [styles.field, styles.row, pressed && styles.pressed]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value ? labelFor(selected) : 'Choose a date'}</Text>
        <SymbolView
          name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
          size={16}
          tintColor={colors.accent}
        />
      </Pressable>

      {expanded ? (
        <DateTimePicker
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          mode="date"
          neutralButton={{ label: 'Clear' }}
          onChange={handlePicked}
          value={selected}
        />
      ) : null}

      {value && !disabled ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange('')}
          style={({ pressed }) => [styles.clearRow, pressed && styles.pressed]}
        >
          <Text style={styles.clearText}>Clear date</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.surface,
    borderColor: colors.controlLine,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: sizes.primaryActionHeight,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  placeholder: { color: colors.muted },
  pressed: { opacity: 0.62 },
  row: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  value: { color: colors.ink, flex: 1, fontSize: 16 },
  clearRow: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingVertical: 6 },
  clearText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
