import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Avatar } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import type { MainTabScreenProps } from '../../navigation/types';

type Props = MainTabScreenProps<'Profile'>;

interface Row {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

export function ProfileScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const accountRows: Row[] = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'lock-closed-outline', label: 'Change Password', onPress: () => navigation.navigate('ChangePassword') },
    { icon: 'location-outline', label: 'Preferred Location', onPress: () => navigation.navigate('SelectLocation') },
    { icon: 'pricetags-outline', label: 'Preferred Categories', onPress: () => navigation.navigate('FollowedCategories') },
    { icon: 'storefront-outline', label: 'Favorite Shops', onPress: () => navigation.navigate('FollowedShops') },
  ];

  const preferenceRows: Row[] = [
    { icon: 'notifications-outline', label: 'Notification Preferences', onPress: () => navigation.navigate('NotificationPreferences') },
    { icon: 'color-palette-outline', label: 'Theme', onPress: () => navigation.navigate('ThemeSettings') },
  ];

  const otherRows: Row[] = [
    { icon: 'log-out-outline', label: 'Logout', onPress: confirmLogout, destructive: true },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Avatar uri={user?.avatarUrl} name={user?.name} size={64} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>{user?.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{user?.email}</Text>
            {user?.phone ? <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{user.phone}</Text> : null}
          </View>
        </View>

        <RowGroup title="Account" rows={accountRows} />
        <RowGroup title="Preferences" rows={preferenceRows} />
        <RowGroup rows={otherRows} />

        <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs, textAlign: 'center' }}>Offers App · v1.0.0</Text>
      </ScrollView>
    </Screen>
  );
}

function RowGroup({ title, rows }: { title?: string; rows: Row[] }) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  return (
    <View style={{ gap: spacing.xxs }}>
      {title ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, textTransform: 'uppercase', marginBottom: 2 }}>
          {title}
        </Text>
      ) : null}
      <View style={{ borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', backgroundColor: colors.surface }}>
        {rows.map((row, index) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              padding: spacing.sm,
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: colors.border,
            }}
          >
            <Ionicons name={row.icon} size={18} color={row.destructive ? colors.danger : colors.textMuted} />
            <Text style={{ flex: 1, color: row.destructive ? colors.danger : colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.medium }}>
              {row.label}
            </Text>
            {!row.destructive ? <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
