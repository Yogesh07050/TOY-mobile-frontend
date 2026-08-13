import { apiClient } from './client';
import type { ApiSuccess, ClientAnalyticsEvent } from '../types';

export interface AnalyticsEventPayload {
  event: ClientAnalyticsEvent;
  shopId?: number;
  offerId?: number;
  bannerId?: number;
  branchId?: number;
  categoryId?: number;
  city?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  term?: string;
}

export async function postAnalyticsEvent(payload: AnalyticsEventPayload): Promise<void> {
  await apiClient.post('/analytics/events', payload);
}

export async function postAnalyticsEventsBatch(events: AnalyticsEventPayload[]): Promise<{ accepted: number }> {
  const res = await apiClient.post<ApiSuccess<{ accepted: number }>>('/analytics/events/batch', { events });
  return res.data.data;
}

export async function getAnalyticsEventTypes(): Promise<{ all: string[]; client: string[] }> {
  const res = await apiClient.get<ApiSuccess<{ all: string[]; client: string[] }>>('/analytics/events/types');
  return res.data.data;
}
