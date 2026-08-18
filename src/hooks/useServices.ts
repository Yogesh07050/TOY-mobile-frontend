import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as servicesApi from '../api/services';
import { queryKeys } from '../api/queryKeys';
import type { ListServicesParams } from '../api/services';

export function useServicesList(params: ListServicesParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.services(params),
    queryFn: ({ pageParam }) => servicesApi.listServices({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
  });
}

export function useService(id: number | undefined, coords?: { latitude?: number; longitude?: number }) {
  return useQuery({
    queryKey: queryKeys.service(id ?? -1),
    queryFn: () => servicesApi.getService(id as number, coords),
    enabled: id != null,
  });
}

export function useTrackService() {
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: number } & Parameters<typeof servicesApi.trackService>[1]) =>
      servicesApi.trackService(id, payload),
  });
}

export function useBookService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: servicesApi.BookServicePayload }) =>
      servicesApi.bookService(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.service(id) });
    },
  });
}
