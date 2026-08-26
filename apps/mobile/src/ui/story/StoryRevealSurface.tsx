import { StyleSheet, View } from 'react-native';
import { plainStoryText } from '@core/story-cue';
import { AppText } from '../components/AppText';
import { colors, radii, spacing } from '../theme';

type StoryRevealSurfaceProps = {
  body: string;
  label?: string;
};

export function StoryRevealSurface({ body, label = 'What you saved' }: StoryRevealSurfaceProps) {
  return (
    <View>
      <AppText variant="metadata" tone="secondary">{label}</AppText>
      <View style={styles.surface}>
        <AppText variant="body">{plainStoryText(body)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.control,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
