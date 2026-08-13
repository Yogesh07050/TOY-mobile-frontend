import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, TextField, Avatar } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { uploadAvatar } from '../../api/uploads';
import { getApiErrorMessage } from '../../api/client';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
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
      const uploaded = await uploadAvatar(asset.uri, asset.fileName ?? 'avatar.jpg', asset.mimeType ?? 'image/jpeg');
      setAvatarUrl(uploaded.url);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upload photo.'));
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim() || undefined, avatarUrl: avatarUrl ?? undefined });
      navigation.goBack();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        <Pressable onPress={pickAvatar} style={{ alignItems: 'center', gap: spacing.xs }}>
          <View>
            <Avatar uri={avatarUrl} name={name} size={88} />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="camera" size={14} color={colors.textOnBrand} />
            </View>
          </View>
          <Text style={{ color: colors.brand, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
            {uploading ? 'Uploading…' : 'Change Photo'}
          </Text>
        </Pressable>

        <TextField label="Name" value={name} onChangeText={setName} leftIcon="person-outline" />
        <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="call-outline" />
        <TextField label="Email" value={user?.email ?? ''} editable={false} leftIcon="mail-outline" />

        {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{error}</Text> : null}

        <Button label="Save Changes" onPress={onSave} loading={saving} fullWidth />
      </ScrollView>
    </Screen>
  );
}
