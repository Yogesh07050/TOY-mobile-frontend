import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Chip, EmptyState, LoadingView } from '../../components/ui';
import { SearchBar, OfferCard } from '../../components';
import { useOffersList } from '../../hooks/useOffers';
import { useCategories } from '../../hooks/useCategories';
import { useToggleFavorite } from '../../hooks/useFavorites';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { useLocationContext } from '../../services/location/LocationContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { trackEvent } from '../../services/analytics/analyticsService';
import type { RootStackScreenProps } from '../../navigation/types';
import type { OfferSort } from '../../api/offers';
import type { Offer } from '../../types';

type Props = RootStackScreenProps<'Search'>;

const DISTANCE_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: 'Any distance', value: undefined },
  { label: 'Within 1 km', value: 1 },
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
];

const DISCOUNT_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: 'Any', value: undefined },
  { label: '10%+', value: 10 },
  { label: '20%+', value: 20 },
  { label: '30%+', value: 30 },
  { label: '50%+', value: 50 },
];

const SORT_OPTIONS: Array<{ label: string; value: OfferSort }> = [
  { label: 'Recommended', value: 'newest' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Ending Soon', value: 'endingSoon' },
  { label: 'Most Popular', value: 'mostPopular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Discount', value: 'highestDiscount' },
];

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function SearchScreen({ route, navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();
  const categories = useCategories();
  const toggleFavorite = useToggleFavorite();
  const prompt = useAuthPrompt();

  const [query, setQuery] = useState(route.params?.query ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [minDiscount, setMinDiscount] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<OfferSort>('newest');

  const debouncedQuery = useDebouncedValue(query, 400);

  const params = useMemo(
    () => ({
      search: debouncedQuery || undefined,
      radius: distance,
      latitude: distance ? coords?.latitude : sort === 'nearest' ? coords?.latitude : undefined,
      longitude: distance ? coords?.longitude : sort === 'nearest' ? coords?.longitude : undefined,
      minDiscount,
      categoryId,
      sort,
      limit: 20,
    }),
    [debouncedQuery, distance, minDiscount, categoryId, sort, coords],
  );

  const results = useOffersList(params);

  React.useEffect(() => {
    if (debouncedQuery.trim()) {
      trackEvent({ event: 'SEARCH', term: debouncedQuery.trim() });
    }
  }, [debouncedQuery]);

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
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChangeText={setQuery} autoFocus placeholder="Search offers, shops, categories" />
          </View>
          <Pressable onPress={() => setShowFilters((s) => !s)} hitSlop={8}>
            <Ionicons name={showFilters ? 'options' : 'options-outline'} size={22} color={colors.brand} />
          </Pressable>
        </View>

        {showFilters ? (
          <View style={{ gap: spacing.xs }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              {SORT_OPTIONS.map((opt) => (
                <Chip key={opt.label} label={opt.label} selected={sort === opt.value} onPress={() => setSort(opt.value)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              {DISTANCE_OPTIONS.map((opt) => (
                <Chip key={opt.label} label={opt.label} selected={distance === opt.value} onPress={() => setDistance(opt.value)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              {DISCOUNT_OPTIONS.map((opt) => (
                <Chip key={opt.label} label={opt.label} selected={minDiscount === opt.value} onPress={() => setMinDiscount(opt.value)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              <Chip label="All Categories" selected={categoryId === undefined} onPress={() => setCategoryId(undefined)} />
              {(categories.data ?? []).map((c) => (
                <Chip key={c.id} label={c.name} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {results.isLoading ? (
        <LoadingView />
      ) : offers.length === 0 ? (
        <EmptyState icon="search-outline" title="No offers found" message="Try adjusting your search or filters." />
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
          ListFooterComponent={results.isFetchingNextPage ? <LoadingView fullScreen={false} /> : null}
        />
      )}

      <View style={{ height: spacing.xs }} />
    </Screen>
  );
}
