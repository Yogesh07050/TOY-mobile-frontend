import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as serviceOfferClaimsApi from '../api/serviceOfferClaims';

export function useClaimServiceOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceOfferId: number) => serviceOfferClaimsApi.claimServiceOffer(serviceOfferId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['claims'] }),
  });
}
