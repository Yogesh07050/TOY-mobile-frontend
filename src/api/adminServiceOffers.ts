import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta, ServiceOffer, ServiceOfferStatus } from '../types';
import type { ServiceOfferFormValues } from '../types/admin';

export interface ListServiceOffersParams {
  page?: number;
  limit?: number;
  status?: ServiceOfferStatus | 'all';
  manage?: boolean;
}

export async function listServiceOffers(
  serviceId: number,
  params: ListServiceOffersParams = {},
): Promise<{ serviceOffers: ServiceOffer[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<ServiceOffer>>(`/services/${serviceId}/offers`, {
    params: { ...params, manage: true },
  });
  return { serviceOffers: res.data.data, meta: res.data.meta };
}

export async function getServiceOffer(serviceId: number, offerId: number): Promise<ServiceOffer> {
  const res = await apiClient.get<ApiSuccess<ServiceOffer>>(`/services/${serviceId}/offers/${offerId}`);
  return res.data.data;
}

export async function createServiceOffer(serviceId: number, payload: ServiceOfferFormValues): Promise<ServiceOffer> {
  const res = await apiClient.post<ApiSuccess<ServiceOffer>>(`/services/${serviceId}/offers`, payload);
  return res.data.data;
}

export async function updateServiceOffer(
  serviceId: number,
  offerId: number,
  payload: ServiceOfferFormValues,
): Promise<ServiceOffer> {
  const res = await apiClient.put<ApiSuccess<ServiceOffer>>(`/services/${serviceId}/offers/${offerId}`, payload);
  return res.data.data;
}

export async function setServiceOfferStatus(
  serviceId: number,
  offerId: number,
  status: ServiceOfferStatus,
): Promise<void> {
  await apiClient.patch(`/services/${serviceId}/offers/${offerId}/status`, { status });
}

export async function deleteServiceOffer(serviceId: number, offerId: number): Promise<void> {
  await apiClient.delete(`/services/${serviceId}/offers/${offerId}`);
}
