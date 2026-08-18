import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, LoadingView, EmptyState } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useBillingHistory, useInvoices } from '../../../hooks/useSubscription';
import { formatDate, formatRupees } from '../../../utils/format';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { PaymentStatus, SubscriptionInvoice } from '../../../types/admin';

type Props = AdminStackScreenProps<'BillingHistory'>;
type Tab = 'payments' | 'invoices';

/** How each payment state reads, and in which colour role (§9, §15). */
const STATUS_LABEL: Record<PaymentStatus, string> = {
  CREATED: 'Created',
  PENDING: 'Pending',
  AUTHORIZED: 'Authorised',
  CAPTURED: 'Success',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_REFUNDED: 'Partly refunded',
  CANCELLED: 'Cancelled',
};

/** "UPI AutoPay", "Visa ****4242" - descriptive only, never a credential (§6). */
function methodLabel(method: string | null, detail: string | null, recurring: boolean): string {
  if (!method) return '—';
  const base = method === 'upi' ? (recurring ? 'UPI AutoPay' : 'UPI') : method.toUpperCase();
  return detail ? `${base} · ${detail}` : base;
}

export function BillingHistoryScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const { currentShopId } = useShopAdmin();
  const [tab, setTab] = useState<Tab>('payments');

  const payments = useBillingHistory(currentShopId);
  const invoices = useInvoices(currentShopId);
  const active = tab === 'payments' ? payments : invoices;

  const card = {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  } as const;

  const statusColor = (status: PaymentStatus) => {
    if (status === 'CAPTURED') return colors.success;
    if (status === 'FAILED' || status === 'CANCELLED') return colors.danger;
    if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') return colors.warning;
    return colors.textMuted;
  };

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Billing</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: spacing.xs, padding: spacing.md }}>
        {(['payments', 'invoices'] as Tab[]).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={{
              paddingVertical: spacing.xxs + 2,
              paddingHorizontal: spacing.sm,
              borderRadius: radii.pill,
              backgroundColor: tab === key ? colors.brand : colors.surfaceAlt,
            }}
          >
            <Text
              style={{
                color: tab === key ? colors.brandInk : colors.textMuted,
                fontSize: fontSizes.sm,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {key}
            </Text>
          </Pressable>
        ))}
      </View>

      {active.isLoading ? (
        <LoadingView />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl }}
          refreshControl={<RefreshControl refreshing={active.isRefetching} onRefresh={() => active.refetch()} />}
        >
          {tab === 'payments' ? (
            (payments.data ?? []).length === 0 ? (
              <EmptyState
                icon="card-outline"
                title="No payments yet"
                message="Payments appear here once you subscribe to a paid plan."
              />
            ) : (
              (payments.data ?? []).map((payment) => (
                <View key={payment.id} style={[shadows.sm, card, { gap: 4 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{payment.planName}</Text>
                    <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>
                      {formatRupees(payment.amount)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
                    {formatDate(payment.paidAt ?? payment.createdAt)} ·{' '}
                    {methodLabel(payment.paymentMethod, payment.methodDetail, true)}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: statusColor(payment.status), fontSize: fontSizes.sm, fontWeight: '600' }}>
                      {STATUS_LABEL[payment.status]}
                    </Text>
                    {payment.paymentId ? (
                      <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{payment.paymentId}</Text>
                    ) : null}
                  </View>
                  {payment.failureReason ? (
                    <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>{payment.failureReason}</Text>
                  ) : null}
                </View>
              ))
            )
          ) : (invoices.data ?? []).length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No invoices yet"
              message="An invoice is issued each time a subscription payment is collected."
            />
          ) : (
            (invoices.data ?? []).map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

/** §16: number, plan, period, amount, tax and payment reference. */
function InvoiceCard({ invoice }: { invoice: SubscriptionInvoice }) {
  const { colors, spacing, fontSizes, fontWeights, radii, shadows } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((value) => !value)}
      style={[
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.md,
          gap: 4,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{invoice.number}</Text>
        <Text style={{ color: colors.text, fontWeight: fontWeights.bold }}>{formatRupees(invoice.total)}</Text>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
        {invoice.planName} · {formatDate(invoice.issuedAt)}
      </Text>

      {open ? (
        <View style={{ gap: 2, marginTop: spacing.xs }}>
          {invoice.billingName ? <Line label="Billed to" value={invoice.billingName} /> : null}
          {invoice.billingAddress ? <Line label="Address" value={invoice.billingAddress} /> : null}
          {invoice.periodStart && invoice.periodEnd ? (
            <Line label="Period" value={`${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`} />
          ) : null}
          <Line label="Subtotal" value={formatRupees(invoice.subtotal)} />
          <Line label={`Tax (${invoice.taxPercent}%)`} value={formatRupees(invoice.taxAmount)} />
          <Line label="Total" value={formatRupees(invoice.total)} />
          <Line label="Status" value={invoice.status} />
        </View>
      ) : (
        <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>Tap to view details</Text>
      )}
    </Pressable>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  const { colors, fontSizes } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: fontSizes.xs, flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
