import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savedServicesApi from '../api/savedServices';
import { queryKeys } from '../api/queryKeys';
import { patchServiceInCache } from '../utils/serviceCache';
import { patchUnifiedServiceSaved } from '../utils/unifiedListingCache';
import { usePush } from '../services/notifications/PushNotificationsProvider';
import type { ListServicesParams } from '../api/services';

/** @param enabled False for a guest — saved services is authenticated (§25). */
export function useSavedServicesList(
  params: Omit<ListServicesParams, 'saved'> = {},
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.savedServices(params),
    queryFn: ({ pageParam }) => savedServicesApi.listSavedServices({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
    enabled,
  });
}

export function useToggleSavedService() {
  const queryClient = useQueryClient();
  const { noteEngagement } = usePush();

  return useMutation({
    mutationFn: async ({ serviceId, isSaved }: { serviceId: number; isSaved: boolean }) => {
      if (isSaved) {
        await savedServicesApi.removeSavedService(serviceId);
      } else {
        await savedServicesApi.addSavedService(serviceId);
      }
      return { serviceId, isSaved: !isSaved };
    },
    onMutate: async ({ serviceId, isSaved }) => {
      patchServiceInCache(queryClient, serviceId, { isSaved: !isSaved });
      patchUnifiedServiceSaved(queryClient, serviceId, !isSaved);
    },
    onError: (_err, { serviceId, isSaved }) => {
      patchServiceInCache(queryClient, serviceId, { isSaved });
      patchUnifiedServiceSaved(queryClient, serviceId, isSaved);
    },
    onSuccess: ({ isSaved }) => {
      if (isSaved) noteEngagement();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['savedServices'] });
    },
  });
}
