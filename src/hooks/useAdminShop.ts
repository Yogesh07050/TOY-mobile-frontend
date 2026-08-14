import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminShopsApi from '../api/adminShops';
import type { BranchFormValues } from '../types/admin';

export function useBranches(shopId: number | null) {
  return useQuery({
    queryKey: ['adminBranches', shopId],
    queryFn: () => adminShopsApi.listBranches(shopId as number),
    enabled: shopId != null,
  });
}

export function useCreateBranch(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BranchFormValues) => adminShopsApi.createBranch(shopId as number, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBranches', shopId] }),
  });
}

export function useUpdateBranch(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ branchId, payload }: { branchId: number; payload: Partial<BranchFormValues> }) =>
      adminShopsApi.updateBranch(shopId as number, branchId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBranches', shopId] }),
  });
}

export function useDeactivateBranch(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branchId: number) => adminShopsApi.deactivateBranch(shopId as number, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminBranches', shopId] }),
  });
}
