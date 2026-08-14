import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme';
import { Screen, Button, TextField } from '../../../components/ui';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useBranches, useCreateBranch, useUpdateBranch, useDeactivateBranch } from '../../../hooks/useAdminShop';
import { useLocationContext } from '../../../services/location/LocationContext';
import { getApiErrorMessage, getPlanUpgradeDetails } from '../../../api/client';
import { UpgradePrompt } from '../../../components/UpgradePrompt';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { BranchFormValues } from '../../../types/admin';

type Props = AdminStackScreenProps<'BranchForm'>;

export function BranchFormScreen({ route, navigation }: Props) {
  const { branchId } = route.params ?? {};
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { currentShopId } = useShopAdmin();
  const branches = useBranches(currentShopId);
  const existing = branches.data?.find((b) => b.id === branchId);
  const createBranch = useCreateBranch(currentShopId);
  const updateBranch = useUpdateBranch(currentShopId);
  const deactivateBranch = useDeactivateBranch(currentShopId);
  const { deviceCoords, refreshLocation } = useLocationContext();

  const [form, setForm] = useState<BranchFormValues>({ branchName: '', city: '', isPrimary: false });
  const [error, setError] = useState<string | null>(null);
  const [upgradeDetails, setUpgradeDetails] = useState<ReturnType<typeof getPlanUpgradeDetails>>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        branchName: existing.branchName,
        address: existing.address ?? undefined,
        city: existing.city ?? '',
        state: existing.state ?? undefined,
        country: existing.country ?? undefined,
        pincode: existing.pincode ?? undefined,
        latitude: existing.latitude ?? undefined,
        longitude: existing.longitude ?? undefined,
        contactNumber: existing.contactNumber ?? undefined,
        isPrimary: existing.isPrimary,
      });
    }
  }, [existing]);

  const set = <K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) => setForm((f) => ({ ...f, [key]: value }));

  const useCurrentLocation = async () => {
    await refreshLocation();
    if (deviceCoords) {
      set('latitude', deviceCoords.latitude);
      set('longitude', deviceCoords.longitude);
    }
  };

  const onSave = () => {
    setError(null);
    setUpgradeDetails(null);
    const onErr = (err: unknown) => {
      const upgrade = getPlanUpgradeDetails(err);
      if (upgrade) setUpgradeDetails(upgrade);
      else setError(getApiErrorMessage(err, 'Could not save this branch.'));
    };
    if (branchId) {
      updateBranch.mutate({ branchId, payload: form }, { onSuccess: () => navigation.goBack(), onError: onErr });
    } else {
      createBranch.mutate(form, { onSuccess: () => navigation.goBack(), onError: onErr });
    }
  };

  const onDeactivate = () => {
    if (!branchId) return;
    deactivateBranch.mutate(branchId, { onSuccess: () => navigation.goBack() });
  };

  const saving = createBranch.isPending || updateBranch.isPending;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          {branchId ? 'Edit Branch' : 'Add Branch'}
        </Text>
      </View>

      {upgradeDetails ? (
        <UpgradePrompt details={upgradeDetails} onViewPlan={() => navigation.navigate('Subscription')} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
          <TextField label="Branch Name" value={form.branchName} onChangeText={(v) => set('branchName', v)} />
          <TextField label="Address" value={form.address ?? ''} onChangeText={(v) => set('address', v)} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField label="City" value={form.city} onChangeText={(v) => set('city', v)} />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="State" value={form.state ?? ''} onChangeText={(v) => set('state', v)} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <TextField label="Pincode" value={form.pincode ?? ''} onChangeText={(v) => set('pincode', v)} keyboardType="number-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Contact Number" value={form.contactNumber ?? ''} onChangeText={(v) => set('contactNumber', v)} keyboardType="phone-pad" />
            </View>
          </View>

          <Button label="Use Current Location for Coordinates" variant="secondary" onPress={useCurrentLocation} icon={<Ionicons name="locate-outline" size={16} color={colors.text} />} />
          {form.latitude != null ? (
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
              📍 {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
            </Text>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>Primary Branch</Text>
            <Switch value={!!form.isPrimary} onValueChange={(v) => set('isPrimary', v)} trackColor={{ false: colors.border, true: colors.brand }} />
          </View>

          {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

          <Button label={branchId ? 'Save Changes' : 'Add Branch'} onPress={onSave} loading={saving} fullWidth />
          {branchId ? <Button label="Deactivate Branch" variant="danger" onPress={onDeactivate} fullWidth /> : null}
        </ScrollView>
      )}
    </Screen>
  );
}
