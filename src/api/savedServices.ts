import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta, Service } from '../types';
import type { ListServicesParams } from './services';

export async function listSavedServices(
  params: Omit<ListServicesParams, 'saved'> = {},
): Promise<{ services: Service[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<Service>>('/saved-services', { params: { ...params, saved: true } });
  return { services: res.data.data, meta: res.data.meta };
}

export async function addSavedService(serviceId: number): Promise<void> {
  await apiClient.post<ApiSuccess<{ serviceId: number; isSaved: true }>>(`/saved-services/${serviceId}`);
}

export async function removeSavedService(serviceId: number): Promise<void> {
  await apiClient.delete(`/saved-services/${serviceId}`);
}
