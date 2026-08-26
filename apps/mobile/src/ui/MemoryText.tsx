import { StyleSheet } from 'react-native';
import { plainMemoryText } from '@core/story-cue';
import { AppText } from './components/AppText';
import { spacing } from './theme';

type MemoryTextProps = {
  body: string;
};

export function MemoryText({ body }: MemoryTextProps) {
  return <AppText variant="body" style={styles.body}>{plainMemoryText(body)}</AppText>;
}

const styles = StyleSheet.create({
  body: { paddingBottom: spacing.xl },
});
