import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { Button, TextField } from './ui';
import { geoApi } from '../api';
import type { GeoPlace, LocationSource } from '../types';

/** What the picker hands back once the merchant confirms (V3 §8). */
export interface PickedLocation {
  latitude: number;
  longitude: number;
  source: LocationSource;
  /** Metres of GPS uncertainty, when the device reported any (§25). */
  accuracy: number | null;
  placeId: string | null;
  /** The address the pin sits on, when the geocoder could name it (§26). */
  address: GeoPlace['address'] | null;
  label: string | null;
}

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  /** Seeds the search box for a shop that has an address but no pin yet. */
  addressHint?: string;
  onConfirm: (location: PickedLocation) => void;
}

/** Roughly a street block, which is the scale a shop front is chosen at. */
const PIN_DELTA = 0.004;
/** Coimbatore, where the pilot merchants are. Only used with nothing better. */
const FALLBACK = { latitude: 11.0168, longitude: 76.9558 };

/**
 * Android refuses to construct a MapView without a Google Maps API key, and
 * fails at native attach time in a way that takes the whole screen down. The
 * same flag NearMeScreen checks lets this fall back to search plus "use my
 * current location" - which still satisfies §6's Methods 1 and 3 - rather than
 * crashing the shop form.
 */
const MAPS_AVAILABLE =
  Platform.OS !== 'android' ||
  Boolean((Constants.expoConfig?.extra as { googleMapsConfigured?: boolean } | undefined)?.googleMapsConfigured);

/**
 * Shop location picker (V3 §5-§10, §22).
 *
 * All three of §6's methods: search for an address, drag the map under the pin,
 * or use the device's own position. Whichever produced the pin, the merchant
 * confirms it before it counts - §8 is explicit that a found location is a
 * suggestion rather than an answer, and §10 that they must always be able to
 * correct it.
 *
 * The pin sits fixed at the centre of the map and the map moves under it. That
 * is the gesture every map app on a phone already teaches, and it avoids
 * asking someone to drag a marker they cannot see under their own thumb.
 */
export function MapLocationPicker({ latitude, longitude, addressHint, onConfirm }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const mapRef = useRef<MapView>(null);

  const [centre, setCentre] = useState({
    latitude: latitude ?? FALLBACK.latitude,
    longitude: longitude ?? FALLBACK.longitude,
  });
  const [source, setSource] = useState<LocationSource>('MANUAL');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  // Coordinates that already exist were confirmed when they were saved; §8's
  // confirmation is only owed again once the pin moves.
  const [confirmed, setConfirmed] = useState(latitude != null);

  const [term, setTerm] = useState('');
  const [results, setResults] = useState<GeoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const [resolved, setResolved] = useState<GeoPlace | null>(null);
  const [resolving, setResolving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  /**
   * Reverse lookups are debounced and the stale ones discarded: a drag fires a
   * region change per frame, and without this the address flickers between
   * answers to questions the merchant has already moved on from.
   */
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseToken = useRef(0);

  const resolveAddress = useCallback((next: { latitude: number; longitude: number }) => {
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    setResolving(true);
    const token = ++reverseToken.current;
    reverseTimer.current = setTimeout(() => {
      geoApi
        .reverseGeocode(next.latitude, next.longitude)
        .then((place) => {
          if (token !== reverseToken.current) return;
          setResolved(place);
          setResolving(false);
        })
        // A geocoder that cannot name the spot changes nothing: the pin the
        // merchant placed is still the location being saved.
        .catch(() => token === reverseToken.current && setResolving(false));
    }, 600);
  }, []);

  useEffect(() => {
    if (latitude != null && longitude != null) resolveAddress({ latitude, longitude });
    return () => {
      if (reverseTimer.current) clearTimeout(reverseTimer.current);
    };
    // Only on mount: after that the merchant is driving the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A shop being set up usually has an address and no pin, so the search runs
  // itself rather than making the merchant retype what they just entered.
  useEffect(() => {
    if (latitude != null || !addressHint) return;
    setTerm(addressHint);
    void runSearch(addressHint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveTo = (next: { latitude: number; longitude: number }, zoom = true) => {
    setCentre(next);
    if (zoom) {
      mapRef.current?.animateToRegion(
        { ...next, latitudeDelta: PIN_DELTA, longitudeDelta: PIN_DELTA },
        350,
      );
    }
  };

  async function runSearch(query: string) {
    const text = query.trim();
    if (text.length < 3) return;
    setSearching(true);
    setSearched(true);
    try {
      setResults(await geoApi.searchPlaces(text));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  /** §6 Method 1: a search result drops the pin, which stays adjustable (§10). */
  const choosePlace = (place: GeoPlace) => {
    moveTo({ latitude: place.latitude, longitude: place.longitude });
    setSource('ADDRESS_SEARCH');
    setAccuracy(null);
    setPlaceId(place.placeId);
    setResolved(place);
    setResults([]);
    setSearched(false);
    setConfirmed(false);
    setNotice('Pin placed from the search. Drag the map if it is not exactly right.');
  };

  /** §6 Method 3, for a merchant standing in their own shop. */
  const useCurrentLocation = async () => {
    setLocating(true);
    setNotice(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setNotice('Location permission was refused. Search for the address or drag the pin instead.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      moveTo({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      setSource('CURRENT_LOCATION');
      const metres = position.coords.accuracy ?? null;
      setAccuracy(metres);
      setPlaceId(null);
      setConfirmed(false);
      // §25: an imprecise fix is still a useful starting point, so this says
      // what it is rather than refusing it.
      setNotice(
        metres != null
          ? `Located to about ${Math.round(metres)} m. Drag the map to fine-tune the pin.`
          : 'Located. Drag the map to fine-tune the pin.',
      );
      resolveAddress(position.coords);
    } catch {
      setNotice('Your location could not be read. Search for the address or drag the pin instead.');
    } finally {
      setLocating(false);
    }
  };

  /** §6 Method 2 and §10: the map moved, so the pin is somewhere new. */
  const onRegionChangeComplete = (region: Region) => {
    const next = { latitude: region.latitude, longitude: region.longitude };
    const moved =
      Math.abs(next.latitude - centre.latitude) > 1e-6 ||
      Math.abs(next.longitude - centre.longitude) > 1e-6;
    if (!moved) return;

    setCentre(next);
    setSource('MAP_PIN');
    setAccuracy(null);
    setPlaceId(null);
    setConfirmed(false);
    resolveAddress(next);
  };

  /** §8: nothing is stored until the merchant says this is their shop. */
  const confirm = () => {
    setConfirmed(true);
    setNotice(null);
    onConfirm({
      latitude: Number(centre.latitude.toFixed(7)),
      longitude: Number(centre.longitude.toFixed(7)),
      source,
      accuracy,
      placeId,
      address: resolved?.address ?? null,
      label: resolved?.label ?? null,
    });
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ gap: spacing.xs }}>
        <TextField
          label="Search for the shop address"
          value={term}
          onChangeText={(value) => {
            setTerm(value);
            setSearched(false);
          }}
          onSubmitEditing={() => runSearch(term)}
          returnKeyType="search"
          leftIcon="search-outline"
          placeholder="e.g. RS Puram, Coimbatore"
        />

        {searching ? <ActivityIndicator color={colors.brand} /> : null}

        {results.map((place) => (
          <Pressable
            key={place.placeId ?? place.label ?? `${place.latitude},${place.longitude}`}
            onPress={() => choosePlace(place)}
            style={{
              padding: spacing.sm,
              borderRadius: radii.sm,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ color: colors.text, fontSize: fontSizes.sm }}>{place.label}</Text>
          </Pressable>
        ))}

        {searched && !searching && results.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
            Nothing found. Try a nearby landmark, or drag the map to the shop instead.
          </Text>
        ) : null}
      </View>

      {MAPS_AVAILABLE ? (
        <View
          style={{
            height: 260,
            borderRadius: radii.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{
              ...centre,
              latitudeDelta: PIN_DELTA,
              longitudeDelta: PIN_DELTA,
            }}
            onRegionChangeComplete={onRegionChangeComplete}
          />

          {/*
            The marker is an overlay pinned to the centre rather than a map
            Marker, so it never lags behind the map during a drag - the pin is
            the crosshair, and the ground moves under it.
          */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="location" size={38} color={colors.brand} style={{ marginBottom: 34 }} />
          </View>
        </View>
      ) : (
        <View
          style={{
            padding: spacing.md,
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
            gap: spacing.xs,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Map unavailable</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
            This build has no map key, so the map cannot be shown. Searching for the address or
            using your current location still sets the shop's coordinates.
          </Text>
        </View>
      )}

      <Button
        label={locating ? 'Locating…' : 'Use my current location'}
        variant="secondary"
        onPress={useCurrentLocation}
        disabled={locating}
        icon={<Ionicons name="locate-outline" size={16} color={colors.text} />}
        fullWidth
      />

      {notice ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{notice}</Text>
      ) : null}

      <View style={{ gap: spacing.xxs }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontVariant: ['tabular-nums'] }}>
          📍 {centre.latitude.toFixed(5)}, {centre.longitude.toFixed(5)}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
          {resolving
            ? 'Looking up this spot…'
            : (resolved?.label ?? 'Drag the map so the pin sits on your shop front.')}
        </Text>
      </View>

      <Button
        label={confirmed ? 'Location confirmed' : 'Confirm location'}
        onPress={confirm}
        disabled={confirmed}
        icon={
          confirmed ? <Ionicons name="checkmark-circle" size={16} color={colors.text} /> : undefined
        }
        fullWidth
      />
    </View>
  );
}
