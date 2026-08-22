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
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
  setManualLocation: (location: ManualLocation | null) => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [deviceCoords, setDeviceCoords] = useState<Coords | null>(null);
  const [manualLocation, setManualLocationState] = useState<ManualLocation | null>(null);
  const [locating, setLocating] = useState(false);

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
    try {
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
    } catch {
      // Location unavailable — the app falls back to manual location / no personalization.
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
    setManualLocationState(location);
    if (location) {
      AsyncStorage.setItem(MANUAL_LOCATION_KEY, JSON.stringify(location)).catch(() => {});
    } else {
      AsyncStorage.removeItem(MANUAL_LOCATION_KEY).catch(() => {});
    }
  }, []);

  const coords = deviceCoords ?? (manualLocation ? { latitude: manualLocation.latitude, longitude: manualLocation.longitude } : null);
  const locationLabel = manualLocation?.label ?? (deviceCoords ? 'Current location' : null);

  const value = useMemo<LocationContextValue>(
    () => ({
      permissionStatus,
      deviceCoords,
      manualLocation,
      coords,
      locationLabel,
      locating,
      requestPermission,
      refreshLocation,
      setManualLocation,
    }),
    [permissionStatus, deviceCoords, manualLocation, coords, locationLabel, locating, requestPermission, refreshLocation, setManualLocation],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}
