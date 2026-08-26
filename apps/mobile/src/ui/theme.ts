import { StyleSheet } from 'react-native';

/**
 * Stories' semantic design system.
 *
 * Product rules:
 * - screens use semantic tokens, never raw colours;
 * - spacing follows the 4/8 baseline grid;
 * - interactive targets are at least 48dp;
 * - controls use a 12dp radius, cards 16dp, compact icon containers 8dp;
 * - typography stays compact so the app feels calm rather than dashboard-like.
 */
export const semanticColors = {
  canvas: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F0',
  textPrimary: '#242424',
  textSecondary: '#6B6C69',
  divider: '#E7E6E2',
  controlBorder: '#8A9096',
  action: '#3F5F83',
  actionMuted: '#EEF2F6',
  success: '#245A4A',
  danger: '#A84848',
  onAction: '#FFFFFF',
  accentWarm: '#D4A574',
} as const;

export const colors = {
  ...semanticColors,
  paper: semanticColors.canvas,
  ink: semanticColors.textPrimary,
  muted: semanticColors.textSecondary,
  line: semanticColors.divider,
  controlLine: semanticColors.controlBorder,
  accent: semanticColors.action,
  accentSoft: semanticColors.actionMuted,
  green: semanticColors.success,
} as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '600', letterSpacing: -0.5 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '600', letterSpacing: -0.2 },
  section: { fontSize: 16, lineHeight: 21, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  supporting: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  metadata: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  action: { fontSize: 15, lineHeight: 20, fontWeight: '600' },

  screenTitle: { fontSize: 30, lineHeight: 36, fontWeight: '600', letterSpacing: -0.5 },
  noteTitle: { fontSize: 24, lineHeight: 30, fontWeight: '600', letterSpacing: -0.2 },
  sectionTitle: { fontSize: 16, lineHeight: 21, fontWeight: '600' },
} as const;

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  none: 0,
  compact: 8,
  control: 12,
  card: 16,
  pill: 999,
  subtle: 8,
  panel: 16,
  round: 999,
} as const;

export const sizes = {
  touchMinimum: 48,
  primaryActionHeight: 48,
  rowMinimum: 64,
  compactIcon: 20,
  standardIcon: 22,
  primaryIcon: 24,
  contentMaxWidth: 680,
} as const;

export const designTokens = {
  color: semanticColors,
  type: typography,
  space: spacing,
  radius: radii,
  size: sizes,
} as const;

export const sharedStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    color: colors.textPrimary,
    ...typography.display,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xxs,
    ...typography.supporting,
  },
  sectionLabel: {
    color: colors.action,
    marginBottom: spacing.sm,
    ...typography.metadata,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hairline: {
    backgroundColor: colors.divider,
    height: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.action,
    borderRadius: radii.control,
    justifyContent: 'center',
    minHeight: sizes.primaryActionHeight,
    paddingHorizontal: spacing.lg,
  },
  primaryButtonText: {
    color: colors.onAction,
    ...typography.action,
  },
  quietButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.touchMinimum,
    minWidth: sizes.touchMinimum,
    paddingHorizontal: spacing.xs,
  },
  quietButtonText: {
    color: colors.action,
    ...typography.action,
  },
});
