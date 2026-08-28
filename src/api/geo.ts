import { apiClient } from './client';
import type { ApiSuccess, GeoPlace } from '../types';

/**
 * Address <-> coordinates for the map picker (V3 §5, §26).
 *
 * Routed through our own API rather than straight at a geocoder: its usage
 * policy is a per-application budget, and an app multiplies every request by
 * its install count. The server also queues and rate-limits these, so web and
 * mobile share one budget and geocode identically (§23).
 */

/** §6 Method 1: the merchant types an address and picks from the answers. */
export async function searchPlaces(query: string, limit = 5): Promise<GeoPlace[]> {
  const res = await apiClient.get<ApiSuccess<GeoPlace[]>>('/geo/search', { params: { q: query, limit } });
  return res.data.data;
}

/** §6 Methods 2 and 3: the pin moved, so the address should follow it (§10). */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeoPlace | null> {
  const res = await apiClient.get<ApiSuccess<GeoPlace | null>>('/geo/reverse', {
    params: { latitude, longitude },
  });
  return res.data.data;
}
