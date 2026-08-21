import React from 'react';
import { Dimensions, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../theme';
import { Screen, Button, Badge, LoadingView, EmptyState } from '../../components/ui';
import { OfferRail } from '../../components';
import { useShop } from '../../hooks/useShops';
import { useOffersList } from '../../hooks/useOffers';
import { useToggleFavorite } from '../../hooks/useFavorites';
import { useToggleShopFollow } from '../../hooks/useFollowing';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { useLocationContext } from '../../services/location/LocationContext';
import { formatDistance } from '../../utils/format';
import { shopDeepLink, openDirections } from '../../utils/links';
import type { RootStackScreenProps } from '../../navigation/types';
import type { Offer } from '../../types';

type Props = RootStackScreenProps<'ShopDetail'>;

export function ShopDetailScreen({ route, navigation }: Props) {
  const { shopId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { coords } = useLocationContext();
  const queryClient = useQueryClient();
  const prompt = useAuthPrompt();
  const screenWidth = Dimensions.get('window').width;

  const { data: shop, isLoading, isError } = useShop(shopId, coords ?? undefined);
  const offers = useOffersList({ shopId: typeof shopId === 'number' ? shopId : undefined, shop: typeof shopId === 'string' ? shopId : undefined, sort: 'newest', limit: 10 });
  const toggleFavorite = useToggleFavorite();
  const toggleFollow = useToggleShopFollow();

  if (isLoading) return <LoadingView />;
  if (isError || !shop) {
    return (
      <Screen>
        <EmptyState icon="storefront-outline" title="Shop not found" />
      </Screen>
    );
  }

  const distanceLabel = formatDistance(shop.distanceKm);
  const nearestBranch = [...shop.branches].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))[0];

  const onShare = async () => {
    await Share.share({ message: `${shop.name} on OffersOffer\n${shopDeepLink(shop.id)}` });
  };
  const onToggleSave = (offer: Offer) => {
    if (!prompt.require('save-offer', () => onToggleSave(offer))) return;
    toggleFavorite.mutate({ offerId: offer.id, isFavorite: offer.isFavorite }, {
      onSettled: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
    });
  };

  /** §15: "Following a shop requires authentication" - the rest of the page does not. */
  const onToggleFollow = () => {
    if (!prompt.require('follow-shop', onToggleFollow)) return;
    toggleFollow.mutate({ shopId: shop.id, isFollowing: !!shop.isFollowing });
  };

  const offerList = offers.data?.pages.flatMap((p) => p.offers) ?? [];

  return (
    <Screen edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ height: 160, backgroundColor: colors.surfaceAlt }}>
          {shop.coverUrl ? <Image source={{ uri: shop.coverUrl }} style={{ width: screenWidth, height: 160 }} contentFit="cover" /> : null}
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={[styles.backBtn, { top: spacing.sm, left: spacing.md, backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: spacing.md, marginTop: -32, gap: spacing.sm }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: radii.md,
              backgroundColor: colors.surface,
              borderWidth: 3,
              borderColor: colors.page,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {shop.logoUrl ? (
              <Image source={{ uri: shop.logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Ionicons name="storefront-outline" size={30} color={colors.textSubtle} />
            )}
          </View>

          <Text style={{ color: colors.text, fontSize: fontSizes.xxl, fontWeight: fontWeights.bold }}>{shop.name}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xxs }}>
            {shop.categories.map((c) => (
              <Badge key={c.id} label={c.name} />
            ))}
            {distanceLabel ? <Badge label={distanceLabel} tone="info" /> : null}
          </View>

          {shop.description ? (
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, lineHeight: fontSizes.md * 1.5 }}>{shop.description}</Text>
          ) : null}

          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Button
              label={shop.isFollowing ? 'Following' : 'Save Shop'}
              variant={shop.isFollowing ? 'secondary' : 'primary'}
              icon={<Ionicons name={shop.isFollowing ? 'checkmark' : 'heart-outline'} size={16} color={shop.isFollowing ? colors.text : colors.textOnBrand} />}
              onPress={onToggleFollow}
              style={{ flex: 1 }}
            />
            <Button label="Share" variant="secondary" icon={<Ionicons name="share-social-outline" size={16} color={colors.text} />} onPress={onShare} />
            {nearestBranch?.latitude && nearestBranch?.longitude ? (
              <Button
                label="Directions"
                variant="secondary"
                icon={<Ionicons name="navigate-outline" size={16} color={colors.text} />}
                onPress={() => openDirections(nearestBranch.latitude!, nearestBranch.longitude!, shop.name)}
              />
            ) : null}
          </View>
        </View>

        <View style={{ height: spacing.lg }} />

        <OfferRail title="Active Offers" offers={offerList} loading={offers.isLoading} onOfferPress={(o) => navigation.navigate('OfferDetail', { offerId: o.id })} onToggleSave={onToggleSave} emptyMessage="No active offers right now." />

        {shop.branches.length > 0 ? (
          <View style={{ paddingHorizontal: spacing.md, gap: spacing.xs, marginBottom: spacing.xxl }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold, marginBottom: spacing.xxs }}>
              Branches
            </Text>
            {shop.branches.map((branch) => (
              <View
                key={branch.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  padding: spacing.sm,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
                    {branch.branchName}
                    {branch.isPrimary ? '  ·  Primary' : ''}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                    {[branch.address, formatDistance(branch.distanceKm)].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {branch.latitude && branch.longitude ? (
                  <Pressable onPress={() => openDirections(branch.latitude!, branch.longitude!, branch.branchName)} hitSlop={8}>
                    <Ionicons name="navigate-outline" size={18} color={colors.brand} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
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
