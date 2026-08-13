import { apiClient } from './client';
import type { ApiSuccess, AuthResult, User } from '../types';

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

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
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
