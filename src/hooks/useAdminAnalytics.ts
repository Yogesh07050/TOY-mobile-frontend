import { useQuery } from '@tanstack/react-query';
import * as adminAnalyticsApi from '../api/adminAnalytics';
import type { AnalyticsQuery } from '../types/admin';

export function useOverviewAnalytics(params: AnalyticsQuery) {
  return useQuery({
    queryKey: ['analyticsOverview', params],
    queryFn: () => adminAnalyticsApi.getOverview(params),
    enabled: !!params.shopId,
  });
}

export function usePremiumOverview(params: AnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['premiumOverview', params],
    queryFn: () => adminAnalyticsApi.getPremiumOverview(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useOfferPerformance(params: AnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['offerPerformance', params],
    queryFn: () => adminAnalyticsApi.getOfferPerformance(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useFunnelAnalytics(params: AnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['funnelAnalytics', params],
    queryFn: () => adminAnalyticsApi.getFunnel(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useLocationAnalytics(params: AnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['locationAnalytics', params],
    queryFn: () => adminAnalyticsApi.getLocationAnalytics(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useBranchPerformance(params: AnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['branchPerformance', params],
    queryFn: () => adminAnalyticsApi.getBranchPerformance(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}
