import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminServiceOffersApi from '../api/adminServiceOffers';
import type { ListServiceOffersParams } from '../api/adminServiceOffers';
import type { ServiceOfferFormValues } from '../types/admin';
import type { ServiceOfferStatus } from '../types';

export function useServiceOffersList(serviceId: number | undefined, params: Omit<ListServiceOffersParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['serviceOffers', serviceId, params],
    queryFn: ({ pageParam }) => adminServiceOffersApi.listServiceOffers(serviceId as number, { ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled: serviceId != null,
  });
}

export function useServiceOffer(serviceId: number | undefined, offerId: number | undefined) {
  return useQuery({
    queryKey: ['serviceOffer', serviceId, offerId],
    queryFn: () => adminServiceOffersApi.getServiceOffer(serviceId as number, offerId as number),
    enabled: serviceId != null && offerId != null,
  });
}

function invalidateServiceOffers(queryClient: ReturnType<typeof useQueryClient>, serviceId: number) {
  queryClient.invalidateQueries({ queryKey: ['serviceOffers', serviceId] });
  queryClient.invalidateQueries({ queryKey: ['serviceOffer', serviceId] });
}

export function useCreateServiceOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: number; payload: ServiceOfferFormValues }) =>
      adminServiceOffersApi.createServiceOffer(serviceId, payload),
    onSuccess: (_data, { serviceId }) => invalidateServiceOffers(queryClient, serviceId),
  });
}

export function useUpdateServiceOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, offerId, payload }: { serviceId: number; offerId: number; payload: ServiceOfferFormValues }) =>
      adminServiceOffersApi.updateServiceOffer(serviceId, offerId, payload),
    onSuccess: (_data, { serviceId }) => invalidateServiceOffers(queryClient, serviceId),
  });
}

export function useSetServiceOfferStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, offerId, status }: { serviceId: number; offerId: number; status: ServiceOfferStatus }) =>
      adminServiceOffersApi.setServiceOfferStatus(serviceId, offerId, status),
    onSuccess: (_data, { serviceId }) => invalidateServiceOffers(queryClient, serviceId),
  });
}

export function useDeleteServiceOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, offerId }: { serviceId: number; offerId: number }) =>
      adminServiceOffersApi.deleteServiceOffer(serviceId, offerId),
    onSuccess: (_data, { serviceId }) => invalidateServiceOffers(queryClient, serviceId),
  });
}
