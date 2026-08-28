import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminShopsApi from '../api/adminShops';
import type { BranchFormValues } from '../types/admin';

/** The merchant's own shop profile, with §17's completion checklist. */
export function useAdminShop(shopId: number | null) {
  return useQuery({
    queryKey: ['adminShop', shopId],
    queryFn: () => adminShopsApi.getShop(shopId as number),
    enabled: shopId != null,
  });
}

export function useUpdateShop(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: adminShopsApi.ShopFormValues) =>
      adminShopsApi.updateShop(shopId as number, payload),
    onSuccess: (shop) => {
      queryClient.setQueryData(['adminShop', shopId], shop);
      // The profile owns the primary branch now, so the branch list is stale.
      void queryClient.invalidateQueries({ queryKey: ['adminBranches', shopId] });
    },
  });
}

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
