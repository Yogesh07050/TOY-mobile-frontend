import React, { useEffect, useMemo } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Button, Badge, LoadingView, EmptyState } from '../../components/ui';
import { ReportListingRow } from '../../components/ReportListingRow';
import { useOffer } from '../../hooks/useOffers';
import { useToggleFavorite } from '../../hooks/useFavorites';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { useLocationContext } from '../../services/location/LocationContext';
import { trackOffer } from '../../services/analytics/analyticsService';
import { formatDate, formatDistance, formatExpiryLabel, formatOfferHeadline, isEndingUrgently } from '../../utils/format';
import { offerDeepLink, openDirections } from '../../utils/links';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'OfferDetail'>;

const IMAGE_HEIGHT = 320;

export function OfferDetailScreen({ route, navigation }: Props) {
  const { offerId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();
  const prompt = useAuthPrompt();

  const { data: offer, isLoading, isError } = useOffer(offerId, coords ?? undefined);
  const toggleFavorite = useToggleFavorite();

  useEffect(() => {
    trackOffer(offerId, 'view');
  }, [offerId]);

  const primaryBranch = useMemo(() => {
    if (!offer?.branches?.length) return null;
    return offer.branches.find((b) => b.isPrimary) ?? offer.branches[0];
  }, [offer]);

  if (isLoading) return <LoadingView />;
  if (isError || !offer) {
    return (
      <Screen>
        <EmptyState icon="alert-circle-outline" title="Offer not found" message="This offer may have been removed." />
      </Screen>
    );
  }

  const images = offer.images.length > 0 ? offer.images : offer.imageUrl ? [{ id: 0, url: offer.imageUrl, thumbnailUrl: null, displayOrder: 0 }] : [];
  const expiryLabel = formatExpiryLabel(offer.endDate);
  const urgent = isEndingUrgently(offer.endDate);
  const distanceLabel = formatDistance(offer.distanceKm);
  const screenWidth = Dimensions.get('window').width;

  const onShare = async () => {
    trackOffer(offer.id, 'share');
    await Share.share({
      message: `${formatOfferHeadline(offer)} at ${offer.shop.name} — ${offer.title}\n${offerDeepLink(offer.id)}`,
    });
  };

  // §13: the whole page is public. Only the save needs an account, and asking
  // for it happens over the page rather than instead of it (§5).
  const onToggleSave = () => {
    if (!prompt.require('save-offer', onToggleSave)) return;
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });
  };

  /** §5: "Guest -> Claim Offer -> Login / Sign Up", then the claim continues. */
  const onClaim = () => {
    if (!prompt.require('claim-offer', onClaim)) return;
    navigation.navigate('ClaimConfirmation', { offerId: offer.id });
  };

  const onDirections = () => {
    if (primaryBranch?.latitude && primaryBranch?.longitude) {
      openDirections(primaryBranch.latitude, primaryBranch.longitude, offer.shop.name);
    }
  };

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: IMAGE_HEIGHT }}>
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Image source={{ uri: item.url }} style={{ width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: colors.surfaceAlt }} contentFit="cover" />
              )}
            />
          ) : (
            <View style={{ width: screenWidth, height: IMAGE_HEIGHT, backgroundColor: colors.surfaceAlt }} />
          )}

          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={[styles.backBtn, { top: spacing.sm, left: spacing.md, backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
          <Pressable
            onPress={onToggleSave}
            hitSlop={8}
            style={[styles.backBtn, { top: spacing.sm, right: spacing.md, backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Ionicons name={offer.isFavorite ? 'heart' : 'heart-outline'} size={20} color={offer.isFavorite ? colors.accent : '#fff'} />
          </Pressable>
        </View>

        <View style={{ padding: spacing.md, gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }}>
            <Badge label={formatOfferHeadline(offer)} tone="brand" />
            <Badge label={expired(offer.status) ? 'Expired' : expiryLabel} tone={expired(offer.status) ? 'default' : urgent ? 'danger' : 'warning'} />
            {offer.category ? <Badge label={offer.category.name} /> : null}
          </View>

          <Text style={{ color: colors.text, fontSize: fontSizes.xxl, fontWeight: fontWeights.bold, lineHeight: fontSizes.xxl * 1.25 }}>
            {offer.title}
          </Text>

          <Pressable
            onPress={() => navigation.navigate('ShopDetail', { shopId: offer.shop.id })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
          >
            {offer.shop.logoUrl ? (
              <Image source={{ uri: offer.shop.logoUrl }} style={{ width: 28, height: 28, borderRadius: radii.sm }} />
            ) : (
              <Ionicons name="storefront-outline" size={22} color={colors.textMuted} />
            )}
            <Text style={{ color: colors.brand, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>{offer.shop.name}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.brand} />
          </Pressable>

          {(distanceLabel || primaryBranch?.address) ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
              <Ionicons name="location-outline" size={16} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, flex: 1 }}>
                {[primaryBranch?.address, distanceLabel].filter(Boolean).join(' · ')}
              </Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
            <Button label="Claim Offer" onPress={onClaim} style={{ flex: 1 }} />
            <Button label="Share" variant="secondary" icon={<Ionicons name="share-social-outline" size={16} color={colors.text} />} onPress={onShare} />
          </View>
          {primaryBranch ? (
            <Button label="Get Directions" variant="secondary" fullWidth icon={<Ionicons name="navigate-outline" size={16} color={colors.text} />} onPress={onDirections} />
          ) : null}

          <Divider color={colors.border} />

          {offer.description ? (
            <Section title="Description">
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.5 }}>{offer.description}</Text>
            </Section>
          ) : null}

          <Section title="Validity">
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
            </Text>
          </Section>

          {offer.termsConditions ? (
            <Section title="Terms & Conditions">
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, lineHeight: fontSizes.sm * 1.5 }}>{offer.termsConditions}</Text>
            </Section>
          ) : null}

          {offer.rating.count > 0 ? (
            <Section title="Rating">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
                  {offer.rating.average?.toFixed(1)}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
                  ({offer.rating.count} review{offer.rating.count === 1 ? '' : 's'})
                </Text>
              </View>
            </Section>
          ) : null}

          <Button
            label="View Shop"
            variant="ghost"
            onPress={() => navigation.navigate('ShopDetail', { shopId: offer.shop.id })}
          />

          <ReportListingRow
            kind="offer"
            id={offer.id}
            onReport={(kind, id) => navigation.navigate('HelpSupport', { report: kind, entityId: id })}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function expired(status: string) {
  return status === 'expired' || status === 'deactivated';
}

function Divider({ color }: { color: string }) {
  return <View style={{ height: 1, backgroundColor: color }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, fontSizes, fontWeights } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
