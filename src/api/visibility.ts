import { apiClient } from './client';
import type {
  ApiListSuccess,
  ApiSuccess,
  ClientVisibilityEvent,
  FeaturedPlacement,
  PaginationMeta,
  PlacementType,
  RankedListing,
  VisibilityFeed,
  VisibilityMeta,
  VisibilitySurface,
  VisibilityListingType,
} from '../types';

/**
 * The customer half of the Visibility & Promotion System (§13, §14, §29, §32).
 *
 * These sit alongside `discovery.ts` rather than replacing it. `/discovery` is
 * the simple sorted listing API the app has always used; this is the ranked one
 * (§4), and running both means screens migrate one at a time rather than all on
 * the day this ships.
 *
 * Every endpoint here is anonymous-friendly - §4 gives guests contextual
 * ranking rather than none - so nothing below requires a token.
 */

export interface RankedFeedParams {
  page?: number;
  limit?: number;
  latitude?: number;
  longitude?: number;
  city?: string;
  categoryId?: number;
  shopId?: number;
  type?: 'all' | 'product' | 'service';
  radiusKm?: number;
  featuredLimit?: number;
}

/** §11's Home Featured, over the ranked home feed (§29's shape exactly). */
export async function getRankedFeed(
  params: RankedFeedParams = {},
): Promise<{ feed: VisibilityFeed; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<never> & { data: VisibilityFeed }>(
    '/visibility/feed',
    { params },
  );
  return { feed: res.data.data, meta: res.data.meta };
}

/** §14's Near Me flow: location first, then relevance, then fairness. */
export async function getRankedNearMe(
  params: RankedFeedParams & { latitude: number; longitude: number },
): Promise<{ feed: VisibilityFeed; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<never> & { data: VisibilityFeed }>(
    '/visibility/near-me',
    { params },
  );
  return { feed: res.data.data, meta: res.data.meta };
}

/** §13's search ranking: relevance first, subscription seventh. */
export async function searchRanked(
  params: RankedFeedParams & { q: string },
): Promise<{ query: string; items: RankedListing[]; meta: PaginationMeta }> {
  const res = await apiClient.get<
    ApiListSuccess<never> & { data: { query: string; items: RankedListing[] } }
  >('/visibility/search', { params });
  return { ...res.data.data, meta: res.data.meta };
}

/** §11's Category Featured, over a category-filtered ranked list. */
export async function getRankedCategory(
  categoryId: number,
  params: RankedFeedParams = {},
): Promise<{ feed: VisibilityFeed; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<never> & { data: VisibilityFeed }>(
    `/visibility/category/${categoryId}`,
    { params },
  );
  return { feed: res.data.data, meta: res.data.meta };
}

/** §12's Ending Soon. Business and Premium listings only - the API enforces it. */
export async function getRankedEndingSoon(
  params: RankedFeedParams & { withinHours?: number } = {},
): Promise<{ feed: VisibilityFeed; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<never> & { data: VisibilityFeed }>(
    '/visibility/ending-soon',
    { params },
  );
  return { feed: res.data.data, meta: res.data.meta };
}

/** One promotional space on its own, for a screen that loads rails lazily. */
export async function getPlacements(
  placementType: PlacementType,
  params: { latitude?: number; longitude?: number; city?: string; categoryId?: number; limit?: number } = {},
): Promise<FeaturedPlacement[]> {
  const res = await apiClient.get<ApiSuccess<FeaturedPlacement[]>>(
    `/visibility/placements/${placementType}`,
    { params },
  );
  return res.data.data;
}

export interface VisibilityEventPayload {
  event: ClientVisibilityEvent;
  surface?: VisibilitySurface;
  placementType?: PlacementType;
  featuredCampaignId?: number;
  slotId?: number;
  listingType?: VisibilityListingType;
  listingId?: number;
  shopId?: number;
  branchId?: number;
  categoryId?: number;
  position?: number;
  distanceKm?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
}

export async function postVisibilityEvent(payload: VisibilityEventPayload): Promise<void> {
  await apiClient.post('/visibility/events', payload);
}

export async function postVisibilityEvents(
  events: VisibilityEventPayload[],
): Promise<{ accepted: number }> {
  const res = await apiClient.post<ApiSuccess<{ accepted: number }>>('/visibility/events/batch', {
    events,
  });
  return res.data.data;
}

export async function getVisibilityMeta(): Promise<VisibilityMeta> {
  const res = await apiClient.get<ApiSuccess<VisibilityMeta>>('/visibility/meta');
  return res.data.data;
}
