import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta, Service, ServiceBooking, ServiceDetail, ServiceSort } from '../types';

export interface ListServicesParams {
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
  pricingType?: string;
  bookingType?: string;
  homeService?: boolean;
  hasOffer?: boolean;
  sort?: ServiceSort;
}

export interface ServiceListResult {
  services: Service[];
  meta: PaginationMeta;
}

export async function listServices(params: ListServicesParams = {}): Promise<ServiceListResult> {
  const res = await apiClient.get<ApiListSuccess<Service>>('/services', { params });
  return { services: res.data.data, meta: res.data.meta };
}

export async function getService(id: number, coords?: { latitude?: number; longitude?: number }): Promise<ServiceDetail> {
  const res = await apiClient.get<ApiSuccess<ServiceDetail>>(`/services/${id}`, { params: coords });
  return res.data.data;
}

export type ServiceTrackEvent = 'view' | 'click' | 'share' | 'enquire';

export async function trackService(
  id: number,
  payload: { event: ServiceTrackEvent; branchId?: number; city?: string; latitude?: number; longitude?: number },
): Promise<void> {
  await apiClient.post(`/services/${id}/track`, payload);
}

export interface BookServicePayload {
  branchId?: number | null;
  serviceOfferId?: number | null;
  requestedAt?: string | null;
  notes?: string;
}

export async function bookService(id: number, payload: BookServicePayload): Promise<ServiceBooking> {
  const res = await apiClient.post<ApiSuccess<ServiceBooking>>(`/services/${id}/book`, payload);
  return res.data.data;
}
