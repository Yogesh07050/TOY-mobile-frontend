import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Button, LoadingView } from '../../../components/ui';
import { PlanBadge } from '../../../components/admin';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { usePlanCatalogue, useShopEntitlements, useChangePlan, useConfirmPayment } from '../../../hooks/useSubscription';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { PlanKey } from '../../../types/admin';

type Props = AdminStackScreenProps<'Subscription'>;

export function SubscriptionScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const { currentShopId, hasPermission } = useShopAdmin();
  const catalogue = usePlanCatalogue();
  const entitlements = useShopEntitlements(currentShopId);
  const changePlan = useChangePlan(currentShopId);
  const confirmPayment = useConfirmPayment(currentShopId);
  const [error, setError] = useState<string | null>(null);
  const canManage = hasPermission('MANAGE_SUBSCRIPTION');

  if (entitlements.isLoading || catalogue.isLoading) return <LoadingView />;
  if (!entitlements.data) return null;

  const current = entitlements.data;

  const onUpgrade = (plan: PlanKey) => {
    if (!canManage) return;
    setError(null);
    changePlan.mutate(
      { plan },
      {
        onSuccess: (result) => {
          if (result.paymentStatus === 'pending') {
            Alert.alert(
              'Confirm Payment',
              `${result.planName} plan selected. This demo build has no live payment gateway yet — an admin confirms payment manually.`,
              [
                { text: 'Later', style: 'cancel' },
                { text: 'Confirm Payment', onPress: () => confirmPayment.mutate({}) },
              ],
            );
          }
        },
        onError: (err) => setError(getApiErrorMessage(err, 'Could not change plan.')),
      },
    );
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={[shadows.sm, { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>{current.planName}</Text>
            <PlanBadge plan={current.plan} />
          </View>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{current.tagline}</Text>
          {current.renewsAt ? (
            <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>Renews {new Date(current.renewsAt).toLocaleDateString()}</Text>
          ) : null}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>Usage</Text>
          <UsageRow label="Offers this month" used={current.usage.offersThisMonth} limit={current.limits.offersPerMonth} />
          <UsageRow label="Branches" used={current.usage.branches} limit={current.limits.branches} />
          <UsageRow label="Categories" used={current.usage.categories} limit={current.limits.categories} />
          <UsageRow label="Banners" used={current.usage.banners} limit={current.limits.banners} />
        </View>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        {canManage ? (
          <View style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>Available Plans</Text>
            {(catalogue.data?.plans ?? []).map((plan) => (
              <View
                key={plan.key}
                style={[
                  shadows.sm,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: radii.md,
                    borderWidth: plan.key === current.plan ? 2 : 1,
                    borderColor: plan.key === current.plan ? colors.brand : colors.border,
                    padding: spacing.md,
                    gap: 4,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{plan.name}</Text>
                  <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{plan.price === 0 ? 'Free' : `₹${plan.price}/mo`}</Text>
                </View>
                <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{plan.description}</Text>
                {plan.key !== current.plan ? (
                  <Button
                    label={plan.rank > (catalogue.data?.plans.find((p) => p.key === current.plan)?.rank ?? 0) ? 'Upgrade' : 'Switch Plan'}
                    variant="secondary"
                    onPress={() => onUpgrade(plan.key)}
                    loading={changePlan.isPending}
                    style={{ marginTop: spacing.xxs }}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
            You don&rsquo;t have permission to manage this shop&rsquo;s subscription.
          </Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number | null }) {
  const { colors, spacing, fontSizes, radii } = useTheme();
  const isUnlimited = limit == null;
  const pct = isUnlimited ? 0 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100);

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{label}</Text>
        <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: '600' }}>{isUnlimited ? `${used} / Unlimited` : `${used} / ${limit}`}</Text>
      </View>
      {!isUnlimited ? (
        <View style={{ height: 6, borderRadius: radii.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${pct}%`, backgroundColor: pct >= 100 ? colors.danger : colors.brand }} />
        </View>
      ) : null}
    </View>
  );
}
