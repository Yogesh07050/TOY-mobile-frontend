import React, { useEffect } from 'react';
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
import { clearBadge } from '../../services/notifications/pushNotifications';
import type { RootStackScreenProps } from '../../navigation/types';
import type { NotificationItem } from '../../types';

type Props = RootStackScreenProps<'Notifications'>;

/**
 * Keyed by the `type` the backend actually sends (see
 * `services/notifications.js`). Anything unmapped falls back to a bell, so a
 * new category added server-side degrades to a generic icon rather than a gap.
 */
const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  FAVORITE_EXPIRING: 'time-outline',
  SAVED_SERVICE_OFFER_EXPIRING: 'briefcase-outline',
  NEW_OFFER_FOLLOWED_SHOP: 'storefront-outline',
  NEW_OFFER_FOLLOWED_CATEGORY: 'grid-outline',
  NEW_OFFER_NEARBY: 'location-outline',
  OFFER_UPDATED: 'sparkles-outline',
  OFFER_DEACTIVATED: 'close-circle-outline',
  OFFER_CLAIMED: 'ticket-outline',
  SERVICE_OFFER_CLAIMED: 'ticket-outline',
  OFFER_REDEEMED: 'checkmark-circle-outline',
  SERVICE_OFFER_REDEEMED: 'checkmark-circle-outline',
  BOOKING_CREATED: 'calendar-outline',
  BOOKING_UPDATED: 'calendar-outline',
  BOOKING_CANCELLED: 'calendar-clear-outline',
  ADMIN_ANNOUNCEMENT: 'megaphone-outline',
  SUBSCRIPTION_BILLING: 'card-outline',
};

export function NotificationsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const list = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const notifications = list.data?.pages.flatMap((p) => p.notifications) ?? [];
  const unreadCount = list.data?.pages[0]?.meta.unread ?? 0;

  // Opening the centre is the moment the unread count stops being true on the
  // lock screen, so the OS badge is cleared here rather than on every fetch.
  useEffect(() => {
    void clearBadge();
  }, []);

  /**
   * The in-app twin of a notification tap (Push §27, §29).
   *
   * Both routes lead to the same screens, but only push travels through the
   * deep link; here the entity is already in hand, so it is navigated
   * directly. `deepLink` is still what decides *whether* there is a
   * destination, keeping the two paths from disagreeing about which
   * notifications are tappable.
   */
  const onPressItem = (item: NotificationItem) => {
    if (!item.isRead) markRead.mutate(item.id);
    if (!item.entityId) return;

    if (item.entityType === 'offer') {
      navigation.navigate('OfferDetail', { offerId: item.entityId });
    } else if (item.entityType === 'service_offer' || item.entityType === 'service') {
      // Backend contract: entityId is the service's own id, not the service_offer id.
      navigation.navigate('ServiceDetail', { serviceId: item.entityId });
    } else if (item.entityType === 'shop') {
      navigation.navigate('ShopDetail', { shopId: item.entityId });
    } else if (item.deepLink) {
      // Claims and bookings reference a record with no screen of its own; the
      // backend points them at the listing instead, so follow what it chose.
      const match = /^offersapp:\/\/(offer|service|shop)\/(\d+)$/.exec(item.deepLink);
      if (!match) return;
      const id = Number(match[2]);
      if (match[1] === 'offer') navigation.navigate('OfferDetail', { offerId: id });
      else if (match[1] === 'service') navigation.navigate('ServiceDetail', { serviceId: id });
      else navigation.navigate('ShopDetail', { shopId: id });
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
