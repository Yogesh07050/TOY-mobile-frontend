import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminOffersApi from '../api/adminOffers';
import type { ListManagedOffersParams } from '../api/adminOffers';
import type { OfferFormValues } from '../types/admin';
import type { OfferStatus } from '../types';

export function useManagedOffersList(params: Omit<ListManagedOffersParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['adminOffers', params],
    queryFn: ({ pageParam }) => adminOffersApi.listManagedOffers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled: !!params.shopId,
  });
}

export function useManagedOffer(id: number | undefined) {
  return useQuery({
    queryKey: ['adminOffer', id],
    queryFn: () => adminOffersApi.getManagedOffer(id as number),
    enabled: id != null,
  });
}

function invalidateOffers(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['adminOffers'] });
  queryClient.invalidateQueries({ queryKey: ['adminOffer'] });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfferFormValues) => adminOffersApi.createOffer(payload),
    onSuccess: () => invalidateOffers(queryClient),
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OfferFormValues }) => adminOffersApi.updateOffer(id, payload),
    onSuccess: () => invalidateOffers(queryClient),
  });
}

export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: OfferStatus }) => adminOffersApi.updateOfferStatus(id, status),
    onSuccess: () => invalidateOffers(queryClient),
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminOffersApi.deleteOffer(id),
    onSuccess: () => invalidateOffers(queryClient),
  });
}
