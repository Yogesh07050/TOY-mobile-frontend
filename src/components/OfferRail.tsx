import React from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { Offer } from '../types';
import { OfferCard } from './OfferCard';
import { SectionHeader } from './SectionHeader';

interface OfferRailProps {
  title: string;
  subtitle?: string;
  offers: Offer[];
  loading?: boolean;
  onOfferPress: (offer: Offer) => void;
  onToggleSave: (offer: Offer) => void;
  onSeeAll?: () => void;
  emptyMessage?: string;
}

const CARD_WIDTH = Math.min(200, Dimensions.get('window').width * 0.52);

export function OfferRail({ title, subtitle, offers, loading, onOfferPress, onToggleSave, onSeeAll, emptyMessage }: OfferRailProps) {
  const { colors, spacing, fontSizes } = useTheme();

  if (!loading && offers.length === 0) {
    if (!emptyMessage) return null;
    return (
      <View style={{ marginBottom: spacing.lg }}>
        <SectionHeader title={title} subtitle={subtitle} onAction={undefined} />
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, paddingHorizontal: spacing.md }}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <SectionHeader title={title} subtitle={subtitle} onAction={onSeeAll} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={loading ? [] : offers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <OfferCard
            offer={item}
            width={CARD_WIDTH}
            onPress={() => onOfferPress(item)}
            onToggleSave={() => onToggleSave(item)}
          />
        )}
      />
    </View>
  );
}
