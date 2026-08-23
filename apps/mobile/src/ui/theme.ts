import { StyleSheet } from 'react-native';

export const colors = {
  paper: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F0',
  ink: '#242424',
  muted: '#6B6C69',
  line: '#E7E6E2',
  accent: '#3F5F83',
  accentSoft: '#EEF2F6',
  bookSoft: '#EDF2F7',
  experienceSoft: '#F1F2F4',
  green: '#245A4A',
  danger: '#A84848',
};

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
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: -0.8,
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
    borderRadius: 13,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quietButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 8,
  },
  quietButtonText: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
