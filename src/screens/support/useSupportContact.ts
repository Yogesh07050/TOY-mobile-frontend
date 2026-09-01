import { useQuery } from '@tanstack/react-query';
import { supportApi } from '../../api';
import { queryKeys } from '../../api/queryKeys';
import { SUPPORT_EMAIL, SUPPORT_PHONES } from '../../content/support';

/**
 * The support desk's published email and phone numbers.
 *
 * Fetched rather than hardcoded so the number a customer calls can change
 * without a store release - the same values the website reads. The bundled
 * constants are what the screen shows while the request is in flight and what
 * it keeps if the request fails, because a Support screen showing no way to
 * contact support because a request failed would be the worst possible failure
 * on this particular screen.
 */
export function useSupportContact(): { email: string; phones: string[] } {
  const { data } = useQuery({
    queryKey: queryKeys.supportContact(),
    queryFn: supportApi.getSupportContact,
    // Contact details change about never, so this is fetched once per launch
    // rather than on every screen that shows them.
    staleTime: Infinity,
    retry: 1,
  });

  return {
    email: data?.email || SUPPORT_EMAIL,
    phones: data?.phones?.length ? data.phones : SUPPORT_PHONES,
  };
}
