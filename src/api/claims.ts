import { apiClient } from './client';
import { idempotencyHeaders, keyFor, settle } from './idempotency';
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

/**
 * §51. The key is derived from the offer, so a double tap and a retry after a
 * timeout both carry the same one and the customer ends up with one code.
 *
 * `settle` runs on success only. A failed attempt keeps its key, so the retry
 * the customer is about to make is still recognised as the same intent - which
 * is the case §50 is actually about.
 */
export async function claimOffer(offerId: number): Promise<Claim> {
  const key = keyFor('claim', offerId);
  const res = await apiClient.post<ApiSuccess<Claim>>(
    `/claims/${offerId}`,
    undefined,
    idempotencyHeaders(key),
  );
  settle('claim', offerId);
  return res.data.data;
}
