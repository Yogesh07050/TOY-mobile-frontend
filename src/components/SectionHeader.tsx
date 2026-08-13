import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel = 'See all', onAction }: SectionHeaderProps) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.xs,
      }}
    >
      <View style={{ gap: 2, flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>{subtitle}</Text> : null}
      </View>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ color: colors.brand, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
