import { apiClient } from './client';
import { getTokens } from '../services/auth/tokenStorage';
import type { ApiSuccess, AuthResult, DeviceSession, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptedTerms: true;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const res = await apiClient.post<ApiSuccess<AuthResult>>('/auth/register', payload);
  return res.data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const res = await apiClient.post<ApiSuccess<AuthResult>>('/auth/login', payload);
  return res.data.data;
}

/**
 * Ends *this* device's session (§25).
 *
 * The refresh token has to be sent explicitly: React Native has no cookie to
 * carry it, and without it the backend cannot tell which device is signing out,
 * so it would end every session on the account (§27, §28).
 */
export async function logout(): Promise<void> {
  const tokens = await getTokens();
  await apiClient.post('/auth/logout', tokens?.refreshToken ? { refreshToken: tokens.refreshToken } : {});
}

export async function forgotPassword(email: string): Promise<{ message: string; delivered: boolean }> {
  const res = await apiClient.post<ApiSuccess<{ message: string; delivered: boolean }>>(
    '/auth/forgot-password',
    { email },
  );
  return res.data.data;
}

export async function resetPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/reset-password', payload);
}

export async function changePassword(payload: {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/change-password', payload);
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post('/auth/verify-email', { token });
}

export async function resendVerification(email: string): Promise<{ message: string; delivered: boolean }> {
  const res = await apiClient.post<ApiSuccess<{ message: string; delivered: boolean }>>(
    '/auth/resend-verification',
    { email },
  );
  return res.data.data;
}

export async function fetchMe(): Promise<User> {
  const res = await apiClient.get<ApiSuccess<User>>('/auth/me');
  return res.data.data;
}

// ---- Device sessions (§28) --------------------------------------------------

export async function fetchSessions(): Promise<DeviceSession[]> {
  const res = await apiClient.get<ApiSuccess<DeviceSession[]>>('/auth/sessions');
  return res.data.data;
}

/** Ends one device's session. The backend refuses ids that are not the caller's. */
export async function revokeSession(sessionId: string): Promise<{ revoked: number }> {
  const res = await apiClient.delete<ApiSuccess<{ revoked: number }>>(`/auth/sessions/${sessionId}`);
  return res.data.data;
}

/** "Log out other devices" - this one stays signed in (§28). */
export async function revokeOtherSessions(): Promise<{ revoked: number }> {
  const res = await apiClient.post<ApiSuccess<{ revoked: number }>>('/auth/sessions/revoke-others');
  return res.data.data;
}
