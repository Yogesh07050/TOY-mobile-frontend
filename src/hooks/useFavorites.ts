import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as favoritesApi from '../api/favorites';
import { queryKeys } from '../api/queryKeys';
import { patchOfferInCache } from '../utils/offerCache';
import type { ListOffersParams } from '../api/offers';

export function useFavoritesList(params: Omit<ListOffersParams, 'favorites'> = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.favorites(params),
    queryFn: ({ pageParam }) => favoritesApi.listFavorites({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ offerId, isFavorite }: { offerId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await favoritesApi.removeFavorite(offerId);
      } else {
        await favoritesApi.addFavorite(offerId);
      }
      return { offerId, isFavorite: !isFavorite };
    },
    onMutate: async ({ offerId, isFavorite }) => {
      patchOfferInCache(queryClient, offerId, { isFavorite: !isFavorite });
    },
    onError: (_err, { offerId, isFavorite }) => {
      // Roll back the optimistic flip on failure.
      patchOfferInCache(queryClient, offerId, { isFavorite });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
