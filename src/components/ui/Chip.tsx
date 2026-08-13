import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../../theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: spacing.sm,
        borderRadius: radii.pill,
        backgroundColor: selected ? colors.brand : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.brand : colors.border,
      }}
    >
      <Text
        style={{
          color: selected ? colors.textOnBrand : colors.textMuted,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
