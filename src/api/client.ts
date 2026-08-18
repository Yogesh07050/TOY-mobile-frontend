import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/config';
import { deviceHeaders } from '../utils/device';
import { clearTokens, getTokens, setTokens } from '../services/auth/tokenStorage';
import type { ApiErrorBody, AuthResult } from '../types';
import type { PlanUpgradeRequiredDetails } from '../types/admin';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  // Names this device in the account's session list (§28).
  headers: { ...deviceHeaders },
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

/**
 * Exchanges the stored refresh token for a fresh pair (§20).
 *
 * The backend rotates on every use (§29), so the *new* refresh token has to be
 * written back before the old one is discarded - dropping it would sign the
 * user out on the next launch, which is exactly what persistent login is meant
 * to prevent.
 *
 * A network failure is deliberately not treated as a rejected token: the
 * session is only cleared when the server actually says the token is invalid.
 */
async function refreshAccessToken(): Promise<string | null> {
  const tokens = await getTokens();
  if (!tokens?.refreshToken) return null;
  try {
    const res = await axios.post<{ success: true; data: AuthResult }>(
      `${API_BASE_URL}/auth/refresh-token`,
      { refreshToken: tokens.refreshToken },
      { headers: { ...deviceHeaders } },
    );
    const { accessToken, refreshToken } = res.data.data;
    await setTokens({ accessToken, refreshToken });
    return accessToken;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    // Offline or server down: keep the token, the next attempt may succeed.
    if (status === undefined) return null;
    await clearTokens();
    return null;
  }
}

/** Refreshes ahead of a request, sharing one in-flight attempt across callers. */
export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;
    const code = error.response?.data?.error?.code;

    // Any 401 on a non-refresh call is worth one silent refresh attempt (§20):
    // the customer should never see the login screen for an expired access
    // token. Only a refresh that the server rejects ends the session.
    const isRefreshCall = original?.url?.includes('/auth/refresh-token');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      const newAccessToken = await refreshSession();
      if (newAccessToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(original);
      }
      // No usable token left - the session really is over (§25, §26).
      if (code !== 'TOKEN_EXPIRED' || !(await getTokens())) onSessionExpired?.();
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
