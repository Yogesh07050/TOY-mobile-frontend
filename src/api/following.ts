import { apiClient } from './client';
import type { ApiSuccess, FollowedCategory, FollowedShop } from '../types';

export async function listFollowedShops(): Promise<FollowedShop[]> {
  const res = await apiClient.get<ApiSuccess<FollowedShop[]>>('/following/shops');
  return res.data.data;
}

export async function followShop(shopId: number): Promise<void> {
  await apiClient.post(`/following/shops/${shopId}`);
}

export async function unfollowShop(shopId: number): Promise<void> {
  await apiClient.delete(`/following/shops/${shopId}`);
}

export async function listFollowedCategories(): Promise<FollowedCategory[]> {
  const res = await apiClient.get<ApiSuccess<FollowedCategory[]>>('/following/categories');
  return res.data.data;
}

export async function followCategory(categoryId: number): Promise<void> {
  await apiClient.post(`/following/categories/${categoryId}`);
}

export async function unfollowCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/following/categories/${categoryId}`);
}
