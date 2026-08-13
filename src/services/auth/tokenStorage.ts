import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// expo-secure-store has no backing implementation on web (Keychain/Keystore
// have no browser equivalent) — its web module is a stub whose methods throw.
// The app's real targets are iOS/Android, where every call below just works;
// on web we degrade to "no persisted session" instead of crashing every
// request that goes through the axios interceptor in api/client.ts.
async function safeSecureStoreCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function getTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([
    safeSecureStoreCall(() => SecureStore.getItemAsync(ACCESS_TOKEN_KEY), null),
    safeSecureStoreCall(() => SecureStore.getItemAsync(REFRESH_TOKEN_KEY), null),
  ]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    safeSecureStoreCall(() => SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken), undefined),
    safeSecureStoreCall(() => SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken), undefined),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    safeSecureStoreCall(() => SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY), undefined),
    safeSecureStoreCall(() => SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY), undefined),
  ]);
}
