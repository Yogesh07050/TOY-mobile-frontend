import React from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, LoadingView } from '../../components/ui';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '../../hooks/useNotifications';
import type { RootStackScreenProps } from '../../navigation/types';
import type { NotificationPreferences } from '../../types';

type Props = RootStackScreenProps<'NotificationPreferences'>;

const ROWS: Array<{ key: keyof NotificationPreferences; label: string; description: string }> = [
  { key: 'nearbyOffers', label: 'Nearby Offers', description: 'Deals near your current location' },
  { key: 'favoriteExpiring', label: 'Saved Offer Expiry', description: 'Reminders before your saved offers end' },
  { key: 'followedShopOffers', label: 'Followed Shop Offers', description: 'New offers from shops you follow' },
  { key: 'followedCategoryOffers', label: 'Followed Category Offers', description: 'New offers in categories you follow' },
  { key: 'offerUpdates', label: 'Recommended Offers', description: 'Personalized offer suggestions' },
  { key: 'adminAnnouncements', label: 'Promotions', description: 'App-wide announcements and promotions' },
  { key: 'emailEnabled', label: 'Email Notifications', description: 'Also receive these updates by email' },
];

export function NotificationPreferencesScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { data: preferences, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();

  if (isLoading || !preferences) return <LoadingView />;

  const setAll = (value: boolean) => {
    const patch = Object.fromEntries(ROWS.map((r) => [r.key, value])) as Partial<NotificationPreferences>;
    update.mutate(patch);
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Notification Preferences</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <Pressable onPress={() => setAll(true)}>
          <Text style={{ color: colors.brand, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>Enable All</Text>
        </Pressable>
        <Pressable onPress={() => setAll(false)}>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>Disable All</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
        {ROWS.map((row) => (
          <View
            key={row.key}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: spacing.sm,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <View style={{ flex: 1, gap: 2, marginRight: spacing.sm }}>
              <Text style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}>{row.label}</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{row.description}</Text>
            </View>
            <Switch
              value={preferences[row.key]}
              onValueChange={(value) => update.mutate({ [row.key]: value })}
              trackColor={{ false: colors.border, true: colors.brand }}
            />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
