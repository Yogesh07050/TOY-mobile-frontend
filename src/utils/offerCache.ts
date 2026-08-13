import type { QueryClient } from '@tanstack/react-query';
import type { Offer } from '../types';

const OFFER_QUERY_ROOTS = ['offers', 'favorites', 'endingSoon', 'nearby', 'recommended', 'offer'];

function patchOffer(offer: Offer, offerId: number, patch: Partial<Offer>): Offer {
  return offer.id === offerId ? { ...offer, ...patch } : offer;
}

/** Patches every cached copy of an offer (list pages, discovery rails, and the detail query) so a favorite toggle reflects everywhere instantly. */
export function patchOfferInCache(queryClient: QueryClient, offerId: number, patch: Partial<Offer>) {
  for (const root of OFFER_QUERY_ROOTS) {
    queryClient.setQueriesData({ queryKey: [root] }, (data: unknown) => {
      if (!data) return data;

      // Single offer detail query.
      if (typeof data === 'object' && data !== null && 'id' in data && (data as Offer).id === offerId) {
        return { ...(data as Offer), ...patch };
      }

      // Plain array (discovery rails).
      if (Array.isArray(data)) {
        return data.map((item) => (item?.id === offerId ? patchOffer(item as Offer, offerId, patch) : item));
      }

      // Infinite query shape: { pages: [{ offers, meta }], pageParams }
      if (typeof data === 'object' && data !== null && 'pages' in data) {
        const infinite = data as { pages: Array<{ offers: Offer[]; meta: unknown }>; pageParams: unknown[] };
        return {
          ...infinite,
          pages: infinite.pages.map((page) => ({
            ...page,
            offers: page.offers?.map((offer) => patchOffer(offer, offerId, patch)) ?? page.offers,
          })),
        };
      }

      return data;
    });
  }
}
