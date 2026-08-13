import { apiClient } from './client';
import type { ApiSuccess, Banner, Offer } from '../types';

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
