import { postAnalyticsEvent, postAnalyticsEventsBatch, type AnalyticsEventPayload } from '../../api/analytics';
import { trackOfferEvent, type OfferTrackEvent } from '../../api/offers';
import { trackBannerEvent } from '../../api/discovery';

const FLUSH_INTERVAL_MS = 4000;
const MAX_BATCH_SIZE = 50;

let queue: AnalyticsEventPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
}

async function flush() {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH_SIZE);
  try {
    if (batch.length === 1) {
      await postAnalyticsEvent(batch[0]);
    } else {
      await postAnalyticsEventsBatch(batch);
    }
  } catch {
    // Analytics failures are non-fatal — drop the batch rather than retrying indefinitely.
  }
  if (queue.length > 0) scheduleFlush();
}

/** Queue a client-postable event (OFFER_IMPRESSION, SEARCH, CATEGORY_VIEW, SHOP_VIEW, LOCATION_SEARCH, NEARBY_OFFER_VIEW, BANNER_IMPRESSION). */
export function trackEvent(payload: AnalyticsEventPayload): void {
  queue.push(payload);
  if (queue.length >= MAX_BATCH_SIZE) {
    void flush();
  } else {
    scheduleFlush();
  }
}

/** OFFER_VIEW / OFFER_SHARE are recorded server-side as a side effect of this endpoint, not via trackEvent. */
export function trackOffer(id: number, event: OfferTrackEvent, extra: Record<string, unknown> = {}): void {
  void trackOfferEvent(id, { event, ...extra });
}

/** BANNER_CLICK/impression is recorded via this discovery endpoint, not the generic analytics one. */
export function trackBanner(id: number, event: 'impression' | 'click'): void {
  void trackBannerEvent(id, event);
}
