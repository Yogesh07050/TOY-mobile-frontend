import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { formatDistance } from '../utils/format';

export interface ShopCardData {
  id: number;
  name: string;
  logoUrl: string | null;
  city?: string | null;
  distanceKm?: number | null;
  activeOfferCount?: number;
  isFollowing?: boolean;
}

interface ShopCardProps {
  shop: ShopCardData;
  onPress: () => void;
}

export function ShopCard({ shop, onPress }: ShopCardProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const distanceLabel = formatDistance(shop.distanceKm);

  return (
    <Pressable
      onPress={onPress}
      style={[
        shadows.sm,
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          padding: spacing.sm,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radii.md,
          backgroundColor: colors.surfaceAlt,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {shop.logoUrl ? (
          <Image source={{ uri: shop.logoUrl }} style={{ width: 48, height: 48 }} contentFit="cover" />
        ) : (
          <Ionicons name="storefront-outline" size={22} color={colors.textSubtle} />
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>
          {shop.name}
        </Text>
        <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
          {[shop.city, distanceLabel].filter(Boolean).join(' · ') || `${shop.activeOfferCount ?? 0} active offers`}
        </Text>
      </View>
      {shop.isFollowing ? (
        <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      )}
    </Pressable>
  );
}
