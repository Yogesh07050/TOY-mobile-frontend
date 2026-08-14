import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  width?: number | `${number}%`;
}

export function MetricCard({ label, value, icon, tone = 'default', width }: MetricCardProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const toneColor = { default: colors.brand, success: colors.success, warning: colors.warning, danger: colors.danger }[tone];

  return (
    <View
      style={[
        shadows.sm,
        {
          width,
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.sm,
          gap: 4,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={14} color={toneColor} /> : null}
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>{label}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>{value}</Text>
    </View>
  );
}
