import type { AvailableDay, Service, ServiceStatus } from '../types';
import type { BadgeTone } from '../components/ui/Badge';

export function formatServicePriceLabel(service: Pick<Service, 'pricingType' | 'price'>): string {
  if (service.pricingType === 'price_on_enquiry' || service.price === null) return 'Price on enquiry';
  const amount = `₹${service.price.toLocaleString('en-IN')}`;
  return service.pricingType === 'starting_from' ? `From ${amount}` : amount;
}

export function formatServiceOfferChip(service: Pick<Service, 'activeOffer'>): string {
  const offer = service.activeOffer;
  if (!offer) return '';
  if (offer.discountType === 'percentage' && offer.discountValue) {
    return `${offer.discountValue}% OFF`;
  }
  if (offer.discountType === 'flat' && offer.discountValue) {
    return `₹${offer.discountValue.toLocaleString('en-IN')} OFF`;
  }
  return offer.offerText ?? '';
}

export function formatServiceOfferValidity(service: Pick<Service, 'activeOffer'>): string | null {
  const offer = service.activeOffer;
  if (!offer) return null;

  const now = Date.now();
  const end = new Date(offer.endDate).getTime();
  if (end < now) return null;

  const hours = Math.floor((end - now) / 3600000);
  if (hours < 1) return 'Offer ends within the hour';
  if (hours < 24) return `Offer ends in ${hours} hour${hours === 1 ? '' : 's'}`;
  const days = Math.ceil(hours / 24);
  if (days === 1) return 'Offer ends tomorrow';
  if (days <= 30) return `Offer ends in ${days} days`;
  return `Offer valid until ${new Date(offer.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
}

const DAY_LABELS: Record<AvailableDay, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export function formatServiceDays(days: AvailableDay[]): string {
  if (!days.length) return 'Not specified';
  if (days.length === 7) return 'Every day';
  return days.map((day) => DAY_LABELS[day]).join(', ');
}

export function formatServiceTime(time: string | null): string {
  if (!time) return '';
  const [hh, mm] = time.split(':');
  return `${hh}:${mm}`;
}

export const SERVICE_STATUS_TONE: Record<ServiceStatus, BadgeTone> = {
  draft: 'default',
  scheduled: 'info',
  active: 'success',
  paused: 'warning',
  expired: 'warning',
  deactivated: 'danger',
};
