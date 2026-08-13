import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, Offer, OfferDetail, PaginationMeta, Review } from '../types';

export type OfferSort =
  | 'newest'
  | 'endingSoon'
  | 'highestDiscount'
  | 'mostViewed'
  | 'mostPopular'
  | 'nearest';

export interface ListOffersParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: number;
  shop?: string;
  shopId?: number;
  branchId?: number;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minDiscount?: number;
  maxDiscount?: number;
  offerType?: string;
  expiringInDays?: number;
  expiringInHours?: number;
  startDate?: string;
  endDate?: string;
  favorites?: boolean;
  following?: boolean;
  sort?: OfferSort;
}

export interface OfferListResult {
  offers: Offer[];
  meta: PaginationMeta;
}

export async function listOffers(params: ListOffersParams = {}): Promise<OfferListResult> {
  const res = await apiClient.get<ApiListSuccess<Offer>>('/offers', { params });
  return { offers: res.data.data, meta: res.data.meta };
}

export async function getOffer(id: number, coords?: { latitude?: number; longitude?: number }): Promise<OfferDetail> {
  const res = await apiClient.get<ApiSuccess<OfferDetail>>(`/offers/${id}`, { params: coords });
  return res.data.data;
}

export type OfferTrackEvent = 'view' | 'click' | 'share' | 'impression';

export async function trackOfferEvent(
  id: number,
  payload: { event: OfferTrackEvent; branchId?: number; city?: string; latitude?: number; longitude?: number },
): Promise<void> {
  await apiClient.post(`/offers/${id}/track`, payload);
}

export async function listOfferReviews(
  id: number,
  params: { page?: number; limit?: number } = {},
): Promise<{ reviews: Review[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<Review>>(`/offers/${id}/reviews`, { params });
  return { reviews: res.data.data, meta: res.data.meta };
}

export async function submitOfferReview(id: number, payload: { rating: number; comment?: string }): Promise<Review> {
  const res = await apiClient.post<ApiSuccess<Review>>(`/offers/${id}/reviews`, payload);
  return res.data.data;
}
