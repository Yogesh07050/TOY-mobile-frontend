import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as notificationsApi from '../../api/notifications';
import { deviceHeaders } from '../../utils/device';

/**
 * Device-side push plumbing (Push §37).
 *
 * Split from the React layer on purpose: this file owns permission, the token
 * and the backend registration, and knows nothing about navigation. The
 * provider in `PushNotificationsProvider.tsx` owns the listeners and the taps.
 *
 * Nothing here throws. A phone with push permission denied, an emulator with
 * no Play Services, or a dev client without a project id are all normal states
 * the app has to keep running in - the in-app notification centre works
 * regardless, because the backend records every notification either way.
 */

/**
 * The token last registered with the backend. Kept so sign-out can unregister
 * precisely this device without asking the OS for the token again (which fails
 * once permission has been revoked).
 */
const PUSH_TOKEN_KEY = 'offers.pushToken';

/** Remembers that the priming sheet was already answered (Push §5). */
const PRIMER_ANSWERED_KEY = 'offers.pushPrimerAnswered';

/** Counts the "value moments" that earn the right to ask for permission (Push §5). */
const ENGAGEMENT_KEY = 'offers.pushEngagement';

/** How many value moments before the app is allowed to raise the primer. */
export const ENGAGEMENT_THRESHOLD = 3;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

/**
 * The EAS project id, which SDK 57's `getExpoPushTokenAsync` requires as an
 * explicit argument — it is no longer inferred from the manifest.
 *
 * Read from both places EAS writes it: `expoConfig.extra.eas.projectId` in a
 * normal build, `easConfig.projectId` in some dev-client contexts.
 */
function projectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  return extra?.eas?.projectId ?? (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
}

/**
 * Android requires a channel before any notification can be shown, and the
 * channel — not the message — carries the importance that decides whether a
 * notification makes a sound or appears as a heads-up banner.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Offers and reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/**
 * What the OS currently thinks, without prompting.
 *
 * 'undetermined' is the only state the primer may appear in: it means the
 * system dialog has never been shown, and on iOS it can only ever be shown
 * once — which is exactly why Push §5 says to earn it first.
 */
export async function getPermissionState(): Promise<PermissionState> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.granted) return 'granted';
    return permissions.canAskAgain ? 'undetermined' : 'denied';
  } catch {
    return 'denied';
  }
}

/** Raises the OS permission dialog. Returns whether it ended up granted. */
export async function requestPermission(): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    const { granted } = await Notifications.requestPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

/**
 * Fetches this device's Expo token and registers it against the signed-in
 * account. Safe to call on every launch: the backend upserts on the token, so
 * repeat registrations refresh the row rather than duplicating it, and a token
 * that rotated simply replaces the old one.
 *
 * @returns the token when registration succeeded, otherwise null.
 */
export async function registerDevice(): Promise<string | null> {
  const state = await getPermissionState();
  if (state !== 'granted') return null;

  const id = projectId();
  if (!id) {
    // Nothing to be done at runtime — remote push needs the project the token
    // is issued against. Local notifications still work.
    console.warn(
      '[push] no EAS projectId in app config; remote push is unavailable. ' +
        'Add expo.extra.eas.projectId to app.json (eas init writes it for you).',
    );
    return null;
  }

  try {
    await ensureAndroidChannel();
    // Throws on a simulator or an emulator without Play Services, which the
    // catch below treats as "no push here" - there is no separate device check
    // because SDK 57 removed `Constants.isDevice`, and adding `expo-device`
    // for one boolean would buy nothing this catch does not already handle.
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId: id });

    await notificationsApi.registerPushDevice({
      token,
      transport: 'expo',
      platform: deviceHeaders['X-Device-Platform'],
      deviceName: deviceHeaders['X-Device-Name'],
    });
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (error) {
    // Offline, or Expo's token service unreachable. The next launch retries.
    console.warn('[push] device registration failed:', (error as Error).message);
    return null;
  }
}

/**
 * Stops push to this device and forgets the token.
 *
 * Called from sign-out *before* the session is cleared, since the endpoint is
 * authenticated. The local key is dropped either way: if the network call
 * fails, the worst case is a stale row that the backend retires on its first
 * `DeviceNotRegistered`, whereas keeping the token locally would leave the
 * next account on this phone thinking it is already registered.
 */
export async function unregisterDevice(): Promise<void> {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY).catch(() => null);
  if (!token) return;
  try {
    await notificationsApi.unregisterPushDevice(token);
  } catch {
    // Sign-out must never fail because push could not be cleaned up.
  }
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY).catch(() => {});
}

// ---- Permission priming (Push §5) -------------------------------------------

/**
 * Records a moment where notifications visibly earn their keep — saving an
 * offer, opening an offer that is about to expire.
 *
 * Push §5 is explicit that permission must not be requested on first launch.
 * Counting these instead of using a timer means the ask lands after the
 * customer has seen the thing the notification is about, which is the
 * difference between a prompt that reads as useful and one that reads as spam.
 */
export async function recordEngagement(): Promise<void> {
  try {
    const current = Number((await AsyncStorage.getItem(ENGAGEMENT_KEY)) ?? '0');
    // Stop counting past the threshold; the number itself is never shown.
    if (current > ENGAGEMENT_THRESHOLD) return;
    await AsyncStorage.setItem(ENGAGEMENT_KEY, String(current + 1));
  } catch {
    // A missed count only delays the prompt.
  }
}

/**
 * Whether the value-explanation sheet should be raised now (Push §5).
 *
 * Every condition has to hold: the OS has never been asked, the customer has
 * not already answered our own sheet, and they have done enough in the app for
 * the offer to make sense.
 */
export async function shouldShowPrimer(): Promise<boolean> {
  if ((await getPermissionState()) !== 'undetermined') return false;
  try {
    if ((await AsyncStorage.getItem(PRIMER_ANSWERED_KEY)) === '1') return false;
    const engagement = Number((await AsyncStorage.getItem(ENGAGEMENT_KEY)) ?? '0');
    return engagement >= ENGAGEMENT_THRESHOLD;
  } catch {
    return false;
  }
}

/**
 * Marks the primer answered, whichever way it went.
 *
 * "Not now" is remembered as firmly as "Enable": Push §5 says a customer who
 * declines carries on using the app and can switch notifications on later from
 * Settings, so the sheet does not come back on its own.
 */
export async function markPrimerAnswered(): Promise<void> {
  await AsyncStorage.setItem(PRIMER_ANSWERED_KEY, '1').catch(() => {});
}

/** Clears the badge once the customer has looked at the notification centre. */
export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0).catch(() => {});
}
