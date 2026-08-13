import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen } from '../../components/ui';
import { SearchBar, OfferRail, SectionHeader, CategoryCard, ShopCard } from '../../components';
import { useLocationContext } from '../../services/location/LocationContext';
import {
  useNearbyOffers,
  usePopularOffers,
  useEndingSoonOffers,
  useCategories,
  useToggleFavorite,
} from '../../hooks';
import { useOffersList } from '../../hooks/useOffers';
import { useShopsList } from '../../hooks/useShops';
import { trackEvent } from '../../services/analytics/analyticsService';
import type { MainTabScreenProps } from '../../navigation/types';
import type { Offer, Category, Shop } from '../../types';

type Props = MainTabScreenProps<'Explore'>;

export function ExploreScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();

  const nearby = useNearbyOffers(10);
  const popular = usePopularOffers(10);
  const endingSoon = useEndingSoonOffers(10);
  const categories = useCategories();
  const newOffers = useOffersList({ sort: 'newest', limit: 10 });
  const shops = useShopsList({ sort: coords ? 'nearest' : 'popular', latitude: coords?.latitude, longitude: coords?.longitude, limit: 6 });
  const toggleFavorite = useToggleFavorite();

  const openOffer = (offer: Offer) => navigation.navigate('OfferDetail', { offerId: offer.id });
  const openCategory = (category: Category) => {
    trackEvent({ event: 'CATEGORY_VIEW', categoryId: category.id });
    navigation.navigate('CategoryOffers', { categoryId: category.id, categoryName: category.name });
  };
  const openShop = (shop: Shop) => {
    trackEvent({ event: 'SHOP_VIEW', shopId: shop.id });
    navigation.navigate('ShopDetail', { shopId: shop.id });
  };
  const onToggleSave = (offer: Offer) =>
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });

  const newOffersFlat = newOffers.data?.pages.flatMap((p) => p.offers) ?? [];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm, marginBottom: spacing.md }}>
          <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Explore</Text>
          <SearchBar value="" onChangeText={() => {}} editable={false} onPress={() => navigation.navigate('Search', {})} />
        </View>

        <View style={{ marginBottom: spacing.lg }}>
          <SectionHeader title="Categories" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
            {(categories.data ?? []).map((category) => (
              <CategoryCard key={category.id} category={category} onPress={() => openCategory(category)} />
            ))}
          </ScrollView>
        </View>

        {coords ? (
          <OfferRail title="Nearby Offers" offers={nearby.data ?? []} loading={nearby.isLoading} onOfferPress={openOffer} onToggleSave={onToggleSave} />
        ) : null}

        <OfferRail title="Popular Offers" offers={popular.data ?? []} loading={popular.isLoading} onOfferPress={openOffer} onToggleSave={onToggleSave} />

        <OfferRail title="Ending Soon" offers={endingSoon.data ?? []} loading={endingSoon.isLoading} onOfferPress={openOffer} onToggleSave={onToggleSave} />

        <OfferRail title="New Offers" offers={newOffersFlat} loading={newOffers.isLoading} onOfferPress={openOffer} onToggleSave={onToggleSave} />

        <View style={{ marginBottom: spacing.xxl, gap: spacing.xs }}>
          <SectionHeader title="Shops" />
          <View style={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
            {(shops.data?.pages[0]?.shops ?? []).map((shop) => (
              <ShopCard key={shop.id} shop={shop} onPress={() => openShop(shop)} />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
