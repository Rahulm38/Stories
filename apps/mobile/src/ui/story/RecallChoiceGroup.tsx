import { PixelRatio, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { RecallStatus } from '@core/model';
import { Button } from '../components/Button';
import { spacing } from '../theme';

const OPTIONS: ReadonlyArray<{ status: RecallStatus; label: string }> = [
  { status: 'forgot', label: 'Not yet' },
  { status: 'partial', label: 'Mostly' },
  { status: 'remembered', label: 'Yes' },
];

type RecallChoiceGroupProps = {
  disabled?: boolean;
  onSelect: (status: RecallStatus) => void;
};

export function RecallChoiceGroup({ disabled = false, onSelect }: RecallChoiceGroupProps) {
  const { width } = useWindowDimensions();
  const stack = width < 390 || PixelRatio.getFontScale() >= 1.3;

  return (
    <View accessibilityRole="radiogroup" style={[styles.group, stack && styles.stack]}>
      {OPTIONS.map(({ label, status }) => (
        <Button
          key={status}
          accessibilityLabel={`${label}: how well you could tell the story`}
          disabled={disabled}
          label={label}
          variant="tonal"
          onPress={() => onSelect(status)}
          style={stack ? styles.fullWidth : styles.option}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm },
  stack: { flexDirection: 'column' },
  option: { flex: 1, paddingHorizontal: spacing.xs },
  fullWidth: { width: '100%' },
});
