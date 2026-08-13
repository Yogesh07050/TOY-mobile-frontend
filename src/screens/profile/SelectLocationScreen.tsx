import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, TextField } from '../../components/ui';
import { useLocationContext } from '../../services/location/LocationContext';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'SelectLocation'>;

export function SelectLocationScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { permissionStatus, requestPermission, refreshLocation, setManualLocation, deviceCoords } = useLocationContext();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUseCurrentLocation = async () => {
    setError(null);
    const granted = permissionStatus === 'granted' || (await requestPermission());
    if (!granted) {
      setError('Location permission was denied. Enable it in system settings, or search for your area below.');
      return;
    }
    await refreshLocation();
    setManualLocation(null);
    navigation.goBack();
  };

  const onSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const results = await Location.geocodeAsync(query.trim());
      if (results.length === 0) {
        setError('Could not find that place. Try a different city, area, or pincode.');
        return;
      }
      const { latitude, longitude } = results[0];
      setManualLocation({ label: query.trim(), latitude, longitude });
      navigation.goBack();
    } catch {
      setError('Could not search for that location right now.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Select Location</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
        <Button
          label={deviceCoords ? 'Refresh Current Location' : 'Use Current Location'}
          icon={<Ionicons name="locate-outline" size={16} color={colors.textOnBrand} />}
          onPress={onUseCurrentLocation}
          fullWidth
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <TextField
          label="City, Area, or Pincode"
          placeholder="e.g. Koramangala, Bengaluru"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearch}
          leftIcon="search-outline"
        />
        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}
        <Button label="Search" variant="secondary" onPress={onSearch} loading={searching} fullWidth />
      </View>
    </Screen>
  );
}
