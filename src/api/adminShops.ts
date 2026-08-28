import { apiClient } from './client';
import type { ApiSuccess, OpeningHours, ShopDetail } from '../types';
import type { BranchFormValues, ShopBranch, ShopMember } from '../types/admin';

export interface ShopFormValues {
  name?: string;
  description?: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  contactNumber?: string;
  email?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string> | null;
  openingHours?: OpeningHours | null;
  status?: 'active' | 'inactive';
  categoryIds?: number[];
  /**
   * The shop's own location (§4, §19). On update the API treats this as the
   * shop's primary branch - editing or creating it as needed - which is what
   * keeps "edit my address" on the profile screen instead of behind Branches.
   */
  primaryBranch?: Partial<BranchFormValues>;
}

/** The merchant's own shop, including the §17 completion checklist. */
export async function getShop(shopId: number): Promise<ShopDetail> {
  const res = await apiClient.get<ApiSuccess<ShopDetail>>(`/shops/${shopId}`);
  return res.data.data;
}

export async function updateShop(shopId: number, payload: ShopFormValues): Promise<ShopDetail> {
  const res = await apiClient.put<ApiSuccess<ShopDetail>>(`/shops/${shopId}`, payload);
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
