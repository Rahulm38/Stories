import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';
import { colors, typography } from '../theme';

type Variant = 'display' | 'title' | 'section' | 'body' | 'supporting' | 'metadata' | 'action';
type Tone = 'primary' | 'secondary' | 'action' | 'success' | 'danger' | 'onAction';

type AppTextProps = PropsWithChildren<TextProps & {
  variant?: Variant;
  tone?: Tone;
}>;

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  action: colors.action,
  success: colors.success,
  danger: colors.danger,
  onAction: colors.onAction,
};

export function AppText({ children, style, tone = 'primary', variant = 'body', ...props }: AppTextProps) {
  return (
    <Text {...props} style={[typography[variant], { color: toneColor[tone] }, style]}>
      {children}
    </Text>
  );
}
