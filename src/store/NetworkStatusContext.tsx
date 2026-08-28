import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { setNetworkReporter } from '../api/client';

/**
 * Whether the app can currently reach the API (§36).
 *
 * Deliberately inferred from request outcomes rather than from a connectivity
 * library. Two reasons:
 *
 *   1. It answers the question that actually matters. A phone can be firmly
 *      "connected" to a hotel Wi-Fi that intercepts every request, and
 *      NetInfo would happily report online while nothing works.
 *   2. It needs no native module, so it ships in an OTA update rather than
 *      requiring every installed build to be replaced.
 *
 * The trade is that the app only learns it is offline when something tries and
 * fails, so the banner appears on the first failed request rather than the
 * instant the signal drops. For a discovery app that is the right moment
 * anyway: a customer reading a cached offer list has no need to be told.
 *
 * Recovery is one-way in the other direction: any response at all - including
 * a 404 or a 500 - proves the network works, so the state clears immediately
 * on the next successful round trip.
 */

interface NetworkStatus {
  online: boolean;
  /** True briefly after recovering, so the banner can confirm it. */
  justReconnected: boolean;
}

const NetworkStatusContext = createContext<NetworkStatus>({ online: true, justReconnected: false });

export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const report = useCallback((reachable: boolean) => {
    setOnline((current) => {
      if (current === reachable) return current;

      if (reachable) {
        setJustReconnected(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setJustReconnected(false), 4000);
      } else {
        if (timer.current) clearTimeout(timer.current);
        setJustReconnected(false);
      }
      return reachable;
    });
  }, []);

  useEffect(() => {
    setNetworkReporter(report);
    return () => {
      setNetworkReporter(null);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [report]);

  const value = useMemo(() => ({ online, justReconnected }), [online, justReconnected]);

  return <NetworkStatusContext.Provider value={value}>{children}</NetworkStatusContext.Provider>;
}

export function useNetworkStatus(): NetworkStatus {
  return useContext(NetworkStatusContext);
}
