import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as visibilityApi from '../api/visibility';
import { queryKeys } from '../api/queryKeys';
import { useLocationContext } from '../services/location/LocationContext';
import { trackImpressions, type ImpressionContext } from '../services/analytics/visibilityService';
import type {
  FeaturedPlacement,
  PlacementType,
  RankedListing,
  VisibilitySurface,
} from '../types';

/**
 * Ranked discovery (§4, §13, §14) and its impression reporting (§32).
 *
 * Every hook here passes the customer's coordinates when they exist. That is
 * not decoration: distance is the second-heaviest factor on most surfaces and
 * the heaviest on Near Me, so a request without a position is answered with a
 * materially different ranking - one where every listing scores the same
 * neutral distance and the nearest shop has no advantage at all.
 */

const DEFAULT_LIMIT = 12;

export function useRankedFeed(limit = DEFAULT_LIMIT, featuredLimit = 5) {
  const { coords } = useLocationContext();
  const params = {
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    limit,
    featuredLimit,
  };
  return useQuery({
    queryKey: queryKeys.rankedFeed(params),
    queryFn: async () => (await visibilityApi.getRankedFeed(params)).feed,
  });
}

export function useRankedNearMe(limit = DEFAULT_LIMIT, radiusKm?: number) {
  const { coords } = useLocationContext();
  const params = coords
    ? { latitude: coords.latitude, longitude: coords.longitude, limit, radiusKm }
    : null;

  return useQuery({
    queryKey: queryKeys.rankedNearMe(params),
    queryFn: async () => (await visibilityApi.getRankedNearMe(params!)).feed,
    // §24: Near Me must not rank a listing with no valid location, and the API
    // requires a position for the same reason. Asking without one would be a
    // guaranteed 422.
    enabled: !!params,
  });
}

export function useRankedSearch(query: string, limit = 20, enabled = true) {
  const { coords } = useLocationContext();
  const params = {
    q: query,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    limit,
  };
  return useQuery({
    queryKey: queryKeys.rankedSearch(params),
    queryFn: async () => await visibilityApi.searchRanked(params),
    enabled: enabled && query.trim().length > 0,
  });
}

export function useRankedCategory(categoryId: number | undefined, limit = DEFAULT_LIMIT) {
  const { coords } = useLocationContext();
  const params = { latitude: coords?.latitude, longitude: coords?.longitude, limit };
  return useQuery({
    queryKey: queryKeys.rankedCategory({ categoryId, ...params }),
    queryFn: async () => (await visibilityApi.getRankedCategory(categoryId!, params)).feed,
    enabled: categoryId != null,
  });
}

export function useRankedEndingSoon(limit = DEFAULT_LIMIT, withinHours?: number) {
  const { coords } = useLocationContext();
  const params = {
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    limit,
    withinHours,
  };
  return useQuery({
    queryKey: queryKeys.rankedEndingSoon(params),
    queryFn: async () => (await visibilityApi.getRankedEndingSoon(params)).feed,
  });
}

export function usePlacements(placementType: PlacementType, limit = 5, categoryId?: number) {
  const { coords } = useLocationContext();
  const params = {
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    categoryId,
    limit,
  };
  return useQuery({
    queryKey: queryKeys.placements({ placementType, ...params }),
    queryFn: () => visibilityApi.getPlacements(placementType, params),
  });
}

/** §21's wording and the event vocabulary, cached for the app's lifetime. */
export function useVisibilityMeta() {
  return useQuery({
    queryKey: queryKeys.visibilityMeta(),
    queryFn: visibilityApi.getVisibilityMeta,
    staleTime: Infinity,
  });
}

/**
 * Impressions are **not** reported from the client.
 *
 * They were, and both halves counted the same page: the endpoint that serves a
 * ranked list already records what it sent, in order, for every client
 * (`visibilityAnalytics.recordImpressions`). Two sources for one number is not
 * redundancy - the merchant simply sees the inflated total, and in testing that
 * total was three times the truth once the feed re-fetched with the customer's
 * location.
 *
 * A client-side viewability observer would be *better* than the server's view -
 * it knows what actually crossed the fold - but it has to replace the server's,
 * not sit alongside it. Until it does, this file reports only what the server
 * cannot see, in `visibilityService`: which card was tapped, which shop profile
 * was opened, which directions link was followed.
 */

/** Records the next page's impressions at their true ranks, not restarting at 1. */
export function usePagedImpressionTracking(surface: VisibilitySurface) {
  const { coords } = useLocationContext();
  return useCallback(
    (items: (RankedListing | FeaturedPlacement)[], offset: number, extra: Omit<ImpressionContext, 'surface'> = {}) => {
      trackImpressions(
        items,
        {
          surface,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          ...extra,
        },
        offset,
      );
    },
    [surface, coords?.latitude, coords?.longitude],
  );
}
