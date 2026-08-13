import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as claimsApi from '../api/claims';
import { queryKeys } from '../api/queryKeys';
import type { ClaimStatus } from '../types';

export function useClaimsList(status: ClaimStatus | 'all' = 'all') {
  return useInfiniteQuery({
    queryKey: queryKeys.claims({ status }),
    queryFn: ({ pageParam }) => claimsApi.listClaims({ page: pageParam, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
  });
}

export function useClaimOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offerId: number) => claimsApi.claimOffer(offerId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });
}
