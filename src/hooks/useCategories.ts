import { useQuery } from '@tanstack/react-query';
import * as categoriesApi from '../api/categories';
import { queryKeys } from '../api/queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories({}),
    queryFn: () => categoriesApi.listCategories(),
    staleTime: 5 * 60 * 1000,
  });
}
