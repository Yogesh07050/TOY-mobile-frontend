import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useAuth } from '../store/AuthContext';
import { useAuthPrompt } from '../store/AuthPromptContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export function NotificationBell() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const prompt = useAuthPrompt();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const unread = user?.unreadNotifications ?? 0;

  return (
    <Pressable
      onPress={() => {
        // §6: notifications are account-scoped, so a guest gets the invitation
        // rather than an empty list.
        if (prompt.require('notifications', () => navigation.navigate('Notifications'))) {
          navigation.navigate('Notifications');
        }
      }}
      hitSlop={8}
      style={{ padding: spacing.xxs }}
    >
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
