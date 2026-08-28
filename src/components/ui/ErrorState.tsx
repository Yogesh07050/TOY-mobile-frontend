import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Button } from './Button';

/**
 * §37, §52 and §53: the Error and Retry states, as a screen-level block.
 *
 * The sibling of `EmptyState`. The distinction matters and is worth keeping
 * visible in the component names: empty means "we asked and there is nothing",
 * error means "we could not ask". Rendering a failure as an empty state is how
 * an outage gets mistaken for a shop with no offers.
 *
 * `message` is expected to come from `getApiErrorMessage`, which has already
 * turned whatever went wrong into a sentence with no status code in it.
 */
export function ErrorState({
  title,
  message,
  offline = false,
  onRetry,
  retryLabel = 'Try again',
  reference = null,
  secondaryLabel,
  onSecondary,
}: {
  title?: string;
  message: string;
  /** Changes the glyph and the default title; no server was reached. */
  offline?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  /** The support reference from a 5xx, when the server issued one (§57). */
  reference?: string | null;
  /** An escape hatch beside Retry - "Select location", "Choose another image". */
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();

  const heading = title ?? (offline ? 'You’re offline.' : 'Something went wrong.');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xs }}>
      <Ionicons
        name={offline ? 'cloud-offline-outline' : 'alert-circle-outline'}
        size={40}
        color={offline ? colors.warning : colors.danger}
      />
      <Text
        style={{
          color: colors.text,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          textAlign: 'center',
        }}
      >
        {heading}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.base, textAlign: 'center' }}>
        {message}
      </Text>

      <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
        {onRetry ? <Button label={retryLabel} onPress={onRetry} variant="secondary" /> : null}
        {secondaryLabel && onSecondary ? (
          <Button label={secondaryLabel} onPress={onSecondary} variant="secondary" />
        ) : null}
      </View>

      {/* §57. Offered as something to quote, not something to understand. */}
      {reference ? (
        <Text
          selectable
          style={{ color: colors.textSubtle, fontSize: fontSizes.sm, marginTop: spacing.xxs }}
        >
          Reference: {reference}
        </Text>
      ) : null}
    </View>
  );
}
