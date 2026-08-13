import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as followingApi from '../api/following';
import { queryKeys } from '../api/queryKeys';

export function useFollowedShops() {
  return useQuery({ queryKey: queryKeys.followedShops(), queryFn: followingApi.listFollowedShops });
}

export function useFollowedCategories() {
  return useQuery({ queryKey: queryKeys.followedCategories(), queryFn: followingApi.listFollowedCategories });
}

export function useToggleShopFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shopId, isFollowing }: { shopId: number; isFollowing: boolean }) => {
      if (isFollowing) await followingApi.unfollowShop(shopId);
      else await followingApi.followShop(shopId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['followedShops'] });
      queryClient.invalidateQueries({ queryKey: ['shop'] });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}

export function useToggleCategoryFollow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ categoryId, isFollowing }: { categoryId: number; isFollowing: boolean }) => {
      if (isFollowing) await followingApi.unfollowCategory(categoryId);
      else await followingApi.followCategory(categoryId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['followedCategories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
