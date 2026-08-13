import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, Claim, ClaimStatus, PaginationMeta } from '../types';

export async function listClaims(params: {
  page?: number;
  limit?: number;
  status?: ClaimStatus | 'all';
  offerId?: number;
} = {}): Promise<{ claims: Claim[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<Claim>>('/claims', { params });
  return { claims: res.data.data, meta: res.data.meta };
}

export async function claimOffer(offerId: number): Promise<Claim> {
  const res = await apiClient.post<ApiSuccess<Claim>>(`/claims/${offerId}`);
  return res.data.data;
}
