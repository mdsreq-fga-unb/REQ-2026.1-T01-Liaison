/**
 * Liaison Design System — Colors
 * Extracted from Figma prototypes (fileKey: f6bQuVohTvZLF5WWPEbNob)
 */
export const colors = {
  brand: {
    navy: '#1a2744',
    gold: '#d4813a',
  },
  neutral: {
    bg: '#faf8f4',
    border: '#ddd8ce',
    white: '#ffffff',
  },
  text: {
    primary: '#1a2744',
    secondary: '#7a8299',
    muted: 'rgba(255,255,255,0.55)',
    light: 'rgba(255,255,255,0.35)',
    info: '#3a4560',
  },
  accent: {
    lightBg: '#fdf5ec',
    subtleBorder: 'rgba(212,129,58,0.2)',
    subtleShadow: 'rgba(212,129,58,0.18)',
  },
  success: '#1d7a4a',
} as const;

export type ColorKeys = keyof typeof colors;
