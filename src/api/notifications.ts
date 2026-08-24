import { apiClient } from './client';
import type {
  ApiListSuccess,
  ApiSuccess,
  NotificationItem,
  NotificationPreferences,
  PaginationMeta,
  PushDevice,
} from '../types';

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

/**
 * Records that the customer tapped this notification (Push §31, OPENED).
 *
 * Distinct from marking it read: read only means the row was seen in the feed,
 * whereas opened means they followed it to its destination. Marks it read too.
 */
export async function markNotificationOpened(id: number): Promise<void> {
  await apiClient.post(`/notifications/${id}/opened`);
}

// ---- Push devices (Push §37) ------------------------------------------------

export interface RegisterPushDevicePayload {
  token: string;
  platform?: string;
  deviceName?: string;
  transport?: 'expo' | 'fcm' | 'apns';
}

export async function registerPushDevice(payload: RegisterPushDevicePayload): Promise<PushDevice> {
  const res = await apiClient.post<ApiSuccess<PushDevice>>('/notifications/devices', payload);
  return res.data.data;
}

/**
 * Stops push to this device. Called on sign-out, so the next account to use
 * the phone does not receive the previous one's notifications.
 */
export async function unregisterPushDevice(token: string): Promise<{ removed: number }> {
  const res = await apiClient.post<ApiSuccess<{ removed: number }>>(
    '/notifications/devices/unregister',
    { token },
  );
  return res.data.data;
}

export async function listPushDevices(): Promise<PushDevice[]> {
  const res = await apiClient.get<ApiSuccess<PushDevice[]>>('/notifications/devices');
  return res.data.data;
}
