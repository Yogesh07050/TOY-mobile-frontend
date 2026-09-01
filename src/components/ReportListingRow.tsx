import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { ReportableEntity } from '../types';

/**
 * "Report this offer" on a listing.
 *
 * Offers, services and shops are published by the merchants themselves, so a
 * customer needs a way to say when one is wrong, misleading, expired or worse.
 * The row carries the listing with it, so the report arrives already pointing
 * at the thing rather than describing it — which is the difference between a
 * report somebody can act on and one they have to go looking for.
 *
 * Deliberately quiet. Reporting matters, but it is not what most people opened
 * the page to do, and a prominent button invites idle tapping.
 *
 * `onReport` rather than a navigation prop: this renders inside three screens
 * that belong to two different stacks, and the caller already knows how to get
 * to the support form from where it is.
 */
export function ReportListingRow({
  kind,
  id,
  onReport,
}: {
  kind: ReportableEntity;
  id: number;
  onReport: (kind: ReportableEntity, id: number) => void;
}) {
  const { colors, spacing, fontSizes } = useTheme();
  const noun = kind === 'shop' ? 'shop' : kind === 'offer' ? 'offer' : 'service';

  return (
    <Pressable
      onPress={() => onReport(kind, id)}
      accessibilityRole="button"
      accessibilityLabel={`Report this ${noun}`}
      hitSlop={8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xxs,
        paddingVertical: spacing.sm,
      }}
    >
      <Ionicons name="warning-outline" size={14} color={colors.textSubtle} />
      <Text style={{ color: colors.textSubtle, fontSize: fontSizes.sm }}>Report this {noun}</Text>
    </Pressable>
  );
}
