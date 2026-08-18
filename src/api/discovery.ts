import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, Banner, Offer, PaginationMeta, UnifiedListing } from '../types';

export async function getFeaturedBanners(limit = 8): Promise<Banner[]> {
  const res = await apiClient.get<ApiSuccess<Banner[]>>('/discovery/featured', { params: { limit } });
  return res.data.data;
}

export async function trackBannerEvent(id: number, event: 'impression' | 'click'): Promise<void> {
  await apiClient.post(`/discovery/featured/${id}/track`, { event });
}

export async function getEndingSoonOffers(params: {
  latitude?: number;
  longitude?: number;
  limit?: number;
  withinHours?: number;
} = {}): Promise<Offer[]> {
  const res = await apiClient.get<ApiSuccess<Offer[]>>('/discovery/ending-soon', { params });
  return res.data.data;
}

export async function getNearbyOffers(params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}): Promise<Offer[]> {
  const res = await apiClient.get<ApiSuccess<Offer[]>>('/discovery/nearby', { params });
  return res.data.data;
}

export async function getRecommendedOffers(params: {
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
} = {}): Promise<Offer[]> {
  const res = await apiClient.get<ApiSuccess<Offer[]>>('/discovery/recommended', { params });
  return res.data.data;
}

export interface ListUnifiedOffersParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  shopId?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  type?: 'all' | 'product' | 'service';
  sort?: 'newest' | 'endingSoon' | 'mostViewed' | 'nearest';
}

export async function listUnifiedOffers(
  params: ListUnifiedOffersParams = {},
): Promise<{ listings: UnifiedListing[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<UnifiedListing>>('/discovery/offers', { params });
  return { listings: res.data.data, meta: res.data.meta };
}
