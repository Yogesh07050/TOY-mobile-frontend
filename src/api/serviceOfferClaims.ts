import { apiClient } from './client';
import { idempotencyHeaders, keyFor, settle } from './idempotency';
import type { ApiSuccess, ServiceOfferClaim } from '../types';

/** The services twin of `claimOffer`, with the same §51 protection. */
export async function claimServiceOffer(serviceOfferId: number): Promise<ServiceOfferClaim> {
  const key = keyFor('service-claim', serviceOfferId);
  const res = await apiClient.post<ApiSuccess<ServiceOfferClaim>>(
    `/service-offer-claims/${serviceOfferId}`,
    undefined,
    idempotencyHeaders(key),
  );
  settle('service-claim', serviceOfferId);
  return res.data.data;
}
