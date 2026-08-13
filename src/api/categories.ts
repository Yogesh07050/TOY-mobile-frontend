import { apiClient } from './client';
import type { ApiSuccess, Category } from '../types';

export async function listCategories(params: { parentId?: number; withCounts?: boolean } = {}): Promise<Category[]> {
  const res = await apiClient.get<ApiSuccess<Category[]>>('/categories', { params });
  return res.data.data;
}

export async function getCategory(id: number): Promise<Category> {
  const res = await apiClient.get<ApiSuccess<Category>>(`/categories/${id}`);
  return res.data.data;
}
