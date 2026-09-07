import React, { useMemo, useState } from 'react';
import { Dimensions, FlatList, ScrollView, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Chip, EmptyState, ErrorState, LoadingView } from '../../components/ui';
import { getApiErrorMessage, isNetworkError } from '../../api/client';
import { SearchBar, ServiceCard, NotificationBell, BrandMark } from '../../components';
import { useServicesList } from '../../hooks/useServices';
import { useToggleSavedService } from '../../hooks/useSavedServices';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { useCategories } from '../../hooks/useCategories';
import { useLocationContext } from '../../services/location/LocationContext';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { MainTabScreenProps } from '../../navigation/types';
import type { ServiceSort } from '../../types';
import type { Service } from '../../types';

type Props = MainTabScreenProps<'Services'>;

const SORT_OPTIONS: Array<{ label: string; value: ServiceSort }> = [
  { label: 'Newest', value: 'newest' },
  { label: 'Nearest', value: 'nearest' },
  { label: 'Most Viewed', value: 'mostViewed' },
  { label: 'Most Popular', value: 'mostPopular' },
];

const BOOKING_TYPE_OPTIONS: Array<{ label: string; value: string | undefined }> = [
  { label: 'Any', value: undefined },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Appointment', value: 'appointment' },
  { label: 'Enquiry Only', value: 'enquiry_only' },
];

const NUM_COLUMNS = 2;
const H_PADDING = 16;
const GAP = 12;

export function ServicesScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();
  const prompt = useAuthPrompt();
  const categories = useCategories();
  const toggleSavedService = useToggleSavedService();

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [bookingType, setBookingType] = useState<string | undefined>(undefined);
  const [homeService, setHomeService] = useState(false);
  const [hasOffer, setHasOffer] = useState(false);
  const [sort, setSort] = useState<ServiceSort>('newest');

  const debouncedQuery = useDebouncedValue(query, 400);

  const params = useMemo(
    () => ({
      search: debouncedQuery || undefined,
      categoryId,
      bookingType,
      homeService: homeService || undefined,
      hasOffer: hasOffer || undefined,
      sort,
      latitude: sort === 'nearest' ? coords?.latitude : undefined,
      longitude: sort === 'nearest' ? coords?.longitude : undefined,
      limit: 20,
    }),
    [debouncedQuery, categoryId, bookingType, homeService, hasOffer, sort, coords],
  );

  const results = useServicesList(params);
  const services = results.data?.pages.flatMap((p) => p.services) ?? [];
  const cardWidth = (Dimensions.get('window').width - H_PADDING * 2 - GAP) / NUM_COLUMNS;

  const onToggleSave = (service: Service) => {
    if (!prompt.require('save-service', () => onToggleSave(service))) return;
    toggleSavedService.mutate({ serviceId: service.id, isSaved: service.isSaved }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['savedServices'] }),
    });
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <BrandMark />
            <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Services</Text>
          </View>
          <NotificationBell />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <View style={{ flex: 1 }}>
            <SearchBar value={query} onChangeText={setQuery} placeholder="Search services" />
          </View>
          <Chip label={showFilters ? 'Hide filters' : 'Filters'} selected={showFilters} onPress={() => setShowFilters((s) => !s)} />
        </View>

        {showFilters ? (
          <View style={{ gap: spacing.xs }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              {SORT_OPTIONS.map((opt) => (
                <Chip key={opt.label} label={opt.label} selected={sort === opt.value} onPress={() => setSort(opt.value)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              {BOOKING_TYPE_OPTIONS.map((opt) => (
                <Chip key={opt.label} label={opt.label} selected={bookingType === opt.value} onPress={() => setBookingType(opt.value)} />
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xxs }}>
              <Chip label="Home Service" selected={homeService} onPress={() => setHomeService((v) => !v)} />
              <Chip label="Has Offer" selected={hasOffer} onPress={() => setHasOffer((v) => !v)} />
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
      ) : results.isError ? (
        /* §52, §53: a failed request is not an empty result. Saying "no
           services found" when the request never landed sends the customer off
           to change filters that were never the problem. */
        <ErrorState
          offline={isNetworkError(results.error)}
          message={getApiErrorMessage(results.error, 'We’re having trouble loading services. Please try again.')}
          onRetry={() => results.refetch()}
        />
      ) : services.length === 0 ? (
        <EmptyState icon="briefcase-outline" title="No services found" message="Try adjusting your search or filters." />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ padding: H_PADDING, gap: GAP }}
          columnWrapperStyle={{ gap: GAP }}
          onEndReached={() => results.hasNextPage && results.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              width={cardWidth}
              onPress={() => navigation.navigate('ServiceDetail', { serviceId: item.id })}
              onToggleSave={() => onToggleSave(item)}
            />
          )}
          ListFooterComponent={results.isFetchingNextPage ? <LoadingView fullScreen={false} /> : null}
        />
      )}
    </Screen>
  );
}
