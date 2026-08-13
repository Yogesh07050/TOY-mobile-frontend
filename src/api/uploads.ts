import { apiClient } from './client';
import type { ApiSuccess, UploadResult } from '../types';

export async function uploadAvatar(fileUri: string, fileName = 'avatar.jpg', mimeType = 'image/jpeg'): Promise<UploadResult> {
  const form = new FormData();
  // React Native's FormData accepts this shape for file fields.
  form.append('image', { uri: fileUri, name: fileName, type: mimeType } as unknown as Blob);

  const res = await apiClient.post<ApiSuccess<UploadResult>>('/uploads/avatars', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
