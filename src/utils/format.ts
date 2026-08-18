import type { Offer } from '../types';

export function formatDistance(km: number | null | undefined): string | null {
  if (km == null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatExpiryLabel(endDateIso: string): string {
  const end = new Date(endDateIso).getTime();
  const now = Date.now();
  const diffMs = end - now;
  if (diffMs <= 0) return 'Expired';

  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 1) return `Ends in ${Math.max(1, Math.round(diffMs / 60000))} min`;
  if (diffHours < 24) return `Ends in ${Math.round(diffHours)} hour${Math.round(diffHours) === 1 ? '' : 's'}`;

  const endDate = new Date(endDateIso);
  const nowDate = new Date();
  const isSameDay = endDate.toDateString() === nowDate.toDateString();
  if (isSameDay) return 'Ends today';

  const tomorrow = new Date(nowDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (endDate.toDateString() === tomorrow.toDateString()) return 'Ends tomorrow';

  const diffDays = Math.round(diffHours / 24);
  return `Ends in ${diffDays} days`;
}

export function isEndingUrgently(endDateIso: string, thresholdHours = 6): boolean {
  const diffHours = (new Date(endDateIso).getTime() - Date.now()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= thresholdHours;
}

export function formatOfferHeadline(offer: Pick<Offer, 'offerText' | 'offerType' | 'discountValue' | 'buyQuantity' | 'getQuantity'>): string {
  if (offer.offerText) return offer.offerText;
  if (offer.offerType === 'percentage' && offer.discountValue != null) return `${offer.discountValue}% OFF`;
  if (offer.offerType === 'flat' && offer.discountValue != null) return `₹${offer.discountValue} OFF`;
  if (offer.offerType === 'buy_x_get_y' && offer.buyQuantity && offer.getQuantity) {
    return `Buy ${offer.buyQuantity} Get ${offer.getQuantity}`;
  }
  return 'Special Offer';
}

/** Short, readable date for billing and expiry lines: "16 Aug 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Rupee amount with Indian digit grouping: "₹2,500". */
export function formatRupees(amount: number): string {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}
