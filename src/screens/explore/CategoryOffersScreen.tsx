import React from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, EmptyState, LoadingView } from '../../components/ui';
import { OfferCard } from '../../components';
import { useOffersList } from '../../hooks/useOffers';
import { useToggleFavorite } from '../../hooks/useFavorites';
import type { RootStackScreenProps } from '../../navigation/types';
import type { Offer } from '../../types';

type Props = RootStackScreenProps<'CategoryOffers'>;

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function CategoryOffersScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const queryClient = useQueryClient();
  const toggleFavorite = useToggleFavorite();

  const results = useOffersList({ categoryId, sort: 'newest', limit: 20 });
  const offers = results.data?.pages.flatMap((p) => p.offers) ?? [];
  const cardWidth = (Dimensions.get('window').width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

  const onToggleSave = (offer: Offer) =>
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>{categoryName}</Text>
      </View>

      {results.isLoading ? (
        <LoadingView />
      ) : offers.length === 0 ? (
        <EmptyState icon="pricetag-outline" title="No offers yet" message={`No active offers in ${categoryName} right now.`} />
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ padding: H_PADDING, gap: GAP }}
          columnWrapperStyle={{ gap: GAP }}
          onEndReached={() => results.hasNextPage && results.fetchNextPage()}
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
      )}
    </Screen>
  );
}
