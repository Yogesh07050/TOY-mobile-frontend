import { apiClient } from './client';
import type { ApiSuccess } from '../types';
import type {
  ServiceAnalyticsOverview,
  ServiceAnalyticsQuery,
  ServiceBranchRow,
  ServiceCategoryInsightRow,
  ServiceCustomerInsights,
  ServiceFunnelStage,
  ServiceLocationRow,
  ServiceOfferPerformanceSplit,
  ServicePerformance,
} from '../types/admin';

export async function getServiceOverview(params: ServiceAnalyticsQuery): Promise<ServiceAnalyticsOverview> {
  const res = await apiClient.get<ApiSuccess<ServiceAnalyticsOverview>>('/service-analytics/overview', { params });
  return res.data.data;
}

export async function getServicePerformance(params: ServiceAnalyticsQuery): Promise<ServicePerformance> {
  const res = await apiClient.get<ApiSuccess<ServicePerformance>>('/service-analytics/performance', { params });
  return res.data.data;
}

export async function getServiceFunnel(params: ServiceAnalyticsQuery): Promise<ServiceFunnelStage[]> {
  const res = await apiClient.get<ApiSuccess<ServiceFunnelStage[]>>('/service-analytics/funnel', { params });
  return res.data.data;
}

export async function getServiceOfferPerformance(params: ServiceAnalyticsQuery): Promise<ServiceOfferPerformanceSplit> {
  const res = await apiClient.get<ApiSuccess<ServiceOfferPerformanceSplit>>('/service-analytics/offer-performance', { params });
  return res.data.data;
}

export async function getServiceBranches(params: ServiceAnalyticsQuery): Promise<ServiceBranchRow[]> {
  const res = await apiClient.get<ApiSuccess<ServiceBranchRow[]>>('/service-analytics/branches', { params });
  return res.data.data;
}

export async function getServiceLocations(params: ServiceAnalyticsQuery): Promise<ServiceLocationRow[]> {
  const res = await apiClient.get<ApiSuccess<ServiceLocationRow[]>>('/service-analytics/locations', { params });
  return res.data.data;
}

export async function getServiceCustomers(params: ServiceAnalyticsQuery): Promise<ServiceCustomerInsights> {
  const res = await apiClient.get<ApiSuccess<ServiceCustomerInsights>>('/service-analytics/customers', { params });
  return res.data.data;
}

export async function getServiceCategoryInsights(params: ServiceAnalyticsQuery): Promise<ServiceCategoryInsightRow[]> {
  const res = await apiClient.get<ApiSuccess<ServiceCategoryInsightRow[]>>('/service-analytics/category-insights', { params });
  return res.data.data;
}
