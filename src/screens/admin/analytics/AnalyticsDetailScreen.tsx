import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, LoadingView } from '../../../components/ui';
import { MetricCard } from '../../../components/admin';
import { UpgradePrompt } from '../../../components/UpgradePrompt';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useShopEntitlements } from '../../../hooks/useSubscription';
import {
  usePremiumOverview,
  useOfferPerformance,
  useFunnelAnalytics,
  useLocationAnalytics,
  useBranchPerformance,
} from '../../../hooks/useAdminAnalytics';
import { getPlanUpgradeDetails } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';

type Props = AdminStackScreenProps<'AnalyticsDetail'>;

const TITLES: Record<Props['route']['params']['dashboard'], string> = {
  overview: 'Executive Overview',
  offerPerformance: 'Offer Performance',
  funnel: 'Customer Funnel',
  locations: 'Location Intelligence',
  branches: 'Branch Performance',
};

function formatKpiValue(value: number, format: string): string {
  if (format === 'percent') return `${value.toFixed(1)}%`;
  return String(value);
}

export function AnalyticsDetailScreen({ route, navigation }: Props) {
  const { dashboard } = route.params;
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { currentShopId } = useShopAdmin();
  const entitlements = useShopEntitlements(currentShopId);

  const params = { shopId: currentShopId ?? undefined, preset: 'last30' as const };
  const overview = usePremiumOverview(params, dashboard === 'overview');
  const offerPerf = useOfferPerformance(params, dashboard === 'offerPerformance');
  const funnel = useFunnelAnalytics(params, dashboard === 'funnel');
  const locations = useLocationAnalytics(params, dashboard === 'locations');
  const branches = useBranchPerformance(params, dashboard === 'branches');

  const active = { overview, offerPerformance: offerPerf, funnel, locations, branches }[dashboard];
  const upgrade = getPlanUpgradeDetails(active.error);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>{TITLES[dashboard]}</Text>
      </View>

      {active.isLoading || entitlements.isLoading ? (
        <LoadingView />
      ) : upgrade ? (
        <UpgradePrompt details={upgrade} onViewPlan={() => navigation.navigate('Subscription')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}>
          {dashboard === 'overview' && overview.data ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {overview.data.kpis.map((kpi) => (
                  <MetricCard
                    key={kpi.key}
                    width="47%"
                    label={kpi.label}
                    value={formatKpiValue(kpi.value, kpi.format)}
                    tone={kpi.trend === 'up' ? 'success' : kpi.trend === 'down' ? 'warning' : 'default'}
                  />
                ))}
              </View>
              {overview.data.alerts.map((alert) => (
                <View key={alert.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}>
                  <Text style={{ fontSize: 18 }}>{alert.icon}</Text>
                  <Text style={{ color: colors.text, flex: 1, fontSize: fontSizes.sm }}>{alert.message}</Text>
                </View>
              ))}
            </>
          ) : null}

          {dashboard === 'offerPerformance' && offerPerf.data ? (
            <>
              {offerPerf.data.offers.map((o) => (
                <View key={o.id} style={{ padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 }}>
                  <Text numberOfLines={1} style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{o.title}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                    {o.impressions} impressions · {o.views} views · {o.saves} saves · {o.claims} claims · {o.redemptions} redemptions
                  </Text>
                  <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{o.rates.viewToRedemption.toFixed(1)}% view → redemption</Text>
                </View>
              ))}
              {offerPerf.data.offers.length === 0 ? <Text style={{ color: colors.textMuted }}>No offer data yet for this period.</Text> : null}
            </>
          ) : null}

          {dashboard === 'funnel' && funnel.data ? (
            funnel.data.stages.map((stage, i) => (
              <View key={stage.key} style={{ padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                  {i + 1}. {stage.label}
                </Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{stage.value}</Text>
                  {stage.conversion != null ? (
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{stage.conversion.toFixed(1)}%</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : null}

          {dashboard === 'locations' && locations.data ? (
            locations.data.locations.map((loc) => (
              <View key={loc.city} style={{ padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{loc.city}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                  {loc.views} views · {loc.customers} customers · {loc.conversion.toFixed(1)}% conv.
                </Text>
              </View>
            ))
          ) : null}

          {dashboard === 'branches' && branches.data ? (
            branches.data.branches.map((b) => (
              <View key={b.id} style={{ padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 }}>
                <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                  {b.branchName}{b.isPrimary ? '  ·  Primary' : ''}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                  {b.views} views · {b.customers} customers · {b.claims} claims · {b.redemptions} redemptions · {b.conversion.toFixed(1)}% conv.
                </Text>
                {b.topOffer ? <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>Top offer: {b.topOffer.title}</Text> : null}
              </View>
            ))
          ) : null}
        </ScrollView>
      )}
    </Screen>
  );
}
