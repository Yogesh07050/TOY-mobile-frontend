import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta } from '../types';
import type { AdminBanner, BannerFormValues, BannerStatus } from '../types/admin';

export interface ListAdminBannersParams {
  page?: number;
  limit?: number;
  shopId?: number;
  status?: BannerStatus | 'all';
  search?: string;
}

export async function listAdminBanners(
  params: ListAdminBannersParams,
): Promise<{ banners: AdminBanner[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<AdminBanner>>('/banners', { params });
  return { banners: res.data.data, meta: res.data.meta };
}

export async function getAdminBanner(id: number): Promise<AdminBanner> {
  const res = await apiClient.get<ApiSuccess<AdminBanner>>(`/banners/${id}`);
  return res.data.data;
}

export async function listSelectableOffers(search?: string) {
  const res = await apiClient.get<ApiSuccess<Array<{ id: number; title: string; endDate: string }>>>(
    '/banners/selectable-offers',
    { params: { search } },
  );
  return res.data.data;
}

export async function createBanner(payload: BannerFormValues): Promise<AdminBanner> {
  const res = await apiClient.post<ApiSuccess<AdminBanner>>('/banners', payload);
  return res.data.data;
}

export async function updateBanner(id: number, payload: Partial<BannerFormValues>): Promise<AdminBanner> {
  const res = await apiClient.put<ApiSuccess<AdminBanner>>(`/banners/${id}`, payload);
  return res.data.data;
}

export async function updateBannerStatus(id: number, status: BannerStatus): Promise<void> {
  await apiClient.patch(`/banners/${id}/status`, { status });
}

export async function deleteBanner(id: number): Promise<void> {
  await apiClient.delete(`/banners/${id}`);
}
