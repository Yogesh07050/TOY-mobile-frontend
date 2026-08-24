import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { Button } from './ui';

/**
 * The value explanation from Push §5.
 *
 *   Browses offers -> sees why notifications help -> [Enable] -> OS dialog
 *
 * The point of asking twice is that only the second dialog is unrepeatable: on
 * iOS the system prompt can be shown exactly once per install, so spending it
 * on a launch screen - before the customer has saved anything - trades the
 * whole feature for a decision made with no context. This sheet is the cheap,
 * repeatable half, and it is what earns the expensive one.
 *
 * "Not now" is a complete answer, not a deferral: the customer keeps using the
 * app and can turn notifications on later from notification settings.
 */
export function PushPermissionSheet({
  visible,
  onAnswer,
}: {
  visible: boolean;
  onAnswer: (accepted: boolean) => void;
}) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => onAnswer(false)}>
      <Pressable
        onPress={() => onAnswer(false)}
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
              <Ionicons name="notifications-outline" size={26} color={colors.brand} />
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: fontSizes.xl,
                fontWeight: fontWeights.bold,
                textAlign: 'center',
              }}
            >
              Never miss a saved offer
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSizes.md,
                textAlign: 'center',
                lineHeight: fontSizes.md * 1.4,
              }}
            >
              Get notified when your saved offers are about to expire, and when shops you follow post
              something new.
            </Text>
          </View>

          <Button label="Enable Notifications" onPress={() => onAnswer(true)} fullWidth style={{ marginTop: spacing.sm }} />
          <Button label="Not now" variant="ghost" onPress={() => onAnswer(false)} fullWidth />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
