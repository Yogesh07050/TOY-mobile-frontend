import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta, Shop, ShopBranch, ShopDetail } from '../types';

export interface ListShopsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  sort?: 'name' | 'newest' | 'popular' | 'nearest';
}

export async function listShops(params: ListShopsParams = {}): Promise<{ shops: Shop[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<Shop>>('/shops', { params });
  return { shops: res.data.data, meta: res.data.meta };
}

export async function getShop(
  idOrSlug: number | string,
  coords?: { latitude?: number; longitude?: number },
): Promise<ShopDetail> {
  const res = await apiClient.get<ApiSuccess<ShopDetail>>(`/shops/${idOrSlug}`, { params: coords });
  return res.data.data;
}

export async function getShopBranches(idOrSlug: number | string): Promise<ShopBranch[]> {
  const res = await apiClient.get<ApiSuccess<ShopBranch[]>>(`/shops/${idOrSlug}/branches`);
  return res.data.data;
}
