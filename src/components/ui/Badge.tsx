import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme';

export type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
}

export function Badge({ label, tone = 'default', icon }: BadgeProps) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();

  const toneStyles: Record<BadgeTone, { bg: string; fg: string }> = {
    default: { bg: colors.surfaceAlt, fg: colors.textMuted },
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    info: { bg: colors.infoBg, fg: colors.info },
    brand: { bg: colors.brandLight, fg: colors.brandStrong },
  };
  const { bg, fg } = toneStyles[tone];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: bg,
        borderRadius: radii.pill,
        paddingVertical: 3,
        paddingHorizontal: spacing.xs,
        alignSelf: 'flex-start',
      }}
    >
      {icon}
      <Text style={{ color: fg, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>{label}</Text>
    </View>
  );
}
