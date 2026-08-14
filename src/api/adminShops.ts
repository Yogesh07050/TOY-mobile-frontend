import { apiClient } from './client';
import type { ApiSuccess } from '../types';
import type { BranchFormValues, ShopBranch, ShopMember } from '../types/admin';

export interface ShopFormValues {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  contactNumber?: string;
  email?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  categoryIds?: number[];
}

export async function updateShop(shopId: number, payload: ShopFormValues) {
  const res = await apiClient.put<ApiSuccess<unknown>>(`/shops/${shopId}`, payload);
  return res.data.data;
}

export async function listBranches(shopId: number): Promise<ShopBranch[]> {
  const res = await apiClient.get<ApiSuccess<ShopBranch[]>>(`/shops/${shopId}/branches`);
  return res.data.data;
}

export async function createBranch(shopId: number, payload: BranchFormValues): Promise<ShopBranch> {
  const res = await apiClient.post<ApiSuccess<ShopBranch>>(`/shops/${shopId}/branches`, payload);
  return res.data.data;
}

export async function updateBranch(shopId: number, branchId: number, payload: Partial<BranchFormValues>): Promise<ShopBranch> {
  const res = await apiClient.put<ApiSuccess<ShopBranch>>(`/shops/${shopId}/branches/${branchId}`, payload);
  return res.data.data;
}

export async function deactivateBranch(shopId: number, branchId: number): Promise<void> {
  await apiClient.delete(`/shops/${shopId}/branches/${branchId}`);
}

export async function listMembers(shopId: number): Promise<ShopMember[]> {
  const res = await apiClient.get<ApiSuccess<ShopMember[]>>(`/shops/${shopId}/members`);
  return res.data.data;
}
