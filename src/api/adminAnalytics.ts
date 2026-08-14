import { apiClient } from './client';
import type { ApiSuccess } from '../types';
import type {
  AnalyticsQuery,
  BranchPerformanceAnalytics,
  FunnelAnalytics,
  LocationAnalytics,
  OfferPerformanceAnalytics,
  OverviewAnalytics,
  PremiumOverview,
} from '../types/admin';

export async function getOverview(params: AnalyticsQuery): Promise<OverviewAnalytics> {
  const res = await apiClient.get<ApiSuccess<OverviewAnalytics>>('/analytics/overview', { params });
  return res.data.data;
}

export async function getPremiumOverview(params: AnalyticsQuery): Promise<PremiumOverview> {
  const res = await apiClient.get<ApiSuccess<PremiumOverview>>('/analytics/premium/overview', { params });
  return res.data.data;
}

export async function getOfferPerformance(params: AnalyticsQuery): Promise<OfferPerformanceAnalytics> {
  const res = await apiClient.get<ApiSuccess<OfferPerformanceAnalytics>>('/analytics/premium/offer-performance', { params });
  return res.data.data;
}

export async function getFunnel(params: AnalyticsQuery): Promise<FunnelAnalytics> {
  const res = await apiClient.get<ApiSuccess<FunnelAnalytics>>('/analytics/premium/funnel', { params });
  return res.data.data;
}

export async function getLocationAnalytics(params: AnalyticsQuery): Promise<LocationAnalytics> {
  const res = await apiClient.get<ApiSuccess<LocationAnalytics>>('/analytics/premium/locations', { params });
  return res.data.data;
}

export async function getBranchPerformance(params: AnalyticsQuery): Promise<BranchPerformanceAnalytics> {
  const res = await apiClient.get<ApiSuccess<BranchPerformanceAnalytics>>('/analytics/premium/branches', { params });
  return res.data.data;
}
