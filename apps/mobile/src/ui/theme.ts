import { StyleSheet } from 'react-native';

/**
 * Stories' semantic design tokens.
 *
 * Screens should prefer these roles over literal values. The legacy `colors`
 * names below remain aliases so this foundation can land without forcing a
 * risky, all-at-once screen migration.
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
  bookSoft: '#EDF2F7',
  experienceSoft: '#F1F2F4',
  green: semanticColors.success,
} as const;

export const typography = {
  screenTitle: { fontSize: 34, lineHeight: 41, fontWeight: '600', letterSpacing: -0.8 },
  noteTitle: { fontSize: 27, lineHeight: 34, fontWeight: '600', letterSpacing: -0.35 },
  sectionTitle: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 27, fontWeight: '400' },
  action: { fontSize: 16, lineHeight: 21, fontWeight: '600' },
  supporting: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  metadata: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
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
  subtle: 8,
  control: 11,
  panel: 14,
  round: 999,
} as const;

export const sizes = {
  touchMinimum: 44,
  primaryActionHeight: 48,
  rowMinimum: 56,
  compactIcon: 18,
  standardIcon: 22,
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
    backgroundColor: colors.paper,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 36,
  },
  title: {
    color: colors.ink,
    ...typography.screenTitle,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 4,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.25,
    marginBottom: 11,
  },
  hairline: {
    backgroundColor: colors.line,
    height: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.panel,
    justifyContent: 'center',
    minHeight: sizes.primaryActionHeight,
    paddingHorizontal: 18,
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
    paddingHorizontal: 8,
  },
  quietButtonText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
