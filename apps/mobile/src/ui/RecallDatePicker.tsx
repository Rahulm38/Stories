import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SymbolView } from 'expo-symbols';

import { dateInputFromDate, dateInputToDate } from '../navigation/local-date';
import { colors, radii, sizes, spacing } from './theme';
import { AppText } from './components/AppText';
import { Button } from './components/Button';
import { TextField } from './components/TextField';

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
      <TextField
        accessibilityLabel="Recall date"
        autoCapitalize="none"
        editable={!disabled}
        keyboardType="numbers-and-punctuation"
        maxLength={10}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
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
        android_ripple={{ color: colors.actionMuted }}
        disabled={disabled}
        onPress={toggleExpanded}
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <AppText variant="action" tone={value ? 'primary' : 'secondary'} style={styles.value}>{value ? labelFor(selected) : 'Choose a date'}</AppText>
        <SymbolView name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }} size={sizes.compactIcon} tintColor={colors.action} />
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

      {value && !disabled ? <Button label="Clear date" variant="text" onPress={() => onChange('')} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: sizes.touchMinimum,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  value: { flex: 1, fontWeight: '400' },
  pressed: { backgroundColor: colors.actionMuted },
});
