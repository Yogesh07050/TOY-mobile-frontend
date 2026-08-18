import React from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Chip, Badge, EmptyState, LoadingView } from '../../../components/ui';
import { useServiceOffersList, useSetServiceOfferStatus, useDeleteServiceOffer } from '../../../hooks/useAdminServiceOffers';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { ServiceOffer, ServiceOfferStatus } from '../../../types';

type Props = AdminStackScreenProps<'ServiceOffers'>;

function offerHeadline(offer: ServiceOffer): string {
  if (offer.offerText) return offer.offerText;
  if (offer.discountType === 'percentage' && offer.discountValue != null) return `${offer.discountValue}% OFF`;
  if (offer.discountType === 'flat' && offer.discountValue != null) return `₹${offer.discountValue} OFF`;
  return 'Special Offer';
}

const STATUS_TONE: Record<ServiceOfferStatus, 'success' | 'info' | 'default' | 'warning' | 'danger'> = {
  active: 'success',
  scheduled: 'info',
  draft: 'default',
  expired: 'warning',
  deactivated: 'danger',
};

function nextStatuses(status: ServiceOfferStatus): ServiceOfferStatus[] {
  switch (status) {
    case 'draft':
      return ['active', 'deactivated'];
    case 'scheduled':
      return ['active', 'deactivated', 'draft'];
    case 'active':
      return ['deactivated'];
    case 'expired':
      return ['active', 'scheduled', 'deactivated'];
    case 'deactivated':
      return ['active', 'scheduled', 'draft'];
    default:
      return [];
  }
}

export function ServiceOffersScreen({ route, navigation }: Props) {
  const { serviceId } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const offers = useServiceOffersList(serviceId, { limit: 50 });
  const setStatus = useSetServiceOfferStatus();
  const deleteOffer = useDeleteServiceOffer();

  const items = offers.data?.pages.flatMap((p) => p.serviceOffers) ?? [];

  const onSetStatus = (offer: ServiceOffer, status: ServiceOfferStatus) => {
    setStatus.mutate({ serviceId, offerId: offer.id, status }, {
      onError: (err) => Alert.alert('Could not update status', getApiErrorMessage(err)),
    });
  };

  const onDelete = (offer: ServiceOffer) => {
    Alert.alert('Delete offer?', 'This offer on the service will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteOffer.mutate({ serviceId, offerId: offer.id }, {
            onError: (err) => Alert.alert('Could not delete offer', getApiErrorMessage(err)),
          }),
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Service Offers</Text>
      </View>

      {offers.isLoading ? (
        <LoadingView />
      ) : items.length === 0 ? (
        <EmptyState icon="pricetags-outline" title="No offers yet" message="Add an offer to promote this service." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl * 2 }}
          onEndReached={() => offers.hasNextPage && offers.fetchNextPage()}
          renderItem={({ item }) => (
            <View style={{ gap: spacing.xs, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                <Badge label={item.status} tone={STATUS_TONE[item.status]} />
                {item.isRecurring ? <Badge label="Recurring" /> : null}
              </View>
              <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{offerHeadline(item)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                {new Date(item.startDate).toLocaleDateString()} – {new Date(item.endDate).toLocaleDateString()} · {item.viewCount} views · {item.claimCount} claims
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                <Pressable onPress={() => navigation.navigate('ServiceOfferForm', { serviceId, offerId: item.id })} hitSlop={6}>
                  <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() => onDelete(item)} hitSlop={6}>
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </Pressable>
              </View>
              {nextStatuses(item.status).length > 0 ? (
                <View style={{ flexDirection: 'row', gap: spacing.xxs, flexWrap: 'wrap' }}>
                  {nextStatuses(item.status).map((status) => (
                    <Chip key={status} label={`Set ${status}`} onPress={() => onSetStatus(item, status)} />
                  ))}
                </View>
              ) : null}
            </View>
          )}
        />
      )}

      <Pressable
        onPress={() => navigation.navigate('ServiceOfferForm', { serviceId })}
        style={[
          shadows.md,
          {
            position: 'absolute',
            right: spacing.md,
            bottom: spacing.md,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.brand,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.textOnBrand} />
      </Pressable>
    </Screen>
  );
}
