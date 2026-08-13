import { apiClient } from './client';
import type { ApiListSuccess, ApiSuccess, NotificationItem, NotificationPreferences, PaginationMeta } from '../types';

export async function listNotifications(params: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
} = {}): Promise<{ notifications: NotificationItem[]; meta: PaginationMeta }> {
  const res = await apiClient.get<ApiListSuccess<NotificationItem>>('/notifications', { params });
  return { notifications: res.data.data, meta: res.data.meta };
}

export async function markNotificationRead(id: number): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const res = await apiClient.patch<ApiSuccess<{ updated: number }>>('/notifications/read-all');
  return res.data.data;
}

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/notifications/${id}`);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await apiClient.get<ApiSuccess<NotificationPreferences>>('/notifications/preferences');
  return res.data.data;
}

export async function updateNotificationPreferences(
  payload: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  const res = await apiClient.put<ApiSuccess<NotificationPreferences>>('/notifications/preferences', payload);
  return res.data.data;
}
