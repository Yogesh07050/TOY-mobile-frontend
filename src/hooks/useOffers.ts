import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import * as offersApi from '../api/offers';
import { queryKeys } from '../api/queryKeys';
import type { ListOffersParams } from '../api/offers';

/**
 * @param enabled Pass `false` when the params make this an account-scoped
 *   listing a guest cannot ask for — `following: true` and `favorites: true`
 *   are rejected with a 401 by the API (§25), so the request is not made.
 */
export function useOffersList(params: ListOffersParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.offers(params),
    queryFn: ({ pageParam }) => offersApi.listOffers({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled,
  });
}

export function useOffer(id: number | undefined, coords?: { latitude?: number; longitude?: number }) {
  return useQuery({
    queryKey: queryKeys.offer(id ?? -1),
    queryFn: () => offersApi.getOffer(id as number, coords),
    enabled: id != null,
  });
}

export function useOfferReviews(id: number) {
  return useInfiniteQuery({
    queryKey: queryKeys.offerReviews(id),
    queryFn: ({ pageParam }) => offersApi.listOfferReviews(id, { page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
  });
}

export function useInvalidateOffers() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['offers'] });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    queryClient.invalidateQueries({ queryKey: ['endingSoon'] });
    queryClient.invalidateQueries({ queryKey: ['nearby'] });
    queryClient.invalidateQueries({ queryKey: ['recommended'] });
  };
}
