import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StoryTrigger } from '@core/story-cue';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { colors, radii, spacing } from '../theme';

type StoryTriggerCardProps = {
  trigger: StoryTrigger;
  ageLabel?: string;
  coachingPrompt?: string;
  headerAction?: ReactNode;
  hintVisible?: boolean;
  disabled?: boolean;
  onShowStory: () => void;
  onNeedHint?: () => void;
  onTomorrow?: () => void;
};

export function StoryTriggerCard({
  ageLabel,
  coachingPrompt = 'Tell it like you’d tell a friend.',
  disabled = false,
  headerAction,
  hintVisible = false,
  onNeedHint,
  onShowStory,
  onTomorrow,
  trigger,
}: StoryTriggerCardProps) {
  const canHint = Boolean(trigger.secondary && onNeedHint && !hintVisible);

  return (
    <Card>
      <View style={styles.header}>
        <AppText variant="metadata" tone="action" style={styles.label}>Story trigger</AppText>
        {ageLabel || headerAction ? (
          <View style={styles.headerRight}>
            {ageLabel ? <AppText variant="metadata" tone="secondary">{ageLabel}</AppText> : null}
            {headerAction}
          </View>
        ) : null}
      </View>

      <AppText accessibilityRole="header" variant="title" style={styles.primary}>{trigger.primary}</AppText>

      {hintVisible && trigger.secondary ? (
        <View accessibilityLiveRegion="polite" style={styles.hint}>
          <AppText variant="metadata" tone="secondary">Hint</AppText>
          <AppText variant="section" style={styles.hintText}>{trigger.secondary}</AppText>
        </View>
      ) : null}

      <AppText variant="supporting" tone="secondary" style={styles.prompt}>{coachingPrompt}</AppText>

      <Button disabled={disabled} label="Show story" onPress={onShowStory} style={styles.primaryAction} />

      {canHint || onTomorrow ? (
        <View style={styles.secondaryActions}>
          {canHint ? <Button disabled={disabled} label="Need a hint?" variant="text" onPress={onNeedHint} /> : null}
          {onTomorrow ? <Button disabled={disabled} label="Tomorrow" variant="text" onPress={onTomorrow} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerRight: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  label: { fontWeight: '600', letterSpacing: 0.2 },
  primary: { marginTop: spacing.md },
  hint: { backgroundColor: colors.actionMuted, borderRadius: radii.control, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  hintText: { marginTop: spacing.xxs },
  prompt: { marginTop: spacing.md },
  primaryAction: { marginTop: spacing.lg, width: '100%' },
  secondaryActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
});
