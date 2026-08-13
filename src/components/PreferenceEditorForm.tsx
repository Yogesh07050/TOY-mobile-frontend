import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { Chip, Button, TextField } from './ui';
import { useCategories } from '../hooks/useCategories';
import { useShopsList } from '../hooks/useShops';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { trackEvent } from '../services/analytics/analyticsService';
import { MIN_CATEGORY_PREFERENCES, OFFER_TYPE_OPTIONS, DISCOUNT_OPTIONS } from '../utils/preferenceOptions';
import type { CustomerPreferences, OfferTypePreference } from '../types';
import type { SetPreferencesPayload } from '../api/preferences';

interface PreferenceEditorFormProps {
  initial: Pick<CustomerPreferences, 'categoryIds' | 'shopIds' | 'minimumDiscountPercent' | 'offerTypes'>;
  onSubmit: (payload: SetPreferencesPayload) => void;
  submitting?: boolean;
  submitLabel: string;
  header?: React.ReactNode;
  error?: string | null;
}

export function PreferenceEditorForm({ initial, onSubmit, submitting, submitLabel, header, error }: PreferenceEditorFormProps) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const categories = useCategories();

  const [categoryIds, setCategoryIds] = useState<number[]>(initial.categoryIds);
  const [shopIds, setShopIds] = useState<number[]>(initial.shopIds);
  const [minimumDiscountPercent, setMinimumDiscountPercent] = useState<number | null>(initial.minimumDiscountPercent);
  const [offerTypes, setOfferTypes] = useState<OfferTypePreference[]>(initial.offerTypes);
  const [categorySearch, setCategorySearch] = useState('');
  const [shopSearch, setShopSearch] = useState('');

  const debouncedShopSearch = useDebouncedValue(shopSearch, 350);
  const shops = useShopsList({ search: debouncedShopSearch || undefined, limit: 20 });
  const shopResults = shops.data?.pages[0]?.shops ?? [];

  const filteredCategories = useMemo(() => {
    const all = categories.data ?? [];
    if (!categorySearch.trim()) return all;
    const term = categorySearch.trim().toLowerCase();
    return all.filter((c) => c.name.toLowerCase().includes(term));
  }, [categories.data, categorySearch]);

  const toggleCategory = (id: number) => {
    setCategoryIds((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      if (!prev.includes(id)) {
        trackEvent({ event: 'PREFERENCE_CATEGORY_SELECTED', categoryId: id });
      }
      return next;
    });
  };

  const toggleShop = (id: number) => {
    setShopIds((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      if (!prev.includes(id)) {
        trackEvent({ event: 'PREFERENCE_SHOP_SELECTED', shopId: id });
      }
      return next;
    });
  };

  const toggleOfferType = (value: OfferTypePreference) => {
    setOfferTypes((prev) => (prev.includes(value) ? prev.filter((o) => o !== value) : [...prev, value]));
    trackEvent({ event: 'PREFERENCE_OFFER_TYPE_SELECTED' });
  };

  const selectDiscount = (value: number | null) => {
    setMinimumDiscountPercent(value);
    trackEvent({ event: 'PREFERENCE_DISCOUNT_SELECTED' });
  };

  const canSubmit = categoryIds.length >= MIN_CATEGORY_PREFERENCES;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl }}>
        {header}

        <View style={{ gap: spacing.sm }}>
          <View>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Categories</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              Pick at least {MIN_CATEGORY_PREFERENCES} categories you&rsquo;re interested in.
            </Text>
          </View>
          {(categories.data?.length ?? 0) > 10 ? (
            <TextField
              placeholder="Search categories"
              value={categorySearch}
              onChangeText={setCategorySearch}
              leftIcon="search-outline"
            />
          ) : null}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {filteredCategories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={categoryIds.includes(category.id)}
                onPress={() => toggleCategory(category.id)}
              />
            ))}
          </View>
          <Text
            style={{
              color: canSubmit ? colors.success : colors.warning,
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
            }}
          >
            {categoryIds.length} / {MIN_CATEGORY_PREFERENCES} selected{canSubmit ? '' : ` (pick ${MIN_CATEGORY_PREFERENCES - categoryIds.length} more)`}
          </Text>
        </View>

        <View style={{ gap: spacing.sm }}>
          <View>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Favorite Shops</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              Follow your favorite shops to hear about their offers. Optional.
            </Text>
          </View>
          <TextField placeholder="Search shops..." value={shopSearch} onChangeText={setShopSearch} leftIcon="search-outline" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {shopResults.map((shop) => (
              <Chip key={shop.id} label={shop.name} selected={shopIds.includes(shop.id)} onPress={() => toggleShop(shop.id)} />
            ))}
            {shopIds
              .filter((id) => !shopResults.some((s) => s.id === id))
              .map((id) => (
                <Chip key={id} label={`Shop #${id}`} selected onPress={() => toggleShop(id)} />
              ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <View>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
              Discount Preference
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              Tell us what kind of deals are worth your attention.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {DISCOUNT_OPTIONS.map((opt) => (
              <Chip
                key={opt.label}
                label={opt.label}
                selected={minimumDiscountPercent === opt.value}
                onPress={() => selectDiscount(opt.value)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          <View>
            <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
              Offer / Deal Types
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>Optional — pick as many as you like.</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {OFFER_TYPE_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={offerTypes.includes(opt.value)}
                onPress={() => toggleOfferType(opt.value)}
              />
            ))}
          </View>
        </View>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        <Button
          label={submitLabel}
          onPress={() =>
            onSubmit({
              categoryIds,
              shopIds,
              minimumDiscountPercent,
              offerTypes,
            })
          }
          disabled={!canSubmit}
          loading={submitting}
          fullWidth
        />
      </ScrollView>
    </View>
  );
}
