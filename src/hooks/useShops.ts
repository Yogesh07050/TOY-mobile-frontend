import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import * as shopsApi from '../api/shops';
import { queryKeys } from '../api/queryKeys';
import type { ListShopsParams } from '../api/shops';

export function useShopsList(params: ListShopsParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.shops(params),
    queryFn: ({ pageParam }) => shopsApi.listShops({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined),
  });
}

export function useShop(idOrSlug: number | string | undefined, coords?: { latitude?: number; longitude?: number }) {
  return useQuery({
    queryKey: queryKeys.shop(idOrSlug ?? -1),
    queryFn: () => shopsApi.getShop(idOrSlug as number | string, coords),
    enabled: idOrSlug != null,
  });
}
