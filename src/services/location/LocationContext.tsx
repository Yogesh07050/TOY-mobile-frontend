import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface ManualLocation extends Coords {
  label: string;
}

const MANUAL_LOCATION_KEY = 'manualLocation';

/**
 * How long to wait for a fix before giving up. A granted permission is not a
 * promise of coordinates - indoors, with location services off at the OS level,
 * or on a simulator with no position set, `getCurrentPositionAsync` can hang
 * well past the point the label stops being honest.
 */
const LOCATION_TIMEOUT_MS = 15000;

interface LocationContextValue {
  permissionStatus: LocationPermissionStatus;
  deviceCoords: Coords | null;
  manualLocation: ManualLocation | null;
  coords: Coords | null;
  locationLabel: string | null;
  /** True only while a lookup is genuinely in flight. */
  locating: boolean;
  /**
   * Why the last lookup produced nothing, or null if it succeeded or has not
   * run. Without this a caller cannot tell "still trying" from "gave up", and
   * the only honest thing left to render is a spinner that never stops.
   */
  locationError: string | null;
  requestPermission: () => Promise<boolean>;
  /** Resolves to whether coordinates were actually obtained. */
  refreshLocation: () => Promise<boolean>;
  setManualLocation: (location: ManualLocation | null) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [deviceCoords, setDeviceCoords] = useState<Coords | null>(null);
  const [manualLocation, setManualLocationState] = useState<ManualLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(MANUAL_LOCATION_KEY).then((stored) => {
      if (stored) {
        try {
          setManualLocationState(JSON.parse(stored));
        } catch {
          // ignore corrupt cache
        }
      }
    });
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setPermissionStatus(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
      if (status === 'granted') void refreshLocation();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    // Hoisted so the catch can tell "the fresh lookup failed but we already
    // have a usable cached fix" from "we have nothing".
    let usedCachedFix = false;
    try {
      // Location services being switched off at the OS level is the most common
      // reason a granted permission still yields nothing, and it is worth
      // naming: no amount of waiting will fix it.
      if (!(await Location.hasServicesEnabledAsync())) {
        setLocationError('Location services are turned off on this device.');
        return false;
      }

      // A cached fix, when there is one, is effectively instant. Asking for it
      // first is what stops a cold GPS lock - which can genuinely take the full
      // timeout indoors - from reading as a hang.
      const lastKnown = await Location.getLastKnownPositionAsync().catch(() => null);
      if (lastKnown) {
        setDeviceCoords({ latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude });
        usedCachedFix = true;
      }

      // Raced against a timeout: without one a lookup that never settles leaves
      // the picker reading "Detecting location…" forever, with no way for the
      // customer to tell it is stuck or to reach the manual city list.
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('location-timeout')), LOCATION_TIMEOUT_MS),
        ),
      ]);
      setDeviceCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      return true;
    } catch (error) {
      // A cached fix is still a usable answer even when the fresh lookup times
      // out, so only report failure when we have nothing at all.
      if (usedCachedFix) return true;
      setLocationError(
        (error as Error)?.message === 'location-timeout'
          ? 'Could not get a location fix. Try again, or search for your area.'
          : 'Location is unavailable right now. Search for your area instead.',
      );
      return false;
    } finally {
      setLocating(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === 'granted';
    setPermissionStatus(granted ? 'granted' : 'denied');
    if (granted) await refreshLocation();
    return granted;
  }, [refreshLocation]);

  const setManualLocation = useCallback((location: ManualLocation | null) => {
    // Choosing a city resolves the problem the message was describing.
    if (location) setLocationError(null);
    setManualLocationState(location);
    if (location) {
      AsyncStorage.setItem(MANUAL_LOCATION_KEY, JSON.stringify(location)).catch(() => {});
    } else {
      AsyncStorage.removeItem(MANUAL_LOCATION_KEY).catch(() => {});
    }
  }, []);

  /**
   * A manually chosen city wins over the device fix, because choosing one is a
   * deliberate act and clearing it is what "Use Current Location" does.
   *
   * This used to prefer `deviceCoords` while `locationLabel` preferred the
   * manual one, so picking Coimbatore relabelled the chip but kept querying
   * wherever the phone actually was - the results silently disagreed with the
   * label above them. Both now read from the same precedence.
   */
  const coords = manualLocation
    ? { latitude: manualLocation.latitude, longitude: manualLocation.longitude }
    : deviceCoords;
  const locationLabel = manualLocation?.label ?? (deviceCoords ? 'Current location' : null);

  const value = useMemo<LocationContextValue>(
    () => ({
      permissionStatus,
      deviceCoords,
      manualLocation,
      coords,
      locationLabel,
      locating,
      locationError,
      requestPermission,
      refreshLocation,
      setManualLocation,
    }),
    [permissionStatus, deviceCoords, manualLocation, coords, locationLabel, locating, locationError, requestPermission, refreshLocation, setManualLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}
