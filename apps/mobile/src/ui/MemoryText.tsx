import { StyleSheet, View } from 'react-native';
import { plainMemoryText } from '@core/story-cue';
import { AppText } from './components/AppText';
import { colors, radii, spacing } from './theme';

type MemoryTextProps = {
  body: string;
};

export function MemoryText({ body }: MemoryTextProps) {
  return (
    <View style={styles.container}>
      <AppText variant="body" style={styles.body}>{plainMemoryText(body)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceMuted,
    borderLeftColor: colors.accentWarm,
    borderLeftWidth: 2,
    borderRadius: radii.compact,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  body: {
    color: colors.textPrimary,
  },
});
