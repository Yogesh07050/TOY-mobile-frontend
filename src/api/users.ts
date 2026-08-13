import { apiClient } from './client';
import type { ApiSuccess, PreferredLocation, User } from '../types';

export interface UpdateMePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
  preferredLocation?: PreferredLocation | null;
}

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const res = await apiClient.put<ApiSuccess<User>>('/users/me', payload);
  return res.data.data;
}
