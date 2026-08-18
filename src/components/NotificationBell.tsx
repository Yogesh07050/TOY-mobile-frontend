import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAuth } from '../store/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export function NotificationBell() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unread = user?.unreadNotifications ?? 0;

  return (
    <Pressable onPress={() => navigation.navigate('Notifications')} hitSlop={8} style={{ padding: spacing.xxs }}>
      <View>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {unread > 0 ? (
          <View
            style={{
              position: 'absolute',
              top: -1,
              right: -1,
              width: 9,
              height: 9,
              borderRadius: 5,
              backgroundColor: colors.danger,
              borderWidth: 1,
              borderColor: colors.surface,
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
