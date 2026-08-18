import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Button, TextField, Chip, LoadingView } from '../../../components/ui';
import { useServiceOffer, useCreateServiceOffer, useUpdateServiceOffer } from '../../../hooks/useAdminServiceOffers';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { ServiceOfferFormValues } from '../../../types/admin';
import type { ServiceOfferType } from '../../../types';

type Props = AdminStackScreenProps<'ServiceOfferForm'>;

const OFFER_TYPES: Array<{ value: ServiceOfferType; label: string }> = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'flat', label: 'Flat Discount' },
  { value: 'price_drop', label: 'Price Drop' },
  { value: 'other', label: 'Other' },
];

function emptyForm(): ServiceOfferFormValues {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    offerType: 'percentage',
    discountType: 'percentage',
    isRecurring: false,
    startDate: now.toISOString(),
    endDate: inAWeek.toISOString(),
    status: 'draft',
  };
}

export function ServiceOfferFormScreen({ route, navigation }: Props) {
  const { serviceId, offerId } = route.params;
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { data: existing, isLoading: loadingExisting } = useServiceOffer(serviceId, offerId);
  const createServiceOffer = useCreateServiceOffer();
  const updateServiceOffer = useUpdateServiceOffer();

  const [form, setForm] = useState<ServiceOfferFormValues>(emptyForm());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        offerText: existing.offerText ?? undefined,
        offerType: existing.offerType,
        discountType: existing.discountType,
        discountValue: existing.discountValue,
        originalPrice: existing.originalPrice,
        offerPrice: existing.offerPrice,
        termsConditions: existing.termsConditions ?? undefined,
        isRecurring: existing.isRecurring,
        recurrenceType: existing.recurrenceType,
        startDate: existing.startDate,
        endDate: existing.endDate,
        status: existing.status === 'active' ? 'active' : 'draft',
      });
    }
  }, [existing]);

  const set = <K extends keyof ServiceOfferFormValues>(key: K, value: ServiceOfferFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));

  const onSave = (publish: boolean) => {
    setError(null);
    const payload: ServiceOfferFormValues = { ...form, status: publish ? 'active' : 'draft' };
    const onError = (err: unknown) => setError(getApiErrorMessage(err, 'Could not save this offer.'));
    if (offerId) {
      updateServiceOffer.mutate({ serviceId, offerId, payload }, { onSuccess: () => navigation.goBack(), onError });
    } else {
      createServiceOffer.mutate({ serviceId, payload }, { onSuccess: () => navigation.goBack(), onError });
    }
  };

  if (offerId && loadingExisting) return <LoadingView />;

  const saving = createServiceOffer.isPending || updateServiceOffer.isPending;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {offerId ? 'Edit Service Offer' : 'Create Service Offer'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}>
        <TextField label="Offer Text (headline)" value={form.offerText ?? ''} onChangeText={(v) => set('offerText', v)} placeholder="e.g. 30% OFF" />

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Offer Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {OFFER_TYPES.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                selected={form.offerType === t.value}
                onPress={() => {
                  set('offerType', t.value);
                  if (t.value === 'percentage') set('discountType', 'percentage');
                  else if (t.value === 'flat') set('discountType', 'flat');
                }}
              />
            ))}
          </View>
        </View>

        {(form.discountType === 'percentage' || form.discountType === 'flat') ? (
          <TextField
            label={form.discountType === 'percentage' ? 'Discount %' : 'Flat Discount ₹'}
            value={form.discountValue != null ? String(form.discountValue) : ''}
            onChangeText={(v) => set('discountValue', v ? Number(v) : null)}
            keyboardType="numeric"
          />
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField label="Original Price" value={form.originalPrice != null ? String(form.originalPrice) : ''} onChangeText={(v) => set('originalPrice', v ? Number(v) : null)} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Offer Price" value={form.offerPrice != null ? String(form.offerPrice) : ''} onChangeText={(v) => set('offerPrice', v ? Number(v) : null)} keyboardType="numeric" />
          </View>
        </View>

        <TextField label="Terms & Conditions" value={form.termsConditions ?? ''} onChangeText={(v) => set('termsConditions', v)} multiline />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Recurring Offer</Text>
          <Switch value={form.isRecurring} onValueChange={(v) => set('isRecurring', v)} trackColor={{ false: colors.border, true: colors.brand }} />
        </View>
        {form.isRecurring ? (
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            {(['daily', 'weekly', 'monthly'] as const).map((r) => (
              <Chip key={r} label={r} selected={form.recurrenceType === r} onPress={() => set('recurrenceType', r)} />
            ))}
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Start Date"
              value={new Date(form.startDate).toLocaleDateString()}
              editable={false}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="End Date"
              value={new Date(form.endDate).toLocaleDateString()}
              editable={false}
            />
          </View>
        </View>
        <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>
          Dates default to today through the next 7 days — date pickers are not yet supported on mobile.
        </Text>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label="Save as Draft" variant="secondary" onPress={() => onSave(false)} loading={saving} style={{ flex: 1 }} />
          <Button label="Publish" onPress={() => onSave(true)} loading={saving} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}
