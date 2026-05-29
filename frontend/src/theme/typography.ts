/**
 * Liaison Design System — Typography
 * Fonts: Playfair Display (titles) + DM Sans (body/UI)
 * Extracted from Figma prototypes (fileKey: f6bQuVohTvZLF5WWPEbNob)
 */
import { TextStyle } from 'react-native';

export const fontFamilies = {
  playfairBold: 'PlayfairDisplay_700Bold',
  playfairBoldItalic: 'PlayfairDisplay_700Bold_Italic',
  dmSansRegular: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansSemiBold: 'DMSans_600SemiBold',
  dmSansBold: 'DMSans_700Bold',
} as const;

export type FontFamilyKey = keyof typeof fontFamilies;

/** Scale factors that should be used when applying fontSize to keep visual consistency */
export const scale = {
  /** For design that targets 390px wide screens (Figma mobile) */
  fontSize: (size: number, screenWidth: number = 390): number => {
    return size * (screenWidth / 390);
  },
};

export const typography = {
  h1: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: 0,
  } as TextStyle,

  'h1-accent': {
    fontFamily: fontFamilies.playfairBoldItalic,
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: 0,
  } as TextStyle,

  h2: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,

  label: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 13,
    lineHeight: 20.8,
    letterSpacing: 0,
  } as TextStyle,

  'label-sm': {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    lineHeight: 17.6,
    letterSpacing: 0.88,
  } as TextStyle,

  'label-upper': {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 13,
    lineHeight: 20.8,
    letterSpacing: 1.56,
    textTransform: 'uppercase',
  } as TextStyle,

  body: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 13,
    lineHeight: 20.8,
    letterSpacing: 0,
  } as TextStyle,

  'body-sm': {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    lineHeight: 17.6,
    letterSpacing: 0.6,
  } as TextStyle,

  button: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 15,
    letterSpacing: 0,
  } as TextStyle,

  input: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 15,
    letterSpacing: 0,
  } as TextStyle,
};

export type TypographyKey = keyof typeof typography;
