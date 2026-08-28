import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '../../../theme';
import { Screen, Button, TextField, LoadingView } from '../../../components/ui';
import { MapLocationPicker, type PickedLocation } from '../../../components/MapLocationPicker';
import { useShopAdmin } from '../../../store/ShopAdminContext';
import { useAdminShop, useUpdateShop } from '../../../hooks/useAdminShop';
import { uploadShopImage } from '../../../api/uploads';
import { getApiErrorMessage } from '../../../api/client';
import type { AdminStackScreenProps } from '../../../navigation/types';
import type { LocationSource, ShopProfileStatus } from '../../../types';

type Props = AdminStackScreenProps<'ShopProfile'>;

interface FormState {
  name: string;
  description: string;
  contactNumber: string;
  whatsapp: string;
  websiteUrl: string;
  instagram: string;
  logoUrl: string | null;
  live: boolean;

  address: string;
  addressLine2: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
}

const EMPTY: FormState = {
  name: '',
  description: '',
  contactNumber: '',
  whatsapp: '',
  websiteUrl: '',
  instagram: '',
  logoUrl: null,
  live: true,
  address: '',
  addressLine2: '',
  area: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  latitude: null,
  longitude: null,
};

/**
 * The merchant's own shop profile (V3 §3, §19, §22).
 *
 * Free-plan shops get a real profile rather than a deliberately thin one (§29):
 * name, category, address and a map pin are required of everybody, and the
 * picture is optional for everybody. What a paid plan buys is reach and extra
 * branches, not the right to tell customers where the shop is.
 *
 * The location lives on this screen rather than behind Branches (§19). A
 * merchant who has moved shop should not have to work out that "branches" is
 * where their own address is kept.
 */
export function ShopProfileScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { currentShopId } = useShopAdmin();
  const shop = useAdminShop(currentShopId);
  const updateShop = useUpdateShop(currentShopId);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  /** Where the pin came from, so §24 can record it. */
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const profile: ShopProfileStatus | undefined = shop.data?.profile;

  useEffect(() => {
    const data = shop.data;
    if (!data) return;
    const branch = data.branches?.find((entry) => entry.isPrimary) ?? data.branches?.[0] ?? null;

    setForm({
      name: data.name,
      description: data.description ?? '',
      contactNumber: data.contactNumber ?? '',
      whatsapp: data.socialLinks?.whatsapp ?? '',
      websiteUrl: data.websiteUrl ?? '',
      instagram: data.socialLinks?.instagram ?? '',
      logoUrl: data.logoUrl,
      live: data.status === 'active',
      address: branch?.address ?? '',
      addressLine2: branch?.addressLine2 ?? '',
      area: branch?.area ?? '',
      city: branch?.city ?? '',
      state: branch?.state ?? '',
      country: branch?.country ?? 'India',
      pincode: branch?.pincode ?? '',
      latitude: branch?.latitude ?? null,
      longitude: branch?.longitude ?? null,
    });
    setLocationSource(branch?.locationSource ?? null);
    setLocationAccuracy(branch?.locationAccuracy ?? null);
    setPlaceId(branch?.placeId ?? null);
    // Coordinates that are already stored were confirmed when they were saved.
    setLocationConfirmed(branch?.latitude != null);
  }, [shop.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  /** §14: optional on every plan, so nothing here blocks a save. */
  const pickLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      const asset = result.assets[0];
      const uploaded = await uploadShopImage(
        asset.uri,
        asset.fileName ?? 'shop.jpg',
        asset.mimeType ?? 'image/jpeg',
      );
      set('logoUrl', uploaded.url);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upload that picture.'));
    } finally {
      setUploading(false);
    }
  };

  /**
   * §8, §10: the merchant confirmed a pin, so it wins over anything the
   * geocoder would work out from the address. Address fields are filled in
   * only where they are still empty - what the merchant typed is what they
   * meant.
   */
  const onLocationConfirmed = (location: PickedLocation) => {
    setForm((current) => {
      const fill = (value: string | null | undefined, existing: string) =>
        existing.trim() ? existing : (value ?? '');
      return {
        ...current,
        latitude: location.latitude,
        longitude: location.longitude,
        address: fill(location.address?.addressLine1, current.address),
        area: fill(location.address?.area, current.area),
        city: fill(location.address?.city, current.city),
        state: fill(location.address?.state, current.state),
        country: fill(location.address?.country, current.country),
        pincode: fill(location.address?.pincode, current.pincode),
      };
    });
    setLocationSource(location.source);
    setLocationAccuracy(location.accuracy);
    setPlaceId(location.placeId);
    setLocationConfirmed(true);
    setShowMap(false);
  };

  const onSave = () => {
    setError(null);

    // §18, mirrored client side so the merchant is told before the request
    // rather than by it. The API enforces the same rule.
    if (form.live && form.latitude == null) {
      setError(
        'Confirm your shop location on the map before going live, or switch the shop off for now.',
      );
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (form.instagram.trim()) socialLinks.instagram = form.instagram.trim();
    if (form.whatsapp.trim()) socialLinks.whatsapp = form.whatsapp.trim();

    updateShop.mutate(
      {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        contactNumber: form.contactNumber.trim() || undefined,
        websiteUrl: form.websiteUrl.trim() || undefined,
        socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
        logoUrl: form.logoUrl,
        status: form.live ? 'active' : 'inactive',
        primaryBranch: {
          // A single-location shop has no branch name of its own, so it
          // borrows the shop's rather than being asked for another one.
          branchName: form.name.trim(),
          address: form.address.trim() || undefined,
          addressLine2: form.addressLine2.trim() || undefined,
          area: form.area.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim() || undefined,
          country: form.country.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          locationSource: form.latitude == null ? null : locationSource,
          locationAccuracy,
          placeId,
          locationConfirmed,
          isPrimary: true,
        },
      },
      {
        onSuccess: () => navigation.goBack(),
        onError: (err) => setError(getApiErrorMessage(err, 'Could not save your shop profile.')),
      },
    );
  };

  if (shop.isLoading) return <LoadingView />;

  return (
    <Screen>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>
          Shop Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        {/* §17: what is still missing, and whether the shop may go live. */}
        {profile ? (
          <View
            style={{
              padding: spacing.md,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              gap: spacing.xs,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
                Profile completeness
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
                {profile.percent}%
              </Text>
            </View>
            <View style={{ height: 8, borderRadius: 99, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
              <View style={{ width: `${profile.percent}%`, height: '100%', backgroundColor: colors.brand }} />
            </View>
            {profile.items.map((item) => (
              <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                <Ionicons
                  name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={15}
                  color={item.done ? colors.brand : colors.textSubtle}
                />
                <Text
                  style={{
                    color: item.done ? colors.text : colors.textMuted,
                    fontSize: fontSizes.xs,
                  }}
                >
                  {item.label}
                  {item.required && !item.done ? ' · required' : ''}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* §14: a shop can publish without a picture, so this never blocks. */}
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <Pressable
            onPress={pickLogo}
            disabled={uploading}
            style={{
              width: 108,
              height: 108,
              borderRadius: radii.md,
              backgroundColor: colors.surfaceAlt,
              borderWidth: 1,
              borderStyle: form.logoUrl ? 'solid' : 'dashed',
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {form.logoUrl ? (
              <Image source={{ uri: form.logoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Ionicons
                name={uploading ? 'hourglass-outline' : 'camera-outline'}
                size={26}
                color={colors.textMuted}
              />
            )}
          </Pressable>
          <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
            Shop picture / logo · optional
          </Text>
          {form.logoUrl ? (
            <Pressable onPress={() => set('logoUrl', null)} hitSlop={8}>
              <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>Remove picture</Text>
            </Pressable>
          ) : null}
        </View>

        <TextField label="Shop Name" value={form.name} onChangeText={(v) => set('name', v)} />
        <TextField
          label="Description"
          value={form.description}
          onChangeText={(v) => set('description', v)}
          multiline
          numberOfLines={3}
          placeholder="What the shop sells, in a sentence or two."
        />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Phone"
              value={form.contactNumber}
              onChangeText={(v) => set('contactNumber', v)}
              keyboardType="phone-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="WhatsApp"
              value={form.whatsapp}
              onChangeText={(v) => set('whatsapp', v)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TextField
          label="Website"
          value={form.websiteUrl}
          onChangeText={(v) => set('websiteUrl', v)}
          autoCapitalize="none"
          placeholder="https://"
        />
        <TextField
          label="Instagram"
          value={form.instagram}
          onChangeText={(v) => set('instagram', v)}
          autoCapitalize="none"
          placeholder="https://instagram.com/…"
        />

        {/* ---- Location (§4): required of every plan, Free included ------- */}
        <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>
          Shop location
        </Text>

        <TextField label="Address" value={form.address} onChangeText={(v) => set('address', v)} multiline />
        <TextField label="Address line 2" value={form.addressLine2} onChangeText={(v) => set('addressLine2', v)} />
        <TextField label="Area / locality" value={form.area} onChangeText={(v) => set('area', v)} placeholder="e.g. RS Puram" />

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField label="City" value={form.city} onChangeText={(v) => set('city', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Pincode"
              value={form.pincode}
              onChangeText={(v) => set('pincode', v)}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField label="State" value={form.state} onChangeText={(v) => set('state', v)} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Country" value={form.country} onChangeText={(v) => set('country', v)} />
          </View>
        </View>

        {/*
          The map is behind a tap rather than always mounted. It is the
          heaviest thing on the screen and most visits here are to change a
          phone number, not to move the shop.
        */}
        {showMap ? (
          <MapLocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            addressHint={
              form.latitude == null
                ? [form.address, form.area, form.city, form.state, form.pincode]
                    .filter(Boolean)
                    .join(', ')
                : ''
            }
            onConfirm={onLocationConfirmed}
          />
        ) : (
          <View style={{ gap: spacing.xxs }}>
            <Button
              label={form.latitude == null ? 'Locate on map' : 'Change location'}
              variant="secondary"
              onPress={() => setShowMap(true)}
              icon={<Ionicons name="map-outline" size={16} color={colors.text} />}
              fullWidth
            />
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
              {form.latitude == null
                ? 'A confirmed pin is what puts your shop in Near Me, distance and map search.'
                : `📍 ${form.latitude.toFixed(5)}, ${form.longitude?.toFixed(5)}`}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: spacing.sm }}>
            <Text style={{ color: colors.text, fontWeight: fontWeights.semibold }}>
              Shop is live
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs }}>
              Switch off to hide the shop from customers while you finish the profile.
            </Text>
          </View>
          <Switch
            value={form.live}
            onValueChange={(v) => set('live', v)}
            trackColor={{ false: colors.border, true: colors.brand }}
          />
        </View>

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        <Button
          label="Save Shop Profile"
          onPress={onSave}
          loading={updateShop.isPending}
          fullWidth
        />
      </ScrollView>
    </Screen>
  );
}
