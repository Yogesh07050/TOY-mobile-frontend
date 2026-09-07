import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Button } from './ui';
import { BrandMark } from './BrandMark';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

interface GuestGateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  /** Shown under the buttons; omit on screens where it would be redundant. */
  browseHint?: string;
}

/**
 * What a guest sees on the two account-shaped tabs (Guest Browsing §22, §23).
 *
 * The tabs stay in the bar and stay tappable - §21 keeps the same five tabs for
 * both audiences - so this is what fills them. It reads as an invitation with
 * the reason attached, not as an error or a locked door: the guest still has
 * three fully working tabs, and this one says what the fourth would do for
 * them.
 */
export function GuestGate({ icon, title, message, browseHint }: GuestGateProps) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={{ flex: 1 }}>
      {/*
        The mark sits top-left, where it sits on every other tab, rather than
        joining the centred block below.

        This is the one screen in the app that asks the guest for something, and
        the only one with no header of its own - so without this it was also the
        only screen that never said which app was doing the asking.

        Pinned outside the centred column deliberately: holding the same
        position as Offers, Services, Near Me and Saved is the point. A logo
        that jumps to the middle of the screen on one tab reads as a different
        screen rather than the same app.
      */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <BrandMark />
      </View>

      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md }}>
        <View style={{ alignItems: 'center', gap: spacing.xs }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radii.pill,
              backgroundColor: colors.brandLight,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={icon} size={30} color={colors.brand} />
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: fontSizes.xl,
              fontWeight: fontWeights.bold,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSizes.md,
              textAlign: 'center',
              lineHeight: fontSizes.md * 1.45,
            }}
          >
            {message}
          </Text>
        </View>

        <View style={{ gap: spacing.xs }}>
          <Button label="Log In" onPress={() => navigation.navigate('Login')} fullWidth />
          <Button
            label="Sign Up"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
            fullWidth
          />
        </View>

        {browseHint ? (
          <Text style={{ color: colors.textSubtle, fontSize: fontSizes.sm, textAlign: 'center' }}>
            {browseHint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
