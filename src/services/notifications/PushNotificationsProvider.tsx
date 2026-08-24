import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useQueryClient } from '@tanstack/react-query';
import * as notificationsApi from '../../api/notifications';
import { payloadOf } from '../../navigation/linking';
import { useAuth } from '../../store/AuthContext';
import {
  getPermissionState,
  markPrimerAnswered,
  recordEngagement,
  registerDevice,
  requestPermission,
  shouldShowPrimer,
  type PermissionState,
} from './pushNotifications';
import { PushPermissionSheet } from '../../components/PushPermissionSheet';

/**
 * The React half of push (Push §5, §27, §28, §37).
 *
 * Owns three things the plain service layer cannot: the device registration's
 * dependence on there being a session, the listeners that have to be torn down
 * with the tree, and the permission primer.
 *
 * Navigation is deliberately *not* here. A tapped notification is turned into a
 * URL by `navigation/linking.ts`, so shared links and notification taps travel
 * the same route table; this provider only records that the tap happened.
 */

interface PushContextValue {
  /** What the OS currently allows. Refreshed after every prompt. */
  permission: PermissionState;
  /**
   * Marks a moment where notifications visibly earn their keep, and raises the
   * primer once enough have accrued (Push §5). Call it from the actions the
   * notifications are actually about - saving an offer, saving a service.
   */
  noteEngagement: () => void;
  /**
   * Turns notifications on deliberately, from Settings or from the primer.
   * Returns whether permission ended up granted.
   */
  enable: () => Promise<boolean>;
}

const PushContext = createContext<PushContextValue | undefined>(undefined);

export function PushNotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [primerVisible, setPrimerVisible] = useState(false);

  /** Notification ids already reported as opened, so a re-render cannot double-report. */
  const reportedOpens = useRef(new Set<number>());

  const refreshFeed = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  /**
   * Reports OPENED for a tapped notification (Push §31).
   *
   * Silent on failure and on a payload without an id: the customer has already
   * been taken to the right screen by then, and analytics bookkeeping is not
   * worth an error in front of them.
   */
  const reportOpened = useCallback(
    (response: Notifications.NotificationResponse | null) => {
      const id = payloadOf(response)?.notificationId;
      if (!id || reportedOpens.current.has(id)) return;
      reportedOpens.current.add(id);
      notificationsApi
        .markNotificationOpened(id)
        .then(refreshFeed)
        .catch(() => reportedOpens.current.delete(id));
    },
    [refreshFeed],
  );

  useEffect(() => {
    void getPermissionState().then(setPermission);
  }, []);

  /**
   * Registration follows the session, not the app launch.
   *
   * A device is only worth registering once there is an account to attach it
   * to (Push §30: guests receive nothing personalised), and it has to happen
   * again on every sign-in, because the same phone can be used by more than
   * one account and the backend keys a device by its token.
   */
  useEffect(() => {
    if (!isAuthenticated || permission !== 'granted') return;
    void registerDevice();
  }, [isAuthenticated, permission]);

  /**
   * A notification that arrives while the app is open never becomes a tap, but
   * it is already in the feed - so the notification centre and its unread
   * badge have to be refreshed for it (Push §28, §29).
   */
  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(refreshFeed);
    const responded = Notifications.addNotificationResponseReceivedListener(reportOpened);
    return () => {
      received.remove();
      responded.remove();
    };
  }, [refreshFeed, reportOpened]);

  /**
   * Cold start: a notification tapped while the app was terminated produced no
   * listener event, so the response is asked for once on mount. The dedup set
   * keeps this from re-reporting the same notification on a later remount.
   */
  useEffect(() => {
    void Notifications.getLastNotificationResponseAsync().then(reportOpened);
  }, [reportOpened]);

  /**
   * Push §5: never ask on first launch. The primer is only considered after
   * the customer has done something the notifications are about, and only
   * while the OS dialog is still unspent.
   */
  const noteEngagement = useCallback(() => {
    void (async () => {
      await recordEngagement();
      if (await shouldShowPrimer()) setPrimerVisible(true);
    })();
  }, []);

  const enable = useCallback(async () => {
    const granted = await requestPermission();
    setPermission(await getPermissionState());
    // Register straight away rather than waiting for the effect above: the
    // customer just asked for this, and a round trip they can see fail is
    // better than one that silently never happens.
    if (granted && isAuthenticated) await registerDevice();
    return granted;
  }, [isAuthenticated]);

  /**
   * "Don't Allow" is remembered as firmly as "Allow" (Push §5): the customer
   * carries on using the app and can switch notifications on later from
   * Settings, so the sheet does not reappear on its own.
   */
  const dismissPrimer = useCallback(async (accepted: boolean) => {
    setPrimerVisible(false);
    await markPrimerAnswered();
    if (accepted) await enable();
  }, [enable]);

  const value = useMemo<PushContextValue>(
    () => ({ permission, noteEngagement, enable }),
    [permission, noteEngagement, enable],
  );

  return (
    <PushContext.Provider value={value}>
      {children}
      <PushPermissionSheet visible={primerVisible} onAnswer={dismissPrimer} />
    </PushContext.Provider>
  );
}

export function usePush(): PushContextValue {
  const ctx = useContext(PushContext);
  if (!ctx) throw new Error('usePush must be used within PushNotificationsProvider');
  return ctx;
}
