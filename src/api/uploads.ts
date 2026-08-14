import { apiClient } from './client';
import type { ApiSuccess, UploadResult } from '../types';

type UploadType = 'offers' | 'shops' | 'categories' | 'banners' | 'avatars';

async function uploadImage(type: UploadType, fileUri: string, fileName: string, mimeType: string): Promise<UploadResult> {
  const form = new FormData();
  // React Native's FormData accepts this shape for file fields.
  form.append('image', { uri: fileUri, name: fileName, type: mimeType } as unknown as Blob);

  const res = await apiClient.post<ApiSuccess<UploadResult>>(`/uploads/${type}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function uploadAvatar(fileUri: string, fileName = 'avatar.jpg', mimeType = 'image/jpeg'): Promise<UploadResult> {
  return uploadImage('avatars', fileUri, fileName, mimeType);
}

export async function uploadOfferImage(fileUri: string, fileName = 'offer.jpg', mimeType = 'image/jpeg'): Promise<UploadResult> {
  return uploadImage('offers', fileUri, fileName, mimeType);
}

export async function uploadBannerImage(fileUri: string, fileName = 'banner.jpg', mimeType = 'image/jpeg'): Promise<UploadResult> {
  return uploadImage('banners', fileUri, fileName, mimeType);
}
