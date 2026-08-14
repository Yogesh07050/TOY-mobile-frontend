import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminBannersApi from '../api/adminBanners';
import type { ListAdminBannersParams } from '../api/adminBanners';
import type { BannerFormValues, BannerStatus } from '../types/admin';

export function useAdminBannersList(params: Omit<ListAdminBannersParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['adminBanners', params],
    queryFn: ({ pageParam }) => adminBannersApi.listAdminBanners({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled: !!params.shopId,
  });
}

export function useAdminBanner(id: number | undefined) {
  return useQuery({
    queryKey: ['adminBanner', id],
    queryFn: () => adminBannersApi.getAdminBanner(id as number),
    enabled: id != null,
  });
}

export function useSelectableOffers(search: string) {
  return useQuery({
    queryKey: ['selectableOffers', search],
    queryFn: () => adminBannersApi.listSelectableOffers(search || undefined),
  });
}

function invalidateBanners(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
  queryClient.invalidateQueries({ queryKey: ['adminBanner'] });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BannerFormValues) => adminBannersApi.createBanner(payload),
    onSuccess: () => invalidateBanners(queryClient),
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BannerFormValues> }) =>
      adminBannersApi.updateBanner(id, payload),
    onSuccess: () => invalidateBanners(queryClient),
  });
}

export function useUpdateBannerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: BannerStatus }) => adminBannersApi.updateBannerStatus(id, status),
    onSuccess: () => invalidateBanners(queryClient),
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminBannersApi.deleteBanner(id),
    onSuccess: () => invalidateBanners(queryClient),
  });
}
