import {
  postVisibilityEvent,
  postVisibilityEvents,
  type VisibilityEventPayload,
} from '../../api/visibility';
import type { FeaturedPlacement, RankedListing, VisibilitySurface } from '../../types';

/**
 * Visibility event tracking (§32).
 *
 * Separate from `analyticsService` because the two streams answer different
 * questions. That one asks "how is this shop doing"; this one asks "where was
 * this listing shown, in what position, under which campaign, and did the
 * customer act on it" - which needs surface, placement and rank on every row,
 * and feeds ranking as well as reporting.
 *
 * ## Why impressions are batched and deduplicated
 *
 * A scrolling rail fires an impression for every card that crosses the fold,
 * and a customer who scrolls back up crosses the same cards again. Posting each
 * one immediately would be dozens of requests per screen, and counting the
 * re-crossings would inflate every merchant's reach figures with the same
 * person looking twice.
 *
 * So impressions are queued, flushed on a timer, and deduplicated per surface
 * for the life of the screen: the first time a card is seen counts, and
 * scrolling past it again does not.
 */

const FLUSH_INTERVAL_MS = 4000;
const MAX_BATCH_SIZE = 50;

let queue: VisibilityEventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Cards already counted, keyed by scope + listing.
 *
 * Module-level rather than per-component on purpose. A ref inside the hook is
 * reset every time the component remounts, and a customer opening an offer and
 * pressing back remounts the whole screen - which counted every card on it a
 * second time and inflated the merchant's reach for doing nothing.
 *
 * A *scope* rather than a surface: one screen can track two lists on the same
 * surface (a featured rail and the organic feed beneath it), and clearing by
 * surface let each one wipe the other's record and re-report it.
 */
const seen = new Set<string>();

/**
 * A stable identity for one served list.
 *
 * Used by the hook as a render-loop guard - "are these the same cards I already
 * handed to the tracker?" - not as the dedupe itself. The dedupe is `seen`,
 * which is per listing.
 */
export function signatureOf(items: (RankedListing | FeaturedPlacement)[]): string {
  return items.map((item) => `${item.featured ? 'f' : 'o'}${item.id}`).join(',');
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => void flush(), FLUSH_INTERVAL_MS);
}

async function flush(): Promise<void> {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH_SIZE);
  try {
    if (batch.length === 1) await postVisibilityEvent(batch[0]);
    else await postVisibilityEvents(batch);
  } catch {
    // Non-fatal by design. A dropped batch costs one screen's worth of
    // analytics; retrying indefinitely would keep a failing request alive
    // behind a customer who has already moved on.
  }
  if (queue.length > 0) scheduleFlush();
}

/** Queues one client-postable event (§32). */
export function trackVisibility(payload: VisibilityEventPayload): void {
  queue.push(payload);
  if (queue.length >= MAX_BATCH_SIZE) void flush();
  else scheduleFlush();
}

/** Sends anything queued now - used when a screen loses focus. */
export function flushVisibility(): void {
  void flush();
}

export interface ImpressionContext {
  surface: VisibilitySurface;
  /**
   * Distinguishes two lists on one surface - the featured rail from the
   * organic feed beneath it. Defaults to 'default' for screens with one list.
   */
  group?: string;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  term?: string | null;
}

const scopeOf = (context: ImpressionContext) => `${context.surface}:${context.group ?? 'default'}`;

/**
 * Records that these cards were shown, in this order.
 *
 * Position is the whole point. Without the rank each listing occupied, §15's
 * "average position" is unanswerable and §10's rotation has nothing to prove it
 * worked. It is 1-based and taken from the array order, so it always matches
 * what the customer actually saw.
 *
 * `offset` lets a paginated list report true positions rather than restarting
 * at 1 on every page - a listing on page three is at rank 41, not rank 1, and
 * reporting otherwise would make every merchant's average position flattering
 * and wrong.
 */
export function trackImpressions(
  items: (RankedListing | FeaturedPlacement)[],
  context: ImpressionContext,
  offset = 0,
): void {
  const scope = scopeOf(context);
  items.forEach((item, index) => {
    const key = `${scope}:${item.featured ? 'f' : 'o'}:${item.id}`;
    if (seen.has(key)) return;
    seen.add(key);

    trackVisibility({
      event: item.featured ? 'FEATURED_IMPRESSION' : 'IMPRESSION',
      surface: context.surface,
      placementType: item.featured ? item.placementType : undefined,
      featuredCampaignId: item.featured ? item.featuredCampaignId : undefined,
      slotId: item.featured ? item.slotId : undefined,
      listingType: item.featured ? item.listingType : item.listingType,
      listingId: item.id,
      shopId: item.shop?.id,
      categoryId: item.featured ? (item.categoryId ?? undefined) : (item.category?.id ?? undefined),
      position: offset + index + 1,
      distanceKm: item.featured ? undefined : (item.distanceKm ?? undefined),
      latitude: context.latitude ?? undefined,
      longitude: context.longitude ?? undefined,
      city: context.city ?? undefined,
      term: context.term ?? undefined,
    });
  });
}

/** A card the customer actually opened. */
export function trackListingOpen(
  item: RankedListing | FeaturedPlacement,
  context: ImpressionContext,
  position?: number,
): void {
  // A tap on a promoted card is a FEATURED_CLICK, which is what §17's campaign
  // click-through rate is measured from. A tap on an organic search result is a
  // SEARCH_CLICK. Neither is a VIEW - that is recorded server-side when the
  // detail screen loads the listing, so it cannot be fabricated from a client.
  if (item.featured) {
    trackVisibility({
      event: 'FEATURED_CLICK',
      surface: context.surface,
      placementType: item.placementType,
      featuredCampaignId: item.featuredCampaignId,
      slotId: item.slotId,
      listingType: item.listingType,
      listingId: item.id,
      shopId: item.shop?.id,
      position,
    });
    return;
  }

  if (context.surface === 'SEARCH') {
    trackVisibility({
      event: 'SEARCH_CLICK',
      surface: context.surface,
      listingType: item.listingType,
      listingId: item.id,
      shopId: item.shop?.id,
      position,
      term: context.term ?? undefined,
    });
  }
}

/** A shop profile opened - §15's "profile visits". */
export function trackProfileView(shopId: number): void {
  trackVisibility({ event: 'PROFILE_VIEW', listingType: 'shop', listingId: shopId, shopId });
}

/** Directions tapped, which §2.4 treats as a strong intent signal. */
export function trackDirectionsClick(shopId: number, branchId?: number): void {
  trackVisibility({
    event: 'DIRECTIONS_CLICK',
    listingType: 'shop',
    listingId: shopId,
    shopId,
    branchId,
  });
}

/**
 * Reports the cards a screen just served, counting each listing once.
 *
 * ## Why there is no "the list changed, start again" reset
 *
 * There was one, and it was wrong twice over.
 *
 * A ranked list is re-ranked as its inputs settle: the first render has no
 * coordinates, the next has coarse ones, the next has a fix - and each is a
 * legitimately different ordering of the same few listings. Treating "the list
 * changed" as "these are new impressions" reported the same four offers three
 * times in the first two seconds of a cold start, which would have inflated
 * every merchant's reach by roughly triple.
 *
 * Resetting also cannot tell a re-rank from a remount, so opening an offer and
 * pressing back counted the whole screen again.
 *
 * So the memory is per listing and per scope, and it simply accumulates for the
 * life of the session. A listing the customer has already been shown is not
 * shown "again" because it moved from rank 3 to rank 2. A listing rotation
 * genuinely swapped into the slot (§10) is not in `seen`, so it is counted -
 * which is the case the reset was trying to serve, and this handles it without
 * discarding everything else.
 */
export function trackServedList(
  items: (RankedListing | FeaturedPlacement)[],
  context: ImpressionContext,
  offset = 0,
): void {
  if (!items.length) return;
  // No reset, deliberately. `trackImpressions` skips anything already counted
  // for this scope, and that per-listing memory is the whole dedupe.
  trackImpressions(items, context, offset);
}

/**
 * Forgets what has been counted, for one scope or everywhere.
 *
 * Not called by the normal path - see `trackServedList` for why re-reporting on
 * every re-rank was wrong. It exists for a deliberate "this is a new browsing
 * context" moment, such as a pull-to-refresh, where counting a fresh impression
 * is the honest answer.
 *
 * Scoped by default: clearing a whole surface would let a screen's featured
 * rail wipe the record of the organic feed beside it.
 */
export function resetImpressions(surface?: VisibilitySurface, group?: string): void {
  if (!surface) {
    seen.clear();
    return;
  }
  const prefix = `${surface}:${group ?? 'default'}:`;
  for (const key of [...seen]) {
    if (key.startsWith(prefix)) seen.delete(key);
  }
}
