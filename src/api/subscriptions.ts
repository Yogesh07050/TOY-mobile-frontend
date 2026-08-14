import { apiClient } from './client';
import type { ApiSuccess } from '../types';
import type { PlanCatalogueResponse, PlanKey, ShopEntitlements } from '../types/admin';

export async function getPlanCatalogue(): Promise<PlanCatalogueResponse> {
  const res = await apiClient.get<ApiSuccess<PlanCatalogueResponse>>('/subscriptions/plans');
  return res.data.data;
}

export async function getMyEntitlements(): Promise<ShopEntitlements[]> {
  const res = await apiClient.get<ApiSuccess<ShopEntitlements[]>>('/subscriptions/me');
  return res.data.data;
}

export async function getShopEntitlements(shopId: number): Promise<ShopEntitlements> {
  const res = await apiClient.get<ApiSuccess<ShopEntitlements>>(`/subscriptions/shops/${shopId}`);
  return res.data.data;
}

export async function changePlan(
  shopId: number,
  payload: { plan: PlanKey; billingCycle?: 'monthly' | 'yearly'; note?: string },
): Promise<ShopEntitlements> {
  const res = await apiClient.put<ApiSuccess<ShopEntitlements>>(`/subscriptions/shops/${shopId}`, payload);
  return res.data.data;
}

export async function confirmPayment(shopId: number, payload: { provider?: string; reference?: string } = {}) {
  const res = await apiClient.post<ApiSuccess<ShopEntitlements>>(`/subscriptions/shops/${shopId}/confirm-payment`, payload);
  return res.data.data;
}

export async function cancelSubscription(shopId: number, note?: string) {
  const res = await apiClient.post<ApiSuccess<ShopEntitlements>>(`/subscriptions/shops/${shopId}/cancel`, { note });
  return res.data.data;
}
