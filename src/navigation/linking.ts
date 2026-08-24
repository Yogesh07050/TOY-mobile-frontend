import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Routes an incoming deep link to the screen it names.
 *
 * `Share` on an offer and on a shop already hand out `offersapp://offer/:id`
 * and `offersapp://shop/:id` (see `utils/links.ts`), and `app.json` registers
 * the scheme - but without this config React Navigation had nothing to match
 * those URLs against, so tapping a shared link only opened the app at whatever
 * screen it was last on.
 *
 * Push notifications now arrive through the same door (Push §26, §27). The
 * backend stamps every notification with a `deepLink` and repeats it in the
 * push payload's `data`; `getInitialURL` and `subscribe` below turn a tapped
 * notification into that URL, so one route table serves shared links and
 * notification taps alike rather than a second navigation switch that would
 * drift out of step with this one.
 *
 * `Linking.createURL('/')` covers the `exp://` host the app is reached on in
 * development, where the custom scheme is not registered.
 */

/**
 * The destination carried by a tapped notification.
 *
 * `deepLink` is what the backend decided when it created the notification, and
 * is preferred. `entityType`/`entityId` are the fallback for notifications
 * created before push shipped, which have no stored link.
 */
interface PushPayload {
  deepLink?: string;
  entityType?: string | null;
  entityId?: number | null;
  notificationId?: number;
}

/**
 * Same entity -> path table the backend uses, for payloads with no deepLink.
 *
 * Only entities that have a screen appear here. Claims and bookings do not:
 * there is no route that opens one by id, so the fallback for those is the
 * notification centre, where the message itself is waiting.
 */
const FALLBACK_PATHS: Record<string, string> = {
  offer: 'offer',
  service_offer: 'service',
  service: 'service',
  shop: 'shop',
};

export function payloadOf(response: Notifications.NotificationResponse | null): PushPayload | null {
  const data = response?.notification.request.content.data as PushPayload | undefined;
  return data ?? null;
}

/** Turns a tapped notification into the URL React Navigation should follow. */
export function urlFromNotification(response: Notifications.NotificationResponse | null): string | null {
  const payload = payloadOf(response);
  if (!payload) return null;
  if (payload.deepLink) return payload.deepLink;

  const path = payload.entityType ? FALLBACK_PATHS[payload.entityType] : undefined;
  // A notification with no destination still opens the app; it just lands on
  // the notification centre, where the message itself is waiting.
  return `offersapp://${path && payload.entityId ? `${path}/${payload.entityId}` : 'notifications'}`;
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'offersapp://'],
  config: {
    screens: {
      // The id arrives as a string; OfferDetail's param is typed as a number
      // and is handed straight to the offer query.
      OfferDetail: { path: 'offer/:offerId', parse: { offerId: Number } },
      ServiceDetail: { path: 'service/:serviceId', parse: { serviceId: Number } },
      // ShopDetail accepts an id or a slug, so the raw string is what it wants.
      ShopDetail: { path: 'shop/:shopId' },
      // The destination for anything without a screen of its own - a claim, a
      // booking, a platform announcement. The backend sends this link
      // explicitly rather than leaving such a notification unroutable.
      Notifications: { path: 'notifications' },
    },
  },

  /**
   * Cold start. A notification tapped while the app was terminated is not a
   * `url` event - the OS launches the app and hands the response over
   * separately, so it has to be asked for explicitly. A real link wins if both
   * are somehow present, since that is the more specific intent.
   */
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    return urlFromNotification(await Notifications.getLastNotificationResponseAsync());
  },

  /** Warm start: links and notification taps while the app is already alive. */
  subscribe(listener) {
    const linkSubscription = Linking.addEventListener('url', ({ url }) => listener(url));
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = urlFromNotification(response);
        if (url) listener(url);
      },
    );

    return () => {
      linkSubscription.remove();
      notificationSubscription.remove();
    };
  },
};
