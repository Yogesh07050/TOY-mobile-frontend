import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, Chip, EmptyState, LoadingView } from '../../components/ui';
import { NotificationBell } from '../../components';
import { useNearbyListings } from '../../hooks/useDiscovery';
import { useLocationContext } from '../../services/location/LocationContext';
import type { MainTabScreenProps } from '../../navigation/types';
import type { UnifiedListing } from '../../types';

type Props = MainTabScreenProps<'NearMe'>;

type TypeFilter = 'all' | 'product' | 'service';

const TYPE_CHIPS: Array<{ label: string; value: TypeFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Offers', value: 'product' },
  { label: 'Services', value: 'service' },
];

function headlineFor(listing: UnifiedListing): string {
  if (listing.offerText) return listing.offerText;
  if (listing.discountType === 'percentage' && listing.discountValue != null) return `${listing.discountValue}% OFF`;
  if (listing.discountType === 'flat' && listing.discountValue != null) return `₹${listing.discountValue} OFF`;
  return 'Special Offer';
}

export function NearMeScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { permissionStatus, coords, requestPermission } = useLocationContext();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState<UnifiedListing | null>(null);

  const nearby = useNearbyListings({ type: typeFilter, limit: 50 });
  const listings = nearby.data ?? [];
  const pins = listings.filter((l) => l.latitude != null && l.longitude != null);

  const openDetails = (listing: UnifiedListing) => {
    if (listing.sourceType === 'product') {
      navigation.navigate('OfferDetail', { offerId: listing.id });
    } else if (listing.serviceId != null) {
      navigation.navigate('ServiceDetail', { serviceId: listing.serviceId });
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.xs }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Near Me</Text>
        <NotificationBell />
      </View>

      {permissionStatus !== 'granted' ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md }}>
          <Ionicons name="location-outline" size={40} color={colors.textMuted} />
          <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, textAlign: 'center' }}>
            Turn on location
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
            Enable location access to see offers and services near you on the map.
          </Text>
          <Button label="Enable Location" onPress={requestPermission} />
        </View>
      ) : !coords ? (
        <LoadingView />
      ) : (
        <>
          <View style={{ flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.md, marginBottom: spacing.xs }}>
            {TYPE_CHIPS.map((chip) => (
              <Chip key={chip.value} label={chip.label} selected={typeFilter === chip.value} onPress={() => setTypeFilter(chip.value)} />
            ))}
          </View>

          <View style={{ flex: 1 }}>
            {nearby.isLoading ? (
              <LoadingView />
            ) : pins.length === 0 ? (
              <EmptyState icon="map-outline" title="Nothing nearby" message="No offers or services found close to you." />
            ) : (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                }}
              >
                {pins.map((listing) => (
                  <Marker
                    key={`${listing.sourceType}-${listing.id}`}
                    coordinate={{ latitude: listing.latitude as number, longitude: listing.longitude as number }}
                    pinColor={listing.sourceType === 'product' ? colors.brand : colors.accent}
                    onPress={() => setSelected(listing)}
                  />
                ))}
              </MapView>
            )}

            {selected ? (
              <View
                style={{
                  position: 'absolute',
                  left: spacing.md,
                  right: spacing.md,
                  bottom: spacing.md,
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing.sm,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>
                      {selected.shop.name.toUpperCase()} · {selected.sourceType === 'product' ? 'Offer' : 'Service'}
                    </Text>
                    <Text numberOfLines={1} style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>
                      {selected.title}
                    </Text>
                    <Text style={{ color: colors.accent, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
                      {headlineFor(selected)}
                    </Text>
                  </View>
                  <Pressable onPress={() => setSelected(null)} hitSlop={8}>
                    <Ionicons name="close" size={20} color={colors.textMuted} />
                  </Pressable>
                </View>
                <Button label="View Details" onPress={() => openDetails(selected)} fullWidth style={{ marginTop: spacing.xs }} />
              </View>
            ) : null}
          </View>
        </>
      )}
    </Screen>
  );
}
