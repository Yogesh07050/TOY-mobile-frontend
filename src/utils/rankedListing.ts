import type { RankedListing, UnifiedListing } from '../types';

/**
 * Adapts a ranked listing to the shape the existing card renders.
 *
 * The two differ in exactly two fields - `listingType` where the older API says
 * `sourceType`, and a `status` the ranked endpoints do not return because a
 * listing that is not active cannot rank at all (§24).
 *
 * A mapper rather than a second card component: the card carries the save
 * behaviour, the guest auth prompt and the distance formatting, and a parallel
 * copy of it would drift the moment either was touched.
 */
export function toUnifiedListing(listing: RankedListing): UnifiedListing {
  return {
    id: listing.id,
    sourceType: listing.listingType === 'service_offer' ? 'service' : 'product',
    serviceId: listing.serviceId,
    title: listing.title,
    offerText: listing.offerText,
    discountType: listing.discountType,
    discountValue: listing.discountValue,
    originalPrice: listing.originalPrice,
    finalPrice: listing.finalPrice,
    startDate: listing.startDate,
    endDate: listing.endDate,
    // Ranked results are active by definition - §24 keeps anything else out of
    // the candidate pool - so there is nothing to lose in asserting it here.
    status: 'active',
    imageUrl: listing.imageUrl,
    distanceKm: listing.distanceKm,
    isSaved: listing.isSaved,
    latitude: listing.latitude,
    longitude: listing.longitude,
    shop: listing.shop,
    category: listing.category,
  };
}
