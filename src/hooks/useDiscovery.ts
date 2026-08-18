import { useQuery } from '@tanstack/react-query';
import * as discoveryApi from '../api/discovery';
import * as offersApi from '../api/offers';
import { queryKeys } from '../api/queryKeys';
import { useLocationContext } from '../services/location/LocationContext';

export function useFeaturedBanners(limit = 8) {
  return useQuery({
    queryKey: queryKeys.featuredBanners(),
    queryFn: () => discoveryApi.getFeaturedBanners(limit),
  });
}

export function useEndingSoonOffers(limit = 8) {
  const { coords } = useLocationContext();
  const params = { latitude: coords?.latitude, longitude: coords?.longitude, limit };
  return useQuery({
    queryKey: queryKeys.endingSoon(params),
    queryFn: () => discoveryApi.getEndingSoonOffers(params),
  });
}

export function useNearbyOffers(limit = 8) {
  const { coords } = useLocationContext();
  const params = coords ? { latitude: coords.latitude, longitude: coords.longitude, limit } : null;
  return useQuery({
    queryKey: queryKeys.nearby(params),
    queryFn: () => discoveryApi.getNearbyOffers(params!),
    enabled: !!params,
  });
}

export function useRecommendedOffers(limit = 8) {
  const { coords } = useLocationContext();
  const params = { latitude: coords?.latitude, longitude: coords?.longitude, limit };
  return useQuery({
    queryKey: queryKeys.recommended(params),
    queryFn: () => discoveryApi.getRecommendedOffers(params),
  });
}

export function usePopularOffers(limit = 8) {
  const params = { sort: 'mostPopular' as const, limit };
  return useQuery({
    queryKey: queryKeys.offers(params),
    queryFn: async () => (await offersApi.listOffers(params)).offers,
  });
}

export function useUnifiedOffers(params: Omit<discoveryApi.ListUnifiedOffersParams, 'latitude' | 'longitude'> = {}, limit = 10) {
  const { coords } = useLocationContext();
  const query = { ...params, latitude: coords?.latitude, longitude: coords?.longitude, limit };
  return useQuery({
    queryKey: queryKeys.unifiedOffers(query),
    queryFn: async () => (await discoveryApi.listUnifiedOffers(query)).listings,
  });
}

export function useNearbyListings(params: { type?: 'all' | 'product' | 'service'; limit?: number } = {}) {
  const { coords } = useLocationContext();
  const query = coords
    ? { ...params, latitude: coords.latitude, longitude: coords.longitude, sort: 'nearest' as const }
    : null;
  return useQuery({
    queryKey: queryKeys.nearbyListings(query),
    queryFn: async () => (await discoveryApi.listUnifiedOffers(query!)).listings,
    enabled: !!query,
  });
}
