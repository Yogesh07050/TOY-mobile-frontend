import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { Category } from '../types';

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  Food: 'fast-food-outline',
  Groceries: 'basket-outline',
  Clothing: 'shirt-outline',
  Footwear: 'footsteps-outline',
  Electronics: 'phone-portrait-outline',
  Beauty: 'sparkles-outline',
  Makeup: 'color-palette-outline',
  Jewellery: 'diamond-outline',
  Home: 'home-outline',
  Sports: 'basketball-outline',
  Travel: 'airplane-outline',
  Services: 'construct-outline',
  Others: 'grid-outline',
};

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  const iconName = ICON_MAP[category.name] ?? 'pricetag-outline';

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center', width: 76, gap: spacing.xxs }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: radii.lg,
          backgroundColor: colors.brandLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {category.imageUrl ? (
          <Image source={{ uri: category.imageUrl }} style={{ width: 56, height: 56, borderRadius: radii.lg }} contentFit="cover" />
        ) : (
          <Ionicons name={iconName} size={24} color={colors.brandStrong} />
        )}
      </View>
      <Text numberOfLines={1} style={{ color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.medium, textAlign: 'center' }}>
        {category.name}
      </Text>
    </Pressable>
  );
}
