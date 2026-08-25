import { StyleSheet, View } from 'react-native';
import { Chip } from './Chip';
import { spacing } from '../theme';

type Option<T extends string> = { label: string; value: T };

type SegmentedControlProps<T extends string> = {
  accessibilityLabel: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: ReadonlyArray<Option<T>>;
  value: T;
};

export function SegmentedControl<T extends string>({ accessibilityLabel, disabled, onChange, options, value }: SegmentedControlProps<T>) {
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup" style={styles.row}>
      {options.map((option) => (
        <View key={option.value} style={styles.item}>
          <Chip disabled={disabled} label={option.label} selected={value === option.value} onPress={() => onChange(option.value)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  item: { flex: 1 },
});
