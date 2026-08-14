import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme';
import { Screen, Button, TextField, Chip, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useAdminBanner, useSelectableOffers, useCreateBanner, useUpdateBanner, useDeleteBanner } from '../../../hooks/useAdminBanners';
import { useShopEntitlements } from '../../../hooks/useSubscription';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { uploadBannerImage } from '../../../api/uploads';
import { getApiErrorMessage, getPlanUpgradeDetails } from '../../../api/client';
import { UpgradePrompt } from '../../../components/UpgradePrompt';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { BannerFormValues, BannerStatus } from '../../../types/admin';

type Props = AdminStackScreenProps<'BannerForm'>;

function emptyForm(): BannerFormValues {
  const now = new Date();
  const inAWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { title: '', offerId: 0, buttonText: 'View Offer', startDate: now.toISOString(), endDate: inAWeek.toISOString(), status: 'draft' };
}

export function BannerFormScreen({ route, navigation }: Props) {
  const { bannerId } = route.params ?? {};
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { currentShopId } = useShopAdmin();
  const entitlements = useShopEntitlements(currentShopId);
  const { data: existing, isLoading: loadingExisting } = useAdminBanner(bannerId);
  const [offerSearch, setOfferSearch] = useState('');
  const debouncedSearch = useDebouncedValue(offerSearch, 350);
  const selectableOffers = useSelectableOffers(debouncedSearch);
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();

  const [form, setForm] = useState<BannerFormValues>(emptyForm());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeDetails, setUpgradeDetails] = useState<ReturnType<typeof getPlanUpgradeDetails>>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        subtitle: existing.subtitle ?? undefined,
        description: existing.description ?? undefined,
        imageUrl: existing.imageUrl ?? undefined,
        mobileImageUrl: existing.mobileImageUrl ?? undefined,
        offerId: existing.offerId,
        buttonText: existing.buttonText,
        startDate: existing.startDate,
        endDate: existing.endDate,
        status: existing.status,
        displayOrder: existing.displayOrder,
      });
    }
  }, [existing]);

  const canFeature = entitlements.data?.features.includes('FEATURED_BANNERS') ?? false;
  const canSchedule = entitlements.data?.features.includes('BANNER_SCHEDULING') ?? false;

  const set = <K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const uploaded = await uploadBannerImage(asset.uri, asset.fileName ?? 'banner.jpg', asset.mimeType ?? 'image/jpeg');
      set('mobileImageUrl', uploaded.url);
      set('imageUrl', uploaded.url);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upload image.'));
    } finally {
      setUploading(false);
    }
  };

  const onSave = (status: BannerStatus) => {
    if (!canFeature) return;
    setError(null);
    setUpgradeDetails(null);
    const payload: BannerFormValues = { ...form, status };
    const onErr = (err: unknown) => {
      const upgrade = getPlanUpgradeDetails(err);
      if (upgrade) setUpgradeDetails(upgrade);
      else setError(getApiErrorMessage(err, 'Could not save this banner.'));
    };
    if (bannerId) {
      updateBanner.mutate({ id: bannerId, payload }, { onSuccess: () => navigation.goBack(), onError: onErr });
    } else {
      createBanner.mutate(payload, { onSuccess: () => navigation.goBack(), onError: onErr });
    }
  };

  const onDelete = () => {
    if (!bannerId) return;
    deleteBanner.mutate(bannerId, { onSuccess: () => navigation.goBack() });
  };

  if (bannerId && loadingExisting) return <LoadingView />;

  if (!canFeature && !entitlements.isLoading) {
    return (
      <Screen>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>
        <UpgradePrompt
          details={{ requiredPlan: 'PREMIUM', requiredPlanName: 'Premium', requiredPlanPrice: 2500, currentPlan: entitlements.data?.plan ?? 'FREE' }}
          featureLabel="Featured banners are"
          onViewPlan={() => navigation.navigate('Subscription')}
        />
      </Screen>
    );
  }

  const saving = createBanner.isPending || updateBanner.isPending;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {bannerId ? 'Edit Banner' : 'Create Banner'}
        </Text>
      </View>

      {upgradeDetails ? (
        <UpgradePrompt details={upgradeDetails} onViewPlan={() => navigation.navigate('Subscription')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}>
          <Pressable onPress={pickImage} disabled={uploading} style={{ height: 140, borderRadius: 14, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={uploading ? 'hourglass-outline' : 'image-outline'} size={28} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, marginTop: 4 }}>{form.mobileImageUrl ? 'Change Image' : 'Add Banner Image'}</Text>
          </Pressable>

          <TextField label="Title" value={form.title} onChangeText={(v) => set('title', v)} />
          <TextField label="Short Text" value={form.subtitle ?? ''} onChangeText={(v) => set('subtitle', v)} />
          <TextField label="Button Text" value={form.buttonText ?? 'View Offer'} onChangeText={(v) => set('buttonText', v)} />

          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Linked Offer</Text>
            <TextField placeholder="Search your offers..." value={offerSearch} onChangeText={setOfferSearch} leftIcon="search-outline" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
              {(selectableOffers.data ?? []).map((o) => (
                <Chip key={o.id} label={o.title} selected={form.offerId === o.id} onPress={() => set('offerId', o.id)} />
              ))}
            </View>
          </View>

          {!canSchedule ? (
            <Text style={{ color: colors.warning, fontSize: fontSizes.xs }}>Banner scheduling requires the Premium plan — this banner will publish immediately.</Text>
          ) : null}

          {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Button label="Save as Draft" variant="secondary" onPress={() => onSave('draft')} loading={saving} style={{ flex: 1 }} disabled={!form.offerId} />
            <Button label="Publish" onPress={() => onSave('published')} loading={saving} style={{ flex: 1 }} disabled={!form.offerId} />
          </View>
          {bannerId ? <Button label="Delete Banner" variant="danger" onPress={onDelete} fullWidth /> : null}
        </ScrollView>
      )}
    </Screen>
  );
}
