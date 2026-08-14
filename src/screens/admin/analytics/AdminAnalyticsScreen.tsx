import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useShopEntitlements } from '../../../hooks/useSubscription';
import type { AdminTabScreenProps } from '../../../navigation/types';
import type { AdminStackParamList } from '../../../navigation/types';

type Props = AdminTabScreenProps<'Analytics'>;

const DASHBOARDS: Array<{
  key: AdminStackParamList['AnalyticsDetail']['dashboard'];
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  feature: string | null;
}> = [
  { key: 'overview', icon: 'trending-up-outline', title: 'Executive Overview', description: 'Reach, conversion, growth at a glance', feature: 'ANALYTICS_ADVANCED' },
  { key: 'offerPerformance', icon: 'stats-chart-outline', title: 'Offer Performance', description: 'Views, saves, claims per offer', feature: 'ANALYTICS_ADVANCED' },
  { key: 'funnel', icon: 'funnel-outline', title: 'Customer Funnel', description: 'Impression → view → save → claim → redeem', feature: 'FUNNEL_BASIC' },
  { key: 'locations', icon: 'location-outline', title: 'Location Intelligence', description: 'Performance by city and area', feature: 'LOCATION_ANALYTICS_ADVANCED' },
  { key: 'branches', icon: 'business-outline', title: 'Branch Performance', description: 'Compare views, claims, redemptions by branch', feature: 'BRANCH_ANALYTICS' },
];

export function AdminAnalyticsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const { currentShopId } = useShopAdmin();
  const entitlements = useShopEntitlements(currentShopId);

  if (entitlements.isLoading) return <LoadingView />;

  const features = entitlements.data?.features ?? [];

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold, padding: spacing.md }}>Analytics</Text>
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            padding: spacing.sm,
            borderRadius: radii.md,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: spacing.xs,
          }}
        >
          <Ionicons name="bar-chart-outline" size={20} color={colors.textMuted} />
          <Text style={{ flex: 1, color: colors.text, fontWeight: fontWeights.semibold }}>Basic Overview</Text>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>Always available</Text>
        </View>

        {DASHBOARDS.map((d) => {
          const unlocked = !d.feature || features.includes(d.feature);
          return (
            <Pressable
              key={d.key}
              onPress={() => navigation.navigate('AnalyticsDetail', { dashboard: d.key })}
              style={[
                shadows.sm,
                { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <View style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: unlocked ? colors.brandLight : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={d.icon} size={18} color={unlocked ? colors.brandStrong : colors.textSubtle} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{d.title}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{d.description}</Text>
              </View>
              {unlocked ? <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} /> : <Ionicons name="lock-closed" size={16} color={colors.textSubtle} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
