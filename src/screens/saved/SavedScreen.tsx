import React, { useState } from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Chip, EmptyState, LoadingView } from '../../components/ui';
import { OfferCard, ServiceCard, ShopCard, BrandMark } from '../../components';
import { GuestGate } from '../../components/GuestGate';
import { useAuth } from '../../store/AuthContext';
import { useFavoritesList, useToggleFavorite } from '../../hooks/useFavorites';
import { useSavedServicesList, useToggleSavedService } from '../../hooks/useSavedServices';
import { useFollowedShops } from '../../hooks/useFollowing';
import type { MainTabScreenProps } from '../../navigation/types';
import type { Offer, Service } from '../../types';

type Props = MainTabScreenProps<'Saved'>;

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function SavedScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [tab, setTab] = useState<'offers' | 'services' | 'shops'>('offers');
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // §22: the tab is reachable for a guest, but every query behind it is an
  // authenticated endpoint (§25), so none of them are allowed to fire.
  const favorites = useFavoritesList(undefined, isAuthenticated);
  const savedServices = useSavedServicesList(undefined, isAuthenticated);
  const followedShops = useFollowedShops(isAuthenticated);
  const toggleFavorite = useToggleFavorite();
  const toggleSavedService = useToggleSavedService();

  const offers = favorites.data?.pages.flatMap((p) => p.offers) ?? [];
  const services = savedServices.data?.pages.flatMap((p) => p.services) ?? [];
  const cardWidth = (Dimensions.get('window').width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

  const onToggleSave = (offer: Offer) =>
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });

  const onToggleSaveService = (service: Service) =>
    toggleSavedService.mutate({ serviceId: service.id, isSaved: service.isSaved }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedServices'] }),
    });

  if (!isAuthenticated) {
    return (
      <Screen>
        <GuestGate
          icon="heart-outline"
          title="Save your favorite offers"
          message="Log in or sign up to save offers, services and receive expiry reminders."
          browseHint="Offers, Services and Near Me stay open without an account."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <BrandMark />
          <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Saved</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Chip label="Saved Offers" selected={tab === 'offers'} onPress={() => setTab('offers')} />
          <Chip label="Saved Services" selected={tab === 'services'} onPress={() => setTab('services')} />
          <Chip label="Saved Shops" selected={tab === 'shops'} onPress={() => setTab('shops')} />
        </View>
      </View>

      {tab === 'offers' ? (
        favorites.isLoading ? (
          <LoadingView />
        ) : offers.length === 0 ? (
          <EmptyState icon="heart-outline" title="No saved offers yet" message="Tap the heart on any offer to save it here." />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(item) => String(item.id)}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: H_PADDING, gap: GAP }}
            columnWrapperStyle={{ gap: GAP }}
            onEndReached={() => favorites.hasNextPage && favorites.fetchNextPage()}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <OfferCard
                offer={item}
                width={cardWidth}
                onPress={() => navigation.navigate('OfferDetail', { offerId: item.id })}
                onToggleSave={() => onToggleSave(item)}
              />
            )}
          />
        )
      ) : tab === 'services' ? (
        savedServices.isLoading ? (
          <LoadingView />
        ) : services.length === 0 ? (
          <EmptyState icon="briefcase-outline" title="No saved services yet" message="Tap the heart on any service to save it here." />
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => String(item.id)}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={{ padding: H_PADDING, gap: GAP }}
            columnWrapperStyle={{ gap: GAP }}
            onEndReached={() => savedServices.hasNextPage && savedServices.fetchNextPage()}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <ServiceCard
                service={item}
                width={cardWidth}
                onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
                onToggleSave={() => onToggleSaveService(item)}
              />
            )}
          />
        )
      ) : followedShops.isLoading ? (
        <LoadingView />
      ) : (followedShops.data ?? []).length === 0 ? (
        <EmptyState icon="storefront-outline" title="No saved shops yet" message="Follow shops to see their new offers here." />
      ) : (
        <FlatList
          data={followedShops.data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: H_PADDING, gap: spacing.xs }}
          renderItem={({ item }) => (
            <ShopCard
              shop={{ ...item, isFollowing: true }}
              onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })}
            />
          )}
        />
      )}
    </Screen>
  );
}
