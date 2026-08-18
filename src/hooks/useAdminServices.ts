import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminServicesApi from '../api/adminServices';
import type { ListManagedServicesParams } from '../api/adminServices';
import type { ServiceFormValues } from '../types/admin';
import type { ServiceStatus } from '../types';

export function useManagedServicesList(params: Omit<ListManagedServicesParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: ['adminServices', params],
    queryFn: ({ pageParam }) => adminServicesApi.listManagedServices({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled: !!params.shopId,
  });
}

export function useManagedService(id: number | undefined) {
  return useQuery({
    queryKey: ['adminService', id],
    queryFn: () => adminServicesApi.getManagedService(id as number),
    enabled: id != null,
  });
}

function invalidateServices(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['adminServices'] });
  queryClient.invalidateQueries({ queryKey: ['adminService'] });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceFormValues) => adminServicesApi.createService(payload),
    onSuccess: () => invalidateServices(queryClient),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ServiceFormValues }) => adminServicesApi.updateService(id, payload),
    onSuccess: () => invalidateServices(queryClient),
  });
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceStatus }) => adminServicesApi.updateServiceStatus(id, status),
    onSuccess: () => invalidateServices(queryClient),
  });
}

export function useDuplicateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServicesApi.duplicateService(id),
    onSuccess: () => invalidateServices(queryClient),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminServicesApi.deleteService(id),
    onSuccess: () => invalidateServices(queryClient),
  });
}
