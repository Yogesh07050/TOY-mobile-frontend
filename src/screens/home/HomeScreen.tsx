import React, { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen } from '../../components/ui';
import { SearchBar, LocationSelector, BannerCarousel, OfferRail, SectionHeader, CategoryCard } from '../../components';
import { useAuth } from '../../store/AuthContext';
import { useLocationContext } from '../../services/location/LocationContext';
import {
  useFeaturedBanners,
  useEndingSoonOffers,
  useNearbyOffers,
  useRecommendedOffers,
  usePopularOffers,
  useCategories,
  useToggleFavorite,
} from '../../hooks';
import { trackBanner, trackEvent } from '../../services/analytics/analyticsService';
import type { MainTabScreenProps } from '../../navigation/types';
import type { Offer, Banner, Category } from '../../types';

type Props = MainTabScreenProps<'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { user } = useAuth();
  const { permissionStatus, requestPermission } = useLocationContext();
  const queryClient = useQueryClient();

  const banners = useFeaturedBanners();
  const endingSoon = useEndingSoonOffers();
  const nearby = useNearbyOffers();
  const recommended = useRecommendedOffers();
  const popular = usePopularOffers();
  const categories = useCategories();
  const toggleFavorite = useToggleFavorite();

  const refreshing =
    banners.isRefetching || endingSoon.isRefetching || nearby.isRefetching || recommended.isRefetching || popular.isRefetching;

  const onRefresh = useCallback(() => {
    banners.refetch();
    endingSoon.refetch();
    nearby.refetch();
    recommended.refetch();
    popular.refetch();
    categories.refetch();
  }, [banners, endingSoon, nearby, recommended, popular, categories]);

  const openOffer = (offer: Offer) => navigation.navigate('OfferDetail', { offerId: offer.id });
  const openBanner = (banner: Banner) => {
    trackBanner(banner.id, 'click');
    navigation.navigate('OfferDetail', { offerId: banner.offerId });
  };
  const openCategory = (category: Category) => {
    trackEvent({ event: 'CATEGORY_VIEW', categoryId: category.id });
    navigation.navigate('CategoryOffers', { categoryId: category.id, categoryName: category.name });
  };
  const onToggleSave = (offer: Offer) =>
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>Hi {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
              <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
                Discover great offers
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              hitSlop={8}
              style={{ padding: spacing.xxs }}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </Pressable>
          </View>

          <SearchBar value="" onChangeText={() => {}} editable={false} onPress={() => navigation.navigate('Search', {})} />

          <LocationSelector
            onPress={() => (permissionStatus === 'granted' ? navigation.navigate('SelectLocation') : requestPermission())}
          />
          {permissionStatus === 'denied' ? (
            <View
              style={{
                backgroundColor: colors.warningBg,
                borderRadius: 12,
                padding: spacing.sm,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Ionicons name="location-outline" size={18} color={colors.warning} />
              <Text style={{ flex: 1, color: colors.warning, fontSize: fontSizes.sm }}>
                Turn on location to discover offers near you.
              </Text>
              <Pressable onPress={requestPermission}>
                <Text style={{ color: colors.warning, fontWeight: fontWeights.bold, fontSize: fontSizes.sm }}>Enable</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={{ height: spacing.md }} />

        {banners.data && banners.data.length > 0 ? (
          <View style={{ marginBottom: spacing.lg }}>
            <BannerCarousel banners={banners.data} onPress={openBanner} onImpression={(b) => trackBanner(b.id, 'impression')} />
          </View>
        ) : null}

        <OfferRail
          title="Ending Soon"
          subtitle="Grab these before they're gone"
          offers={endingSoon.data ?? []}
          loading={endingSoon.isLoading}
          onOfferPress={openOffer}
          onToggleSave={onToggleSave}
          onSeeAll={() => navigation.navigate('Search', { query: undefined })}
        />

        {permissionStatus === 'granted' ? (
          <OfferRail
            title="Near You"
            subtitle="Offers close to your location"
            offers={nearby.data ?? []}
            loading={nearby.isLoading}
            onOfferPress={openOffer}
            onToggleSave={onToggleSave}
            emptyMessage="No nearby offers right now."
          />
        ) : null}

        <OfferRail
          title="Recommended For You"
          subtitle={recommended.data?.[0]?.reason}
          offers={recommended.data ?? []}
          loading={recommended.isLoading}
          onOfferPress={openOffer}
          onToggleSave={onToggleSave}
        />

        <OfferRail
          title="Popular Offers"
          offers={popular.data ?? []}
          loading={popular.isLoading}
          onOfferPress={openOffer}
          onToggleSave={onToggleSave}
        />

        <View style={{ marginBottom: spacing.lg }}>
          <SectionHeader title="Categories" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.md }}>
            {(categories.data ?? []).map((category) => (
              <CategoryCard key={category.id} category={category} onPress={() => openCategory(category)} />
            ))}
          </ScrollView>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Explore')}
          style={{
            marginHorizontal: spacing.md,
            marginBottom: spacing.xxl,
            padding: spacing.md,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.brand, fontWeight: fontWeights.semibold }}>Explore More Offers →</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
