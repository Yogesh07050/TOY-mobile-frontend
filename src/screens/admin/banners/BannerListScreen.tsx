import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Badge, EmptyState, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useAdminBannersList } from '../../../hooks/useAdminBanners';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { BannerStatus } from '../../../types/admin';

type Props = AdminStackScreenProps<'BannerList'>;

const STATUS_TONE: Record<BannerStatus, 'success' | 'info' | 'default' | 'warning' | 'danger'> = {
  published: 'success',
  scheduled: 'info',
  draft: 'default',
  expired: 'warning',
  deactivated: 'danger',
};

export function BannerListScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { currentShopId, hasPermission } = useShopAdmin();
  const banners = useAdminBannersList({ shopId: currentShopId ?? undefined, limit: 20 });
  const canCreate = hasPermission('CREATE_BANNER');
  const items = banners.data?.pages.flatMap((p) => p.banners) ?? [];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Banners</Text>
        </View>
        {canCreate ? (
          <Pressable onPress={() => navigation.navigate('BannerForm', undefined)} hitSlop={8}>
            <Ionicons name="add-circle" size={26} color={colors.brand} />
          </Pressable>
        ) : null}
      </View>

      {banners.isLoading ? (
        <LoadingView />
      ) : items.length === 0 ? (
        <EmptyState icon="image-outline" title="No banners yet" message="Feature an offer to reach more customers." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('BannerForm', { bannerId: item.id })}
              style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Image source={item.mobileImageUrl || item.imageUrl ? { uri: item.mobileImageUrl ?? item.imageUrl ?? undefined } : undefined} style={{ width: 64, height: 48, borderRadius: 8, backgroundColor: colors.surfaceAlt }} contentFit="cover" />
              <View style={{ flex: 1, gap: 4 }}>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
                <Text numberOfLines={1} style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{item.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{item.impressionCount} impressions · {item.clickCount} clicks</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
