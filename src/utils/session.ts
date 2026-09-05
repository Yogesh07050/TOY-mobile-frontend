import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Identity for visibility events (Visibility §18, §25, §32).
 *
 * The frequency caps in §18 are worded "per customer/session", and §25 needs to
 * recognise that fifty impressions came from one device. Neither is answerable
 * for a signed-out visitor unless the client says who it is — and a guest has
 * no user id at all.
 *
 * So two values travel on every request:
 *
 *   device id   stable for the life of the install. Answers "is this the same
 *               phone as yesterday?", which is what an anti-manipulation sweep
 *               over a 24-hour window needs.
 *   session id  new on every app launch. Answers "how often has this person
 *               been shown this offer *this session*", which is what stops the
 *               same promotion filling one browsing session.
 *
 * ## What these deliberately are not
 *
 * Neither is a credential, and neither identifies a person. The backend stores
 * both as salted hashes it cannot reverse, and uses them only to compare rows
 * inside a window. A guest who reinstalls is a new device, which is the correct
 * outcome: the caps exist to stop *fatigue*, and a fresh install is a fresh
 * start.
 *
 * IP is deliberately not the fallback. Capping by IP caps a whole household or
 * office together, which is a worse failure than not capping a visitor whose
 * storage is unavailable.
 */

const DEVICE_ID_KEY = 'visibilityDeviceId';

/**
 * A random 32-char id. `crypto.randomUUID` is not guaranteed on every RN
 * runtime, and this value never needs to be unguessable — only unique enough
 * that two installs do not collide.
 */
function randomId(): string {
  let id = '';
  while (id.length < 32) id += Math.random().toString(36).slice(2);
  return id.slice(0, 32);
}

/** New on every launch: the module is evaluated once per app process. */
const sessionId = randomId();

let deviceId: string | null = null;
let loading: Promise<string> | null = null;

/**
 * The stable per-install id, read once and cached.
 *
 * Storage failures fall back to a fresh in-memory id rather than throwing. A
 * device whose storage is unavailable should still be capped for the length of
 * its session; refusing to identify it at all would exempt it from §18
 * entirely, which is the opposite of what a failure here should cause.
 */
export async function getDeviceId(): Promise<string> {
  if (deviceId) return deviceId;
  if (loading) return loading;

  loading = (async () => {
    try {
      const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (stored) return stored;
      const created = randomId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, created);
      return created;
    } catch {
      return randomId();
    }
  })()
    .then((value) => {
      deviceId = value;
      return value;
    })
    .finally(() => {
      loading = null;
    });

  return loading;
}

export function getSessionId(): string {
  return sessionId;
}

/**
 * The headers the API reads. Async because the device id may still be coming
 * out of storage on the very first request of a cold start.
 */
export async function visibilityHeaders(): Promise<Record<string, string>> {
  return {
    'X-Session-Id': sessionId,
    'X-Device-Id': await getDeviceId(),
  };
}

/** Warms the cache at boot so the first request does not wait on storage. */
export function primeSessionIdentity(): void {
  void getDeviceId();
}
