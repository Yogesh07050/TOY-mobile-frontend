import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { Service } from '../types';
import { formatDistance } from '../utils/format';
import { formatServiceOfferChip, formatServicePriceLabel } from '../utils/serviceFormat';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  onToggleSave?: () => void;
  saving?: boolean;
  width?: number;
}

export function ServiceCard({ service, onPress, onToggleSave, saving, width }: ServiceCardProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const distanceLabel = formatDistance(service.distanceKm);
  const offerChip = formatServiceOfferChip(service);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        shadows.sm,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, width },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={service.imageUrl ? { uri: service.imageUrl } : undefined}
          style={[styles.image, { backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
          transition={150}
        />
        {offerChip ? (
          <View
            style={[
              styles.discountFlag,
              { backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: spacing.xs, top: spacing.xs, left: spacing.xs },
            ]}
          >
            <Text style={{ color: '#fff', fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>{offerChip}</Text>
          </View>
        ) : null}
        {onToggleSave ? (
          <Pressable
            onPress={onToggleSave}
            disabled={saving}
            hitSlop={8}
            style={[
              styles.saveBtn,
              {
                // White scrim guarantees contrast over a photo. With no photo the
                // area is a theme surface, so a fixed white pill fought dark mode.
                backgroundColor: service.imageUrl ? 'rgba(255,255,255,0.92)' : colors.surface,
                borderRadius: radii.pill,
                top: spacing.xs,
                right: spacing.xs,
              },
            ]}
          >
            <Ionicons name={service.isSaved ? 'heart' : 'heart-outline'} size={18} color={service.isSaved ? colors.accent : service.imageUrl ? '#3a3a3a' : colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <View style={{ padding: spacing.sm, gap: 4 }}>
        <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>
          {service.shop.name.toUpperCase()}
        </Text>
        <Text numberOfLines={2} style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold, lineHeight: fontSizes.md * 1.3 }}>
          {service.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, flexWrap: 'wrap' }}>
          {service.category ? (
            <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{service.category.name}</Text>
          ) : null}
          {distanceLabel ? (
            <>
              <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>·</Text>
              <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{distanceLabel}</Text>
            </>
          ) : null}
        </View>
        <Text style={{ color: colors.text, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>
          {formatServicePriceLabel(service)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    aspectRatio: 4 / 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountFlag: {
    position: 'absolute',
    paddingVertical: 3,
  },
  saveBtn: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
