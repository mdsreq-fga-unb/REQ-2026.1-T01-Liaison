/**
 * Liaison Design System — expo-font loading hook
 * Loads Playfair Display (Bold, BoldItalic) and DM Sans (Regular, Medium, SemiBold, Bold)
 */
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
} from '@expo-google-fonts/playfair-display';

/**
 * Hook to load all required custom fonts for the Liaison design system.
 * Uses @expo-google-fonts packages which bundle .ttf files.
 *
 * DM Sans fonts are loaded via @expo-google-fonts/dm-sans.
 * We import them here using the standard expo-font approach
 * since useFonts can accept fonts from multiple packages.
 */
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

export function useLiaisonFonts() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_700Bold_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  return { fontsLoaded, fontError };
}
