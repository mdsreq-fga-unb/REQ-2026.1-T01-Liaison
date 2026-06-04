/**
 * API configuration for the Liaison mobile app.
 *
 * The backend runs in Docker and is exposed on port 8000.
 *
 * Default (no config): http://localhost:8000/api/v1
 *   Works for Expo web (browser on same machine) and emulators.
 *
 * Expo Go on a physical device needs your machine's LOCAL network IP
 * (not localhost). Create a `.env.local` file at the frontend root:
 *
 *   EXPO_PUBLIC_API_BASE_URL=http://<YOUR_IP>:8000/api/v1
 *
 * Use the SAME IP you set as LOCAL_IP in the root `.env` file.
 * Find your IP: ipconfig getifaddr en0 (macOS) | hostname -I (Linux).
 *
 * Expo only exposes env vars prefixed with EXPO_PUBLIC_ to the app bundle.
 */

export const API_BASE_URL: string =
  process.env["EXPO_PUBLIC_API_URL"] ?? "http://localhost:8000/api/v1";

/**
 * Helper to build a full API endpoint URL.
 *
 * @example
 *   apiUrl("/auth/token/")  // → "http://localhost:8000/api/v1/auth/token/"
 */
export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
