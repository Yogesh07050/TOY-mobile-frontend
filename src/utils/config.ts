// EXPO_PUBLIC_* vars are inlined at build time by Expo — no extra config needed.
// On a physical device / Android emulator, "localhost" won't reach your dev machine;
// set EXPO_PUBLIC_API_URL to your machine's LAN IP, e.g. http://192.168.1.20:3000/api.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// Static uploads are served from the API host's root, not under /api.
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
