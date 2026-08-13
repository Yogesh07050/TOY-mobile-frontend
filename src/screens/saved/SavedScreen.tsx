import React, { useState } from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Chip, EmptyState, LoadingView } from '../../components/ui';
import { OfferCard, ShopCard } from '../../components';
import { useFavoritesList, useToggleFavorite } from '../../hooks/useFavorites';
import { useFollowedShops } from '../../hooks/useFollowing';
import type { MainTabScreenProps } from '../../navigation/types';
import type { Offer } from '../../types';

type Props = MainTabScreenProps<'Saved'>;

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function SavedScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [tab, setTab] = useState<'offers' | 'shops'>('offers');
  const queryClient = useQueryClient();

  const favorites = useFavoritesList();
  const followedShops = useFollowedShops();
  const toggleFavorite = useToggleFavorite();

  const offers = favorites.data?.pages.flatMap((p) => p.offers) ?? [];
  const cardWidth = (Dimensions.get('window').width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

  const onToggleSave = (offer: Offer) =>
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });

  return (
    <Screen>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Saved</Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Chip label="Saved Offers" selected={tab === 'offers'} onPress={() => setTab('offers')} />
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
