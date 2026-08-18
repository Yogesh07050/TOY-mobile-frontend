import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, LoadingView } from '../../../components/ui';
import { MetricCard } from '../../../components/admin';
import { UpgradePrompt } from '../../../components/UpgradePrompt';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import {
  useServiceOverview,
  useServicePerformance,
  useServiceFunnel,
  useServiceOfferPerformance,
  useServiceBranches,
  useServiceLocations,
  useServiceCustomers,
  useServiceCategoryInsights,
} from '../../../hooks/useAdminServiceAnalytics';
import { getPlanUpgradeDetails } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';

type Props = AdminStackScreenProps<'ServiceAnalytics'>;

function formatKpiValue(value: number, format: string): string {
  if (format === 'percent') return `${value.toFixed(1)}%`;
  return String(value);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  const { colors, spacing, radii } = useTheme();
  return (
    <View style={{ padding: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 }}>
      {children}
    </View>
  );
}

export function ServiceAnalyticsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { currentShopId } = useShopAdmin();
  const params = { shopId: currentShopId ?? undefined, preset: 'last30' as const };

  const overview = useServiceOverview(params);
  const performance = useServicePerformance(params, true);
  const funnel = useServiceFunnel(params, true);
  const offerPerformance = useServiceOfferPerformance(params, true);
  const branches = useServiceBranches(params, true);
  const locations = useServiceLocations(params, true);
  const customers = useServiceCustomers(params, true);
  const categoryInsights = useServiceCategoryInsights(params, true);

  const upgradePrompt = (error: unknown) => {
    const upgrade = getPlanUpgradeDetails(error);
    if (!upgrade) return null;
    return <UpgradePrompt details={upgrade} onViewPlan={() => navigation.navigate('Subscription')} />;
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Service Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl }}>
        {overview.isLoading ? (
          <LoadingView fullScreen={false} />
        ) : overview.data ? (
          <Section title="Overview">
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              {overview.data.activeServices} of {overview.data.totalServices} services active
            </Text>
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
          </Section>
        ) : null}

        <Section title="Top Performers">
          {performance.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(performance.error) ?? (
              performance.data ? (
                <View style={{ gap: spacing.xs }}>
                  {[
                    ['Most Viewed', performance.data.mostViewedService],
                    ['Most Saved', performance.data.mostSavedService],
                    ['Most Booked', performance.data.mostBookedService],
                    ['Most Claimed', performance.data.mostClaimedService],
                    ['Best Converting', performance.data.bestConvertingService],
                  ].map(([label, s]) => (
                    <Row key={label as string}>
                      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>{label as string}</Text>
                      <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                        {s ? (s as { name: string }).name : 'No data yet'}
                      </Text>
                    </Row>
                  ))}
                </View>
              ) : null
            )
          )}
        </Section>

        <Section title="Customer Funnel">
          {funnel.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(funnel.error) ?? (
              <View style={{ gap: spacing.xs }}>
                {(funnel.data ?? []).map((stage, i) => (
                  <Row key={stage.key}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{i + 1}. {stage.label}</Text>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{stage.value}</Text>
                        {stage.conversionFromPrevious != null ? (
                          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{stage.conversionFromPrevious.toFixed(1)}%</Text>
                        ) : null}
                      </View>
                    </View>
                  </Row>
                ))}
              </View>
            )
          )}
        </Section>

        <Section title="Offer Performance">
          {offerPerformance.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(offerPerformance.error) ?? (
              offerPerformance.data ? (
                <Row>
                  <Text style={{ color: colors.text, fontSize: fontSizes.sm }}>
                    Promotional views: {offerPerformance.data.promotional.views} · Normal views: {offerPerformance.data.normal.views}
                  </Text>
                </Row>
              ) : null
            )
          )}
        </Section>

        <Section title="Branch Performance">
          {branches.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(branches.error) ?? (
              <View style={{ gap: spacing.xs }}>
                {(branches.data ?? []).map((b) => (
                  <Row key={b.id}>
                    <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{b.branchName}{b.city ? ` · ${b.city}` : ''}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                      {b.views} views · {b.bookings} bookings · {b.claims} claims
                    </Text>
                  </Row>
                ))}
                {(branches.data ?? []).length === 0 ? <Text style={{ color: colors.textMuted }}>No branch data yet.</Text> : null}
              </View>
            )
          )}
        </Section>

        <Section title="Location Insights">
          {locations.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(locations.error) ?? (
              <View style={{ gap: spacing.xs }}>
                {(locations.data ?? []).map((loc) => (
                  <Row key={loc.city}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{loc.city}</Text>
                      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{loc.views} views · {loc.bookings} bookings</Text>
                    </View>
                  </Row>
                ))}
              </View>
            )
          )}
        </Section>

        <Section title="Customer Trends">
          {customers.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(customers.error) ?? (
              customers.data ? (
                <Row>
                  <Text style={{ color: colors.text, fontSize: fontSizes.sm }}>
                    {customers.data.newCustomers} new customers
                    {customers.data.customerGrowth != null ? ` (${customers.data.customerGrowth.toFixed(1)}%)` : ''}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                    {customers.data.repeatBookings} repeat bookings · {customers.data.repeatClaims} repeat claims
                  </Text>
                </Row>
              ) : null
            )
          )}
        </Section>

        <Section title="Category Insights">
          {categoryInsights.isLoading ? (
            <LoadingView fullScreen={false} />
          ) : (
            upgradePrompt(categoryInsights.error) ?? (
              <View style={{ gap: spacing.xs }}>
                {(categoryInsights.data ?? []).map((cat) => (
                  <Row key={cat.id}>
                    <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>{cat.name}</Text>
                    <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
                      {cat.serviceCount} services · {cat.views} views · {cat.saves} saves
                    </Text>
                  </Row>
                ))}
              </View>
            )
          )}
        </Section>
      </ScrollView>
    </Screen>
  );
}
