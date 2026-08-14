import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/config';
import { clearTokens, getTokens, setTokens } from '../services/auth/tokenStorage';
import type { ApiErrorBody, AuthResult } from '../types';
import type { PlanUpgradeRequiredDetails } from '../types/admin';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

apiClient.interceptors.request.use(async (config) => {
  const tokens = await getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return null;
  try {
    const res = await axios.post<{ success: true; data: AuthResult }>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken: tokens.refreshToken },
    );
    const { accessToken, refreshToken } = res.data.data;
    await setTokens({ accessToken, refreshToken });
    return accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    if (status === 401 && original && !original._retry && code !== undefined) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(original);
      }
      onSessionExpired?.();
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const details = body?.error?.details;
    if (Array.isArray(details) && details.length) {
      return details.map((d) => d.message).join('\n');
    }
    if (body?.error?.message) return body.error.message;
    if (error.message === 'Network Error') return 'No internet connection. Please check your network.';
  }
  return fallback;
}

/** Extracts the PLAN_UPGRADE_REQUIRED payload when that's what the request failed with, else null. */
export function getPlanUpgradeDetails(error: unknown): PlanUpgradeRequiredDetails | null {
  if (!axios.isAxiosError(error)) return null;
  const body = error.response?.data as ApiErrorBody | undefined;
  if (body?.error?.code !== 'PLAN_UPGRADE_REQUIRED') return null;
  return (body.error.details as unknown as PlanUpgradeRequiredDetails) ?? null;
}
