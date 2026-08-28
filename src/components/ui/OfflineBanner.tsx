import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useNetworkStatus } from '../../store/NetworkStatusContext';

/**
 * The app-wide offline notice from §36.
 *
 * A strip under the status bar rather than a modal: §36's own promise is that
 * "some features may not be available", and cached listings, saved offers and
 * a claim code already on screen all keep working. Covering them would take
 * away more than the network did.
 *
 * It also confirms recovery for a few seconds. A banner that simply vanishes
 * leaves the customer unsure whether anything changed, which tends to produce
 * the retry they no longer need.
 */
export function OfflineBanner() {
  const { online, justReconnected } = useNetworkStatus();
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const insets = useSafeAreaInsets();

  if (online && !justReconnected) return null;

  const recovered = online && justReconnected;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xxs,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xs,
        paddingTop: insets.top + spacing.xs,
        backgroundColor: recovered ? colors.successBg : colors.warningBg,
      }}
    >
      <Ionicons
        name={recovered ? 'checkmark-circle-outline' : 'cloud-offline-outline'}
        size={16}
        color={recovered ? colors.success : colors.warning}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.medium,
          flexShrink: 1,
        }}
      >
        {recovered ? (
          'Back online.'
        ) : (
          <>
            <Text style={{ fontWeight: fontWeights.bold }}>You’re offline. </Text>
            Some features may not be available right now.
          </>
        )}
      </Text>
    </View>
  );
}
