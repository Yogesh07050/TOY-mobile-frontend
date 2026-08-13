import { apiClient } from './client';
import type { ApiSuccess, CustomerPreferences, OfferTypePreference } from '../types';

export interface SetPreferencesPayload {
  categoryIds: number[];
  shopIds?: number[];
  minimumDiscountPercent?: number | null;
  offerTypes?: OfferTypePreference[];
}

export async function getPreferences(): Promise<CustomerPreferences> {
  const res = await apiClient.get<ApiSuccess<CustomerPreferences>>('/preferences');
  return res.data.data;
}

export async function getPreferencesStatus(): Promise<{ preferencesCompleted: boolean }> {
  const res = await apiClient.get<ApiSuccess<{ preferencesCompleted: boolean }>>('/preferences/status');
  return res.data.data;
}

export async function submitPreferences(payload: SetPreferencesPayload): Promise<CustomerPreferences> {
  const res = await apiClient.post<ApiSuccess<CustomerPreferences>>('/preferences', payload);
  return res.data.data;
}

export async function updatePreferences(payload: SetPreferencesPayload): Promise<CustomerPreferences> {
  const res = await apiClient.put<ApiSuccess<CustomerPreferences>>('/preferences', payload);
  return res.data.data;
}
