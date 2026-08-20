import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Describes this device to the backend so the "Logged-in devices" list (§28)
 * can name it something a person recognises, rather than guessing from a
 * User-Agent that React Native does not really have.
 *
 * Sent as headers on every request; purely descriptive, never a credential.
 */
function deviceName(): string {
  const named = Constants.deviceName;
  if (named) return named;
  if (Platform.OS === 'ios') return 'iPhone';
  if (Platform.OS === 'android') return 'Android device';
  return 'OffersOffer';
}

function deviceType(): 'mobile' | 'tablet' | 'web' {
  if (Platform.OS === 'web') return 'web';
  // Expo reports iPads as 'ios'; the idiom-style flag is the only signal RN
  // gives without a native module, and a wrong guess only mislabels a row.
  return Platform.OS === 'ios' && (Platform as { isPad?: boolean }).isPad ? 'tablet' : 'mobile';
}

function platformName(): string {
  if (Platform.OS === 'ios') return 'iOS';
  if (Platform.OS === 'android') return 'Android';
  return 'Web';
}

export const deviceHeaders = {
  'X-Device-Type': deviceType(),
  'X-Device-Name': deviceName().slice(0, 120),
  'X-Device-Platform': platformName(),
} as const;
