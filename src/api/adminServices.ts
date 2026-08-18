import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta } from '../types';
import type { ManagedService, ServiceFormValues } from '../types/admin';
import type { ServiceStatus } from '../types';

export interface ListManagedServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  shopId?: number;
  status?: ServiceStatus | 'all';
  sort?: string;
}

export async function listManagedServices(
  params: ListManagedServicesParams,
): Promise<{ services: ManagedService[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<ManagedService>>('/services', { params: { ...params, manage: true } });
  return { services: res.data.data, meta: res.data.meta };
}

export async function getManagedService(id: number): Promise<ManagedService> {
  const res = await apiClient.get<ApiSuccess<ManagedService>>(`/services/${id}`);
  return res.data.data;
}

export async function createService(payload: ServiceFormValues): Promise<ManagedService> {
  const res = await apiClient.post<ApiSuccess<ManagedService>>('/services', payload);
  return res.data.data;
}

export async function updateService(id: number, payload: ServiceFormValues): Promise<ManagedService> {
  const res = await apiClient.put<ApiSuccess<ManagedService>>(`/services/${id}`, payload);
  return res.data.data;
}

export async function updateServiceStatus(id: number, status: ServiceStatus): Promise<void> {
  await apiClient.patch(`/services/${id}/status`, { status });
}

export async function duplicateService(id: number): Promise<ManagedService> {
  const res = await apiClient.post<ApiSuccess<ManagedService>>(`/services/${id}/duplicate`);
  return res.data.data;
}

export async function deleteService(id: number): Promise<void> {
  await apiClient.delete(`/services/${id}`);
}
