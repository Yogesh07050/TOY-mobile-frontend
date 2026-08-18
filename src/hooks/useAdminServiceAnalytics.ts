import { useQuery } from '@tanstack/react-query';
import * as adminServiceAnalyticsApi from '../api/adminServiceAnalytics';
import type { ServiceAnalyticsQuery } from '../types/admin';

export function useServiceOverview(params: ServiceAnalyticsQuery) {
  return useQuery({
    queryKey: ['serviceAnalyticsOverview', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceOverview(params),
    enabled: !!params.shopId,
  });
}

export function useServicePerformance(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['servicePerformance', params],
    queryFn: () => adminServiceAnalyticsApi.getServicePerformance(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceFunnel(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceFunnel', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceFunnel(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceOfferPerformance(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceOfferPerformance', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceOfferPerformance(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceBranches(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceBranches', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceBranches(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceLocations(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceLocations', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceLocations(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceCustomers(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceCustomers', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceCustomers(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}

export function useServiceCategoryInsights(params: ServiceAnalyticsQuery, enabled: boolean) {
  return useQuery({
    queryKey: ['serviceCategoryInsights', params],
    queryFn: () => adminServiceAnalyticsApi.getServiceCategoryInsights(params),
    enabled: enabled && !!params.shopId,
    retry: false,
  });
}
