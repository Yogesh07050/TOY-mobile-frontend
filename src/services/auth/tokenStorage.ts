import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// expo-secure-store's web module is a stub with zero implemented methods
// (Keychain/Keystore have no browser equivalent) — every call throws on web.
// iOS/Android are the real targets and get genuine secure storage below;
// web falls back to AsyncStorage (browser localStorage) so a token actually
// persists for the session instead of every write silently going nowhere -
// the alternative isn't "secure storage on web", it's just "broken on web".
async function getItem(key: string): Promise<string | null> {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(key)
    : SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  await (Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value));
}

async function deleteItem(key: string): Promise<void> {
  await (Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key));
}

export async function getTokens(): Promise<TokenPair | null> {
  const [accessToken, refreshToken] = await Promise.all([getItem(ACCESS_TOKEN_KEY), getItem(REFRESH_TOKEN_KEY)]);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([setItem(ACCESS_TOKEN_KEY, tokens.accessToken), setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([deleteItem(ACCESS_TOKEN_KEY), deleteItem(REFRESH_TOKEN_KEY)]);
}
