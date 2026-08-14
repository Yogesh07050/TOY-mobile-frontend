import React, { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Chip, Badge, EmptyState, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useManagedOffersList, useUpdateOfferStatus, useDeleteOffer } from '../../../hooks/useAdminOffers';
import { toDuplicatePayload } from '../../../api/adminOffers';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminTabScreenProps } from '../../../navigation/types';
import type { ManagedOffer } from '../../../types/admin';
import type { OfferStatus } from '../../../types';

type Props = AdminTabScreenProps<'Offers'>;

const FILTERS: Array<{ label: string; value: OfferStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Draft', value: 'draft' },
  { label: 'Expired', value: 'expired' },
];

const STATUS_TONE: Record<OfferStatus, 'success' | 'info' | 'default' | 'warning' | 'danger'> = {
  active: 'success',
  scheduled: 'info',
  draft: 'default',
  expired: 'warning',
  deactivated: 'danger',
};

export function AdminOffersScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { currentShopId, hasPermission } = useShopAdmin();
  const [filter, setFilter] = useState<OfferStatus | 'all'>('all');
  const offers = useManagedOffersList({ shopId: currentShopId ?? undefined, status: filter, limit: 20 });
  const updateStatus = useUpdateOfferStatus();
  const deleteOffer = useDeleteOffer();

  const items = offers.data?.pages.flatMap((p) => p.offers) ?? [];
  const canEdit = hasPermission('EDIT_OFFER');
  const canDelete = hasPermission('DELETE_OFFER');
  const canCreate = hasPermission('CREATE_OFFER');

  const onTogglePause = (offer: ManagedOffer) => {
    const next: OfferStatus = offer.status === 'deactivated' ? 'active' : 'deactivated';
    updateStatus.mutate({ id: offer.id, status: next });
  };

  const onDelete = (offer: ManagedOffer) => {
    Alert.alert('Delete offer?', `"${offer.title}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteOffer.mutate(offer.id, {
            onError: (err) => Alert.alert('Could not delete offer', getApiErrorMessage(err)),
          }),
      },
    ]);
  };

  const onDuplicate = (offer: ManagedOffer) => {
    navigation.navigate('OfferForm', { duplicateFrom: toDuplicatePayload(offer) });
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Offers</Text>
        {canCreate ? (
          <Pressable onPress={() => navigation.navigate('OfferForm', undefined)} hitSlop={8}>
            <Ionicons name="add-circle" size={26} color={colors.brand} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f.value}
          contentContainerStyle={{ gap: spacing.xs }}
          renderItem={({ item }) => <Chip label={item.label} selected={filter === item.value} onPress={() => setFilter(item.value)} />}
        />
      </View>

      {offers.isLoading ? (
        <LoadingView />
      ) : items.length === 0 ? (
        <EmptyState icon="pricetag-outline" title="No offers here" message="Create your first offer to get started." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          onEndReached={() => offers.hasNextPage && offers.fetchNextPage()}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                style={{ width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.surfaceAlt }}
                contentFit="cover"
              />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                  <Badge label={item.status} tone={STATUS_TONE[item.status]} />
                  {item.isRecurring ? <Badge label="Recurring" /> : null}
                </View>
                <Text numberOfLines={1} style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{item.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                  {item.viewCount} views · {item.favoriteCount} saves
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                  {canEdit ? (
                    <Pressable onPress={() => navigation.navigate('OfferForm', { offerId: item.id })} hitSlop={6}>
                      <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                  {canCreate ? (
                    <Pressable onPress={() => onDuplicate(item)} hitSlop={6}>
                      <Ionicons name="copy-outline" size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                  {canEdit ? (
                    <Pressable onPress={() => onTogglePause(item)} hitSlop={6}>
                      <Ionicons name={item.status === 'deactivated' ? 'play-outline' : 'pause-outline'} size={18} color={colors.textMuted} />
                    </Pressable>
                  ) : null}
                  {canDelete ? (
                    <Pressable onPress={() => onDelete(item)} hitSlop={6}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
