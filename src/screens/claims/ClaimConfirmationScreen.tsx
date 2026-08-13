import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, LoadingView, EmptyState } from '../../components/ui';
import { useOffer } from '../../hooks/useOffers';
import { useClaimOffer } from '../../hooks/useClaims';
import { useLocationContext } from '../../services/location/LocationContext';
import { getApiErrorMessage } from '../../api/client';
import { formatOfferHeadline } from '../../utils/format';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'ClaimConfirmation'>;

export function ClaimConfirmationScreen({ route, navigation }: Props) {
  const { offerId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { coords } = useLocationContext();
  const { data: offer, isLoading } = useOffer(offerId, coords ?? undefined);
  const claimOffer = useClaimOffer();
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <LoadingView />;
  if (!offer) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Offer not found" />
      </Screen>
    );
  }

  const onConfirm = () => {
    setError(null);
    claimOffer.mutate(offerId, {
      onSuccess: (claim) => navigation.replace('ClaimQr', { claim }),
      onError: (err) => setError(getApiErrorMessage(err, 'Could not claim this offer.')),
    });
  };

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.brandLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="pricetag" size={28} color={colors.brandStrong} />
          </View>
          <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
            Claim this offer?
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>{offer.shop.name.toUpperCase()}</Text>
          <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>{offer.title}</Text>
          <Text style={{ color: colors.brand, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>{formatOfferHeadline(offer)}</Text>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center' }}>
          You'll get a claim code to show at the shop to redeem this offer.
        </Text>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm, textAlign: 'center' }}>{error}</Text> : null}

        <Button label="Confirm Claim" onPress={onConfirm} loading={claimOffer.isPending} fullWidth />
        <Button label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}
