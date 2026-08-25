import type { QueryClient } from '@tanstack/react-query';
import type { UnifiedListing } from '../types';

/**
 * The unified rails ("Offers & Services", Near Me) are fed by their own query
 * keys and their own row shape, so neither `patchOfferInCache` nor
 * `patchServiceInCache` reaches them - which is why a heart tapped there did
 * not fill in, while the same item re-rendered correctly on a plain offer rail.
 *
 * Two details make this more than a missing key:
 *
 * - The saved flag is `isSaved` here, not the `isFavorite` an `Offer` carries.
 * - Products and services share one array but number themselves from different
 *   tables, and a service row is identified by its parent `serviceId` rather
 *   than the `id` that names its service *offer*. Matching on `id` alone would
 *   eventually patch an unrelated product that happens to share the number, so
 *   `sourceType` is always part of the match.
 */
const UNIFIED_QUERY_ROOTS = ['unifiedOffers', 'nearbyListings'];

function patchUnified(
  queryClient: QueryClient,
  matches: (listing: UnifiedListing) => boolean,
  isSaved: boolean,
) {
  for (const root of UNIFIED_QUERY_ROOTS) {
    queryClient.setQueriesData({ queryKey: [root] }, (data: unknown) => {
      if (!Array.isArray(data)) return data;
      let changed = false;
      const next = data.map((item) => {
        const listing = item as UnifiedListing;
        if (!matches(listing) || listing.isSaved === isSaved) return item;
        changed = true;
        return { ...listing, isSaved };
      });
      // Returning the same reference when nothing matched keeps React Query
      // from notifying every subscriber of the other rails on each toggle.
      return changed ? next : data;
    });
  }
}

/** Mirrors an offer's favourite toggle onto the unified rails. */
export function patchUnifiedOfferSaved(queryClient: QueryClient, offerId: number, isSaved: boolean) {
  patchUnified(queryClient, (l) => l.sourceType === 'product' && l.id === offerId, isSaved);
}

/** Mirrors a service's save toggle onto the unified rails. */
export function patchUnifiedServiceSaved(queryClient: QueryClient, serviceId: number, isSaved: boolean) {
  patchUnified(queryClient, (l) => l.sourceType === 'service' && l.serviceId === serviceId, isSaved);
}
