import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, Offer, PaginationMeta } from '../types';
import type { ListOffersParams } from './offers';

// KNOWN BACKEND GAP: /favorites reuses the offers listing pipeline, which hardcodes
// `status = 'active' AND end_date >= NOW()` for non-management callers (see
// offer.service.js listOffers). Customers cannot pass status=expired either — that
// path requires shop EDIT_OFFER scope customers don't have. Result: an expired
// favorited offer silently disappears from this list instead of showing an
// "Expired" state, which contradicts the V1 spec (§18). Needs a backend fix
// (e.g. a dedicated favorites endpoint that doesn't filter by active status).
export async function listFavorites(
  params: Omit<ListOffersParams, 'favorites'> = {},
): Promise<{ offers: Offer[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<Offer>>('/favorites', { params: { ...params, favorites: true } });
  return { offers: res.data.data, meta: res.data.meta };
}

export async function addFavorite(offerId: number): Promise<void> {
  await apiClient.post<ApiSuccess<{ offerId: number; isFavorite: true }>>(`/favorites/${offerId}`);
}

export async function removeFavorite(offerId: number): Promise<void> {
  await apiClient.delete(`/favorites/${offerId}`);
}
