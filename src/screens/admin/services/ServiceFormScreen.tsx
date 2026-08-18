import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../theme';
import { Screen, Button, TextField, Chip, LoadingView } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useCategories } from '../../../hooks/useCategories';
import { useBranches } from '../../../hooks/useAdminShop';
import { useManagedService, useCreateService, useUpdateService } from '../../../hooks/useAdminServices';
import { uploadServiceImage } from '../../../api/uploads';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { ServiceFormValues } from '../../../types/admin';
import type { AvailableDay, BookingType, PricingType } from '../../../types';

type Props = AdminStackScreenProps<'ServiceForm'>;

const PRICING_TYPES: Array<{ value: PricingType; label: string }> = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'price_on_enquiry', label: 'Price on Enquiry' },
];

const BOOKING_TYPES: Array<{ value: BookingType; label: string }> = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'both', label: 'Both' },
  { value: 'enquiry_only', label: 'Enquiry Only' },
];

const DAYS: Array<{ value: AvailableDay; label: string }> = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

function emptyForm(shopId: number): ServiceFormValues {
  return {
    shopId,
    name: '',
    pricingType: 'fixed',
    availableDays: [],
    homeService: false,
    walkInAvailable: false,
    appointmentRequired: false,
    bookingType: 'walk_in',
    applicabilityType: 'shop_wide',
    status: 'draft',
    branchIds: [],
    images: [],
  };
}

export function ServiceFormScreen({ route, navigation }: Props) {
  const { serviceId } = route.params ?? {};
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { currentShopId } = useShopAdmin();
  const categories = useCategories();
  const branches = useBranches(currentShopId);
  const { data: existing, isLoading: loadingExisting } = useManagedService(serviceId);
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [form, setForm] = useState<ServiceFormValues>(emptyForm(currentShopId ?? 0));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        shopId: existing.shop.id,
        categoryId: existing.category?.id ?? null,
        subcategoryId: existing.subcategory?.id ?? null,
        name: existing.name,
        description: existing.description ?? undefined,
        pricingType: existing.pricingType,
        price: existing.price,
        durationMinutes: existing.durationMinutes,
        durationLabel: existing.durationLabel ?? undefined,
        availableDays: existing.availableDays,
        availableTimeStart: existing.availableTimeStart ?? undefined,
        availableTimeEnd: existing.availableTimeEnd ?? undefined,
        homeService: existing.homeService,
        walkInAvailable: existing.walkInAvailable,
        appointmentRequired: existing.appointmentRequired,
        bookingType: existing.bookingType,
        serviceArea: existing.serviceArea ?? undefined,
        termsConditions: existing.termsConditions ?? undefined,
        applicabilityType: existing.applicabilityType,
        status: existing.status === 'active' ? 'active' : 'draft',
        branchIds: existing.branchIds ?? [],
        images: existing.images?.map((img) => ({ url: img.url, thumbnailUrl: img.thumbnailUrl ?? undefined })) ?? [],
      });
    }
  }, [existing]);

  const set = <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      const uploaded = await uploadServiceImage(asset.uri, asset.fileName ?? 'service.jpg', asset.mimeType ?? 'image/jpeg');
      set('images', [...form.images, { url: uploaded.url, thumbnailUrl: uploaded.thumbnailUrl ?? undefined }]);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upload image.'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => set('images', form.images.filter((img) => img.url !== url));

  const toggleDay = (day: AvailableDay) => {
    set('availableDays', form.availableDays.includes(day) ? form.availableDays.filter((d) => d !== day) : [...form.availableDays, day]);
  };

  const toggleBranch = (branchId: number) => {
    set('branchIds', form.branchIds.includes(branchId) ? form.branchIds.filter((b) => b !== branchId) : [...form.branchIds, branchId]);
  };

  const onSave = (publish: boolean) => {
    setError(null);
    const payload: ServiceFormValues = { ...form, status: publish ? 'active' : 'draft' };
    const onError = (err: unknown) => setError(getApiErrorMessage(err, 'Could not save this service.'));
    if (serviceId) {
      updateService.mutate({ id: serviceId, payload }, { onSuccess: () => navigation.goBack(), onError });
    } else {
      createService.mutate(payload, { onSuccess: () => navigation.goBack(), onError });
    }
  };

  if (serviceId && loadingExisting) return <LoadingView />;

  const saving = createService.isPending || updateService.isPending;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {serviceId ? 'Edit Service' : 'Create Service'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}>
        <TextField label="Name" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Haircut & Styling" />
        <TextField label="Description" value={form.description ?? ''} onChangeText={(v) => set('description', v)} multiline />

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs }}>
            {(categories.data ?? []).map((c) => (
              <Chip key={c.id} label={c.name} selected={form.categoryId === c.id} onPress={() => set('categoryId', c.id)} />
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Pricing</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {PRICING_TYPES.map((t) => (
              <Chip key={t.value} label={t.label} selected={form.pricingType === t.value} onPress={() => set('pricingType', t.value)} />
            ))}
          </View>
        </View>

        {form.pricingType !== 'price_on_enquiry' ? (
          <TextField
            label="Price (₹)"
            value={form.price != null ? String(form.price) : ''}
            onChangeText={(v) => set('price', v ? Number(v) : null)}
            keyboardType="numeric"
          />
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Duration (minutes)"
              value={form.durationMinutes != null ? String(form.durationMinutes) : ''}
              onChangeText={(v) => set('durationMinutes', v ? Number(v) : null)}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Duration Label" value={form.durationLabel ?? ''} onChangeText={(v) => set('durationLabel', v)} placeholder="e.g. 45 min" />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Available Days</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {DAYS.map((d) => (
              <Chip key={d.value} label={d.label} selected={form.availableDays.includes(d.value)} onPress={() => toggleDay(d.value)} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField label="Opening Time (HH:MM)" value={form.availableTimeStart ?? ''} onChangeText={(v) => set('availableTimeStart', v)} placeholder="09:00" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Closing Time (HH:MM)" value={form.availableTimeEnd ?? ''} onChangeText={(v) => set('availableTimeEnd', v)} placeholder="18:00" />
          </View>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Booking Type</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {BOOKING_TYPES.map((t) => (
              <Chip key={t.value} label={t.label} selected={form.bookingType === t.value} onPress={() => set('bookingType', t.value)} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Home Service</Text>
          <Switch value={form.homeService} onValueChange={(v) => set('homeService', v)} trackColor={{ false: colors.border, true: colors.brand }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Walk-in Available</Text>
          <Switch value={form.walkInAvailable} onValueChange={(v) => set('walkInAvailable', v)} trackColor={{ false: colors.border, true: colors.brand }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Appointment Required</Text>
          <Switch value={form.appointmentRequired} onValueChange={(v) => set('appointmentRequired', v)} trackColor={{ false: colors.border, true: colors.brand }} />
        </View>

        <TextField label="Service Area" value={form.serviceArea ?? ''} onChangeText={(v) => set('serviceArea', v)} placeholder="e.g. Within 10km of shop" />
        <TextField label="Terms & Conditions" value={form.termsConditions ?? ''} onChangeText={(v) => set('termsConditions', v)} multiline />

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Applies To</Text>
          <View style={{ flexDirection: 'row', gap: spacing.xs }}>
            <Chip label="Whole Shop" selected={form.applicabilityType === 'shop_wide'} onPress={() => set('applicabilityType', 'shop_wide')} />
            <Chip label="Selected Branches" selected={form.applicabilityType === 'selected_branches'} onPress={() => set('applicabilityType', 'selected_branches')} />
            <Chip label="Online Only" selected={form.applicabilityType === 'online'} onPress={() => set('applicabilityType', 'online')} />
          </View>
          {form.applicabilityType === 'selected_branches' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs }}>
              {(branches.data ?? []).map((b) => (
                <Chip key={b.id} label={b.branchName} selected={form.branchIds.includes(b.id)} onPress={() => toggleBranch(b.id)} />
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Images</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
            {form.images.map((img) => (
              <View key={img.url} style={{ position: 'relative' }}>
                <Image
                  source={{ uri: img.url }}
                  style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: colors.surfaceAlt }}
                  contentFit="cover"
                />
                <Pressable onPress={() => removeImage(img.url)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 10, padding: 2 }}>
                  <Ionicons name="close" size={12} color="#fff" />
                </Pressable>
              </View>
            ))}
            <Pressable onPress={pickImage} disabled={uploading} style={{ width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={uploading ? 'hourglass-outline' : 'add'} size={22} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label="Save as Draft" variant="secondary" onPress={() => onSave(false)} loading={saving} style={{ flex: 1 }} />
          <Button label="Publish" onPress={() => onSave(true)} loading={saving} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}
