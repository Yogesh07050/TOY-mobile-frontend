import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Button } from './ui';
import { useAuthPrompt } from '../store/AuthPromptContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

/**
 * The login sheet from Guest Browsing §7.
 *
 * Mounted once above the navigator so any screen can raise it through
 * `useAuthPrompt` without carrying a modal of its own. A bottom sheet rather
 * than a pushed screen: the offer the guest was reading stays behind it, and
 * "Continue browsing" puts them straight back on it (§5, §28).
 */
export function AuthPromptSheet() {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const prompt = useAuthPrompt();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const copy = prompt.copy;
  const visible = copy !== null;

  // The intent stays pending across the navigation: it is what the auth screen
  // shows, and what gets replayed on the far side of the login (§7).
  const go = (screen: 'Login' | 'Register') => {
    prompt.dismiss();
    navigation.navigate(screen);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={prompt.dismiss}>
      <Pressable
        onPress={prompt.dismiss}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}
      >
        {/* Swallows taps so pressing inside the sheet does not dismiss it. */}
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: radii.lg,
            borderTopRightRadius: radii.lg,
            padding: spacing.lg,
            paddingBottom: spacing.lg + insets.bottom,
            gap: spacing.sm,
          }}
        >
          <View style={{ alignItems: 'center', gap: spacing.xxs }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.brandLight,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xxs,
              }}
            >
              <Ionicons name={copy?.icon as never} size={26} color={colors.brand} />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                textAlign: 'center',
              }}
            >
              {copy?.title}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSizes.md,
                textAlign: 'center',
                lineHeight: fontSizes.md * 1.4,
              }}
            >
              {copy?.message}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.sm }}>
            <Button label="Log In" onPress={() => go('Login')} style={{ flex: 1 }} />
            <Button label="Sign Up" variant="secondary" onPress={() => go('Register')} style={{ flex: 1 }} />
          </View>

          <Button label="Continue browsing" variant="ghost" onPress={prompt.dismiss} fullWidth />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
