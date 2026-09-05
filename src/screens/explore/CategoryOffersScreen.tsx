import React from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, EmptyState, LoadingView } from '../../components/ui';
import { OfferCard, FeaturedRail } from '../../components';
import { useOffersList } from '../../hooks/useOffers';
import { useToggleFavorite } from '../../hooks/useFavorites';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { usePlacements } from '../../hooks/useVisibility';
import { trackListingOpen } from '../../services/analytics/visibilityService';
import type { RootStackScreenProps } from '../../navigation/types';
import type { FeaturedPlacement, Offer } from '../../types';

type Props = RootStackScreenProps<'CategoryOffers'>;

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function CategoryOffersScreen({ route, navigation }: Props) {
  const { categoryId, categoryName } = route.params;
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const queryClient = useQueryClient();
  const toggleFavorite = useToggleFavorite();
  const prompt = useAuthPrompt();

  const results = useOffersList({ categoryId, sort: 'newest', limit: 20 });

  /**
   * §11's "Featured in Clothing" - the category's own promotional space.
   *
   * The rail is requested on its own rather than through the ranked category
   * feed, because this screen's organic list is already paginated and working;
   * swapping it wholesale would be a bigger change than the promotional space
   * is worth. The placement endpoint gives the featured half without touching
   * the other.
   */
  const featured = usePlacements('CATEGORY_FEATURED', 4, categoryId);

  const openFeatured = (placement: FeaturedPlacement, position: number) => {
    trackListingOpen(placement, { surface: 'CATEGORY' }, position);
    if (placement.listingType === 'shop') {
      navigation.navigate('ShopDetail', { shopId: placement.id });
      return;
    }
    if (placement.listingType === 'offer') {
      navigation.navigate('OfferDetail', { offerId: placement.id });
    }
  };
  const offers = results.data?.pages.flatMap((p) => p.offers) ?? [];
  const cardWidth = (Dimensions.get('window').width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

  // §5: browsing and filtering stay open; only the save asks for an account.
  const onToggleSave = (offer: Offer) => {
    if (!prompt.require('save-offer', () => onToggleSave(offer))) return;
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>{categoryName}</Text>
      </View>

      <FeaturedRail
        title={`Featured in ${categoryName}`}
        placements={featured.data ?? []}
        onPress={openFeatured}
      />

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
