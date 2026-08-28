/**
 * Idempotency keys for the actions §51 lists (claim, payment, redeem, create
 * offer, create booking).
 *
 * A key identifies an *intent*, not an attempt: the same key is sent on the
 * first try and on every retry of the same action, which is exactly what lets
 * the server recognise the retry and hand back the original answer instead of
 * doing the work twice (§50).
 *
 * So the key has to be generated at the point the customer decides - the tap -
 * and reused, never regenerated inside a retry loop. `keyFor` exists to make
 * that easy: the same action on the same target produces the same key for as
 * long as the app stays open, and a genuinely new attempt after the previous
 * one settled gets a fresh one via `newKey`.
 */

/**
 * A random key.
 *
 * `crypto.randomUUID` is not available on all React Native runtimes, and
 * pulling in a UUID polyfill for this would be a dependency for four calls.
 * The key only has to be unique per user, and the server scopes it that way -
 * timestamp plus randomness is comfortably enough for that.
 */
export function newKey(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

const active = new Map<string, string>();

/**
 * The key for one in-flight intent, stable across retries.
 *
 * Call `settle(action, id)` once the action has finished - successfully or
 * with an error the customer has acknowledged - so a later, deliberate repeat
 * of the same action is treated as new rather than replaying the old answer.
 */
export function keyFor(action: string, id: number | string): string {
  const slot = `${action}:${id}`;
  let key = active.get(slot);
  if (!key) {
    key = newKey(action);
    active.set(slot, key);
  }
  return key;
}

export function settle(action: string, id: number | string): void {
  active.delete(`${action}:${id}`);
}

/** Header block for a request, ready to spread into an axios config. */
export function idempotencyHeaders(key: string): { headers: Record<string, string> } {
  return { headers: { 'Idempotency-Key': key } };
}
