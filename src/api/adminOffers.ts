import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, PaginationMeta } from '../types';
import type { ManagedOffer, OfferFormValues } from '../types/admin';
import type { OfferStatus } from '../types';

export interface ListManagedOffersParams {
  page?: number;
  limit?: number;
  search?: string;
  shopId?: number;
  status?: OfferStatus | 'all';
  sort?: string;
}

export async function listManagedOffers(
  params: ListManagedOffersParams,
): Promise<{ offers: ManagedOffer[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<ManagedOffer>>('/offers', { params: { ...params, manage: true } });
  return { offers: res.data.data, meta: res.data.meta };
}

export async function getManagedOffer(id: number): Promise<ManagedOffer> {
  const res = await apiClient.get<ApiSuccess<ManagedOffer>>(`/offers/${id}`);
  return res.data.data;
}

export async function createOffer(payload: OfferFormValues): Promise<ManagedOffer> {
  const res = await apiClient.post<ApiSuccess<ManagedOffer>>('/offers', payload);
  return res.data.data;
}

export async function updateOffer(id: number, payload: OfferFormValues): Promise<ManagedOffer> {
  const res = await apiClient.put<ApiSuccess<ManagedOffer>>(`/offers/${id}`, payload);
  return res.data.data;
}

export async function updateOfferStatus(id: number, status: OfferStatus): Promise<void> {
  await apiClient.patch(`/offers/${id}/status`, { status });
}

export async function deleteOffer(id: number): Promise<void> {
  await apiClient.delete(`/offers/${id}`);
}

/** No server-side duplicate endpoint exists — build the payload from the source offer client-side. */
export function toDuplicatePayload(source: ManagedOffer): OfferFormValues {
  return {
    shopId: source.shop.id,
    categoryId: source.category?.id ?? null,
    title: `${source.title} (Copy)`,
    productName: source.productName ?? undefined,
    description: source.description ?? undefined,
    offerText: source.offerText ?? undefined,
    offerType: source.offerType,
    discountType: source.discountType,
    discountValue: source.discountValue,
    originalPrice: source.originalPrice,
    discountedPrice: source.discountedPrice,
    buyQuantity: source.buyQuantity,
    getQuantity: source.getQuantity,
    minPurchase: source.minPurchase,
    termsConditions: source.termsConditions ?? undefined,
    eligibility: source.eligibility ?? undefined,
    usageRestrictions: source.usageRestrictions ?? undefined,
    applicableProducts: source.applicableProducts ?? undefined,
    isRecurring: source.isRecurring,
    recurrenceType: source.recurrenceType,
    startDate: new Date().toISOString(),
    endDate: source.endDate,
    status: 'draft',
    applicabilityType: source.applicabilityType,
    branchIds: source.branchIds ?? [],
    images: source.images?.map((img) => ({ url: img.url, thumbnailUrl: img.thumbnailUrl ?? undefined })) ?? [],
  };
}
