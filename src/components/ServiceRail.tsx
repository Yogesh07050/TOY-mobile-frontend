import React from 'react';
import { Dimensions, FlatList, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { Service } from '../types';
import { ServiceCard } from './ServiceCard';
import { SectionHeader } from './SectionHeader';

interface ServiceRailProps {
  title: string;
  subtitle?: string;
  services: Service[];
  loading?: boolean;
  onServicePress: (service: Service) => void;
  onToggleSave: (service: Service) => void;
  onSeeAll?: () => void;
  emptyMessage?: string;
}

const CARD_WIDTH = Math.min(200, Dimensions.get('window').width * 0.52);

export function ServiceRail({ title, subtitle, services, loading, onServicePress, onToggleSave, onSeeAll, emptyMessage }: ServiceRailProps) {
  const { colors, spacing, fontSizes } = useTheme();

  if (!loading && services.length === 0) {
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
        data={loading ? [] : services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            width={CARD_WIDTH}
            onPress={() => onServicePress(item)}
            onToggleSave={() => onToggleSave(item)}
          />
        )}
      />
    </View>
  );
}
