import React from 'react';
import { Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../../theme';
import { Screen, Button, Badge } from '../../components/ui';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'ClaimQr'>;

export function ClaimQrScreen({ route, navigation }: Props) {
  const params = route.params;
  const claim = 'claim' in params ? params.claim : null;
  const serviceClaim = 'serviceClaim' in params ? params.serviceClaim : null;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  const headline = claim ? claim.offer.offerText ?? claim.offer.title : serviceClaim!.serviceOffer.offerText ?? serviceClaim!.service.name;
  const shopName = claim ? claim.shop.name : serviceClaim!.shop.name;
  const code = claim ? claim.code : serviceClaim!.code;
  const status = claim ? claim.status : serviceClaim!.status;

  return (
    <Screen>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textTransform: 'uppercase', fontWeight: fontWeights.semibold }}>
          Your Offer
        </Text>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, textAlign: 'center' }}>
          {headline}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, marginBottom: spacing.sm }}>{shopName}</Text>

        <View
          style={{
            backgroundColor: '#ffffff',
            padding: spacing.md,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <QRCode value={code} size={200} backgroundColor="#ffffff" color="#14110d" />
        </View>

        <View style={{ alignItems: 'center', gap: spacing.xxs, marginTop: spacing.sm }}>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>Claim Code</Text>
          <Text style={{ color: colors.text, fontSize: fontSizes.display, fontWeight: fontWeights.black, letterSpacing: 4 }}>
            {code}
          </Text>
        </View>

        <Badge label={status === 'redeemed' ? 'Redeemed' : 'Claimed'} tone={status === 'redeemed' ? 'success' : 'brand'} />

        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, textAlign: 'center', marginTop: spacing.xs }}>
          Show this code at the shop to redeem your offer.
        </Text>

        <Button label="Done" onPress={() => navigation.popToTop()} fullWidth style={{ marginTop: spacing.lg }} />
      </View>
    </Screen>
  );
}
