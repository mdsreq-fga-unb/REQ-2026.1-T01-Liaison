/**
 * Liaison Design System — Spacing, Radius, Shadows
 * Extracted from Figma prototypes (fileKey: f6bQuVohTvZLF5WWPEbNob)
 */
import { ViewStyle } from 'react-native';

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 75,
  round: 9999,
  step: 15,
} as const;

export const spacing = {
  /** Screen horizontal padding — Login uses 24px, Cadastro steps use 20px */
  horizontal: {
    login: 24,
    step: 20,
  },
  /** Form field gap */
  formGap: 20,
  /** Label to input spacing */
  labelGap: 8,
  /** Input padding horizontal */
  inputHorizontal: 16,
} as const;

export const shadows = {
  card: {
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  } as ViewStyle,

  accentGlow: {
    shadowColor: 'rgba(212,129,58,0.18)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  } as ViewStyle,

  tabActive: {
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  } as ViewStyle,
};

export const components = {
  input: {
    height: 54,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    paddingHorizontal: spacing.inputHorizontal,
  },
  button: {
    height: 52,
    borderRadius: radius.sm,
  },
  tabBar: {
    height: 47,
    borderRadius: radius.md,
    padding: 3,
  },
  stepCircle: {
    size: 30,
    borderRadius: radius.step,
  },
  connectorLine: {
    height: 2,
  },
  progressLine: {
    height: 3,
  },
} as const;
