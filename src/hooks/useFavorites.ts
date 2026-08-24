import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as favoritesApi from '../api/favorites';
import { queryKeys } from '../api/queryKeys';
import { patchOfferInCache } from '../utils/offerCache';
import { usePush } from '../services/notifications/PushNotificationsProvider';
import type { ListOffersParams } from '../api/offers';

/**
 * @param enabled Guest Browsing §22/§25: favourites is an authenticated
 *   endpoint, so a guest on the Saved tab must not fire it. Passing `false`
 *   keeps the hook mounted (the tab still renders) without issuing a request
 *   that could only come back 401.
 */
export function useFavoritesList(params: Omit<ListOffersParams, 'favorites'> = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.favorites(params),
    queryFn: ({ pageParam }) => favoritesApi.listFavorites({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { noteEngagement } = usePush();

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
    onSuccess: ({ isFavorite }) => {
      // Saving an offer is the clearest moment notifications pay for
      // themselves - it is the thing the expiry reminder will be about - so
      // it is what earns the right to ask for permission (Push §5). Only the
      // save direction counts; un-saving is the opposite signal.
      if (isFavorite) noteEngagement();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
