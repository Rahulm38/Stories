import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { storyPreview } from '@core/story-cue';
import { AppText } from '../components/AppText';
import { colors, sizes, spacing } from '../theme';

type StoryListItemProps = {
  body: string;
  dateLabel?: string;
  onPress: () => void;
  showTopDivider?: boolean;
};

export function StoryListItem({ body, dateLabel, onPress, showTopDivider = true }: StoryListItemProps) {
  const preview = storyPreview(body);

  return (
    <Pressable
      accessibilityLabel={`Open story: ${preview}`}
      accessibilityRole="button"
      android_ripple={{ color: colors.actionMuted }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, showTopDivider && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <AppText variant="body" numberOfLines={2} style={styles.preview}>{preview}</AppText>
        {dateLabel ? <AppText variant="metadata" tone="secondary" style={styles.date}>{dateLabel}</AppText> : null}
      </View>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={sizes.compactIcon} tintColor={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 76,
    paddingVertical: spacing.sm,
  },
  divider: { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
  pressed: { backgroundColor: colors.surfaceMuted },
  copy: { flex: 1, paddingRight: spacing.sm },
  preview: { fontWeight: '500' },
  date: { marginTop: spacing.xs },
});
