import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as subscriptionsApi from '../api/subscriptions';
import type { PlanKey } from '../types/admin';

export function usePlanCatalogue() {
  return useQuery({ queryKey: ['planCatalogue'], queryFn: subscriptionsApi.getPlanCatalogue, staleTime: 10 * 60 * 1000 });
}

export function useShopEntitlements(shopId: number | null) {
  return useQuery({
    queryKey: ['shopEntitlements', shopId],
    queryFn: () => subscriptionsApi.getShopEntitlements(shopId as number),
    enabled: shopId != null,
  });
}

export function useChangePlan(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { plan: PlanKey; billingCycle?: 'monthly' | 'yearly'; note?: string }) =>
      subscriptionsApi.changePlan(shopId as number, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopEntitlements', shopId] }),
  });
}

export function useConfirmPayment(shopId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { provider?: string; reference?: string } = {}) =>
      subscriptionsApi.confirmPayment(shopId as number, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopEntitlements', shopId] }),
  });
}
