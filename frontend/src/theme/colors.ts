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
  // Header gradient tones (Figma 32:268)
  header: {
    gradientFrom: '#1a2744',
    gradientTo: '#0f1929',
  },
  // Per-category accent colors (Figma 32:2)
  category: {
    educacao: '#1d5faa',
    saude: '#1d7a4a',
    tecnologia: '#6c3fc4',
    meio_ambiente: '#2e7d32',
    assistencia_social: '#c0392b',
    arte_cultura: '#d4813a',
    esporte: '#0277bd',
  },
} as const;

export type ColorKeys = keyof typeof colors;

/** Returns the accent color for an opportunity area; falls back to brand gold. */
export function categoryColor(area: string): string {
  return (colors.category as Record<string, string>)[area] ?? colors.brand.gold;
}
