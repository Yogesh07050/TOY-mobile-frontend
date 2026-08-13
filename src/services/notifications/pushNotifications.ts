import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

/**
 * Requests OS push permission and returns the Expo push token.
 *
 * KNOWN BACKEND GAP: the backend has no endpoint to store a customer's device
 * push token (see src/modules/notifications) — it only supports an in-app
 * notification feed plus email preference flags. Until a
 * `POST /users/me/push-token`-style endpoint exists, this token has nowhere
 * to be registered server-side, so push delivery (spec §19/§20) cannot work
 * end-to-end yet. This function is wired up so registration is a one-line
 * addition once that backend endpoint ships.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const { data } = await Notifications.getExpoPushTokenAsync();
  return data;
}
