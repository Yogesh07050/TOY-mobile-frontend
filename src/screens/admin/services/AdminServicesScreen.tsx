import React, { useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Chip, Badge, EmptyState, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useManagedServicesList, useUpdateServiceStatus, useDuplicateService, useDeleteService } from '../../../hooks/useAdminServices';
import { getApiErrorMessage } from '../../../api/client';
import { SERVICE_STATUS_TONE, formatServicePriceLabel } from '../../../utils/serviceFormat';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { ManagedService } from '../../../types/admin';
import type { ServiceStatus } from '../../../types';

type Props = AdminStackScreenProps<'AdminServices'>;

const FILTERS: Array<{ label: string; value: ServiceStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Paused', value: 'paused' },
  { label: 'Draft', value: 'draft' },
  { label: 'Expired', value: 'expired' },
];

function nextStatuses(status: ServiceStatus): ServiceStatus[] {
  switch (status) {
    case 'draft':
      return ['active', 'scheduled'];
    case 'scheduled':
      return ['active', 'deactivated'];
    case 'active':
      return ['paused', 'deactivated'];
    case 'paused':
      return ['active', 'deactivated'];
    case 'expired':
      return ['active'];
    case 'deactivated':
      return ['active'];
    default:
      return [];
  }
}

export function AdminServicesScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { currentShopId, hasPermission } = useShopAdmin();
  const [filter, setFilter] = useState<ServiceStatus | 'all'>('all');
  const services = useManagedServicesList({ shopId: currentShopId ?? undefined, status: filter, limit: 20 });
  const updateStatus = useUpdateServiceStatus();
  const duplicateService = useDuplicateService();
  const deleteService = useDeleteService();

  const items = services.data?.pages.flatMap((p) => p.services) ?? [];
  const canEdit = hasPermission('EDIT_SERVICE');
  const canDelete = hasPermission('DELETE_SERVICE');
  const canCreate = hasPermission('CREATE_SERVICE');
  const canManageOffers = hasPermission('MANAGE_SERVICE_OFFER');
  const canPublish = hasPermission('PUBLISH_SERVICE');

  const onSetStatus = (service: ManagedService, status: ServiceStatus) => {
    updateStatus.mutate({ id: service.id, status }, {
      onError: (err) => Alert.alert('Could not update status', getApiErrorMessage(err)),
    });
  };

  const onDelete = (service: ManagedService) => {
    Alert.alert('Delete service?', `"${service.name}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteService.mutate(service.id, {
            onError: (err) => Alert.alert('Could not delete service', getApiErrorMessage(err)),
          }),
      },
    ]);
  };

  const onDuplicate = (service: ManagedService) => {
    duplicateService.mutate(service.id, {
      onError: (err) => Alert.alert('Could not duplicate service', getApiErrorMessage(err)),
    });
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Services</Text>
        </View>
        {canCreate ? (
          <Pressable onPress={() => navigation.navigate('ServiceForm', undefined)} hitSlop={8}>
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

      {services.isLoading ? (
        <LoadingView />
      ) : items.length === 0 ? (
        <EmptyState icon="briefcase-outline" title="No services here" message="Create your first service to get started." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          onEndReached={() => services.hasNextPage && services.fetchNextPage()}
          renderItem={({ item }) => (
            <View
              style={{
                gap: spacing.xs,
                padding: spacing.sm,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                  style={{ width: 56, height: 56, borderRadius: radii.sm, backgroundColor: colors.surfaceAlt }}
                  contentFit="cover"
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <Badge label={item.status} tone={SERVICE_STATUS_TONE[item.status]} />
                  <Text numberOfLines={1} style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{item.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                    {formatServicePriceLabel(item)} · {item.viewCount} views · {item.saveCount} saves
                  </Text>
                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: 4 }}>
                    {canEdit ? (
                      <Pressable onPress={() => navigation.navigate('ServiceForm', { serviceId: item.id })} hitSlop={6}>
                        <Ionicons name="create-outline" size={18} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                    {canManageOffers ? (
                      <Pressable onPress={() => navigation.navigate('ServiceOffers', { serviceId: item.id })} hitSlop={6}>
                        <Ionicons name="pricetags-outline" size={18} color={colors.textMuted} />
                      </Pressable>
                    ) : null}
                    {canCreate ? (
                      <Pressable onPress={() => onDuplicate(item)} hitSlop={6}>
                        <Ionicons name="copy-outline" size={18} color={colors.textMuted} />
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
              {canPublish && nextStatuses(item.status).length > 0 ? (
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
    </Screen>
  );
}
