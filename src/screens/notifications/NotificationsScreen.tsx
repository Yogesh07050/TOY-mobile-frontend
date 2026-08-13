import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, EmptyState, LoadingView } from '../../components/ui';
import {
  useNotificationsList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import type { MainTabScreenProps } from '../../navigation/types';
import type { NotificationItem } from '../../types';

type Props = MainTabScreenProps<'Notifications'>;

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  offer_ending: 'time-outline',
  new_offer: 'pricetag-outline',
  nearby_offer: 'location-outline',
  claim_reminder: 'ticket-outline',
  offer_redeemed: 'checkmark-circle-outline',
  category_offer: 'grid-outline',
  recommended: 'sparkles-outline',
};

export function NotificationsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const list = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = list.data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = list.data?.pages[0]?.meta.unread ?? 0;

  const onPressItem = (item: NotificationItem) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (item.entityType === 'offer' && item.entityId) {
      navigation.navigate('OfferDetail', { offerId: item.entityId });
    } else if (item.entityType === 'shop' && item.entityId) {
      navigation.navigate('ShopDetail', { shopId: item.entityId });
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Notifications</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {unreadCount > 0 ? (
            <Pressable onPress={() => markAllRead.mutate()}>
              <Text style={{ color: colors.brand, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>Mark all read</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => navigation.navigate('NotificationPreferences')} hitSlop={8}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {list.isLoading ? (
        <LoadingView />
      ) : notifications.length === 0 ? (
        <EmptyState icon="notifications-outline" title="No notifications yet" message="We'll let you know about offers, expiries, and more." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.xl }}
          onEndReached={() => list.hasNextPage && list.fetchNextPage()}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onPressItem(item)}
              onLongPress={() => deleteNotification.mutate(item.id)}
              style={{
                flexDirection: 'row',
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radii.md,
                backgroundColor: item.isRead ? colors.surface : colors.brandTint,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: colors.brandLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={TYPE_ICONS[item.type] ?? 'notifications-outline'} size={18} color={colors.brandStrong} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>{item.title}</Text>
                {item.message ? <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{item.message}</Text> : null}
                <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
              {!item.isRead ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand, marginTop: 4 }} /> : null}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
