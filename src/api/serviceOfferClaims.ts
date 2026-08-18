import { apiClient } from './client';
import type { ApiSuccess, ServiceOfferClaim } from '../types';

export async function claimServiceOffer(serviceOfferId: number): Promise<ServiceOfferClaim> {
  const res = await apiClient.post<ApiSuccess<ServiceOfferClaim>>(`/service-offer-claims/${serviceOfferId}`);
  return res.data.data;
}
