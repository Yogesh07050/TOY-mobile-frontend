import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { UnifiedListing } from '../types';
import { formatDistance } from '../utils/format';
import { useToggleFavorite } from '../hooks/useFavorites';
import { useToggleSavedService } from '../hooks/useSavedServices';
import { useAuthPrompt } from '../store/AuthPromptContext';
import { Badge } from './ui/Badge';

interface UnifiedListingCardProps {
  listing: UnifiedListing;
  onPress: (listing: UnifiedListing) => void;
  width?: number;
}

function headlineFor(listing: UnifiedListing): string {
  if (listing.offerText) return listing.offerText;
  if (listing.discountType === 'percentage' && listing.discountValue != null) return `${listing.discountValue}% OFF`;
  if (listing.discountType === 'flat' && listing.discountValue != null) return `₹${listing.discountValue} OFF`;
  return 'Special Offer';
}

export function UnifiedListingCard({ listing, onPress, width }: UnifiedListingCardProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const toggleFavorite = useToggleFavorite();
  const toggleSavedService = useToggleSavedService();
  const prompt = useAuthPrompt();
  const distanceLabel = formatDistance(listing.distanceKm);
  const isProduct = listing.sourceType === 'product';

  const onToggleSave = () => {
    // §5: this card appears on the guest home screen, so the heart raises the
    // sheet rather than firing a request that could only come back 401.
    const intent = isProduct ? 'save-offer' : 'save-service';
    if (!prompt.require(intent, onToggleSave)) return;

    if (isProduct) {
      toggleFavorite.mutate({ offerId: listing.id, isFavorite: listing.isSaved });
    } else if (listing.serviceId != null) {
      toggleSavedService.mutate({ serviceId: listing.serviceId, isSaved: listing.isSaved });
    }
  };

  return (
    <Pressable
      onPress={() => onPress(listing)}
      style={[
        styles.card,
        shadows.sm,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, width },
      ]}
    >
      <View style={styles.imageWrap}>
        <Image
          source={listing.imageUrl ? { uri: listing.imageUrl } : undefined}
          style={[styles.image, { backgroundColor: colors.surfaceAlt }]}
          contentFit="cover"
          transition={150}
        />
        <View style={[styles.typeBadge, { top: spacing.xs, left: spacing.xs }]}>
          <Badge label={isProduct ? 'Product' : 'Service'} tone={isProduct ? 'info' : 'brand'} />
        </View>
        <Pressable
          onPress={onToggleSave}
          hitSlop={8}
          style={[
            styles.saveBtn,
            {
                // White scrim guarantees contrast over a photo. With no photo the
                // area is a theme surface, so a fixed white pill fought dark mode.
                backgroundColor: listing.imageUrl ? 'rgba(255,255,255,0.92)' : colors.surface,
                borderRadius: radii.pill,
                top: spacing.xs,
                right: spacing.xs,
              },
          ]}
        >
          <Ionicons name={listing.isSaved ? 'heart' : 'heart-outline'} size={18} color={listing.isSaved ? colors.accent : listing.imageUrl ? '#3a3a3a' : colors.textMuted} />
        </Pressable>
      </View>

      <View style={{ padding: spacing.sm, gap: 4 }}>
        <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: fontSizes.xs, fontWeight: fontWeights.semibold }}>
          {listing.shop.name.toUpperCase()}
        </Text>
        <Text numberOfLines={2} style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.bold, lineHeight: fontSizes.md * 1.3 }}>
          {listing.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, flexWrap: 'wrap' }}>
          <Text style={{ color: colors.accent, fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>{headlineFor(listing)}</Text>
          {distanceLabel ? (
            <>
              <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>·</Text>
              <Text style={{ color: colors.textSubtle, fontSize: fontSizes.xs }}>{distanceLabel}</Text>
            </>
          ) : null}
        </View>
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
  typeBadge: {
    position: 'absolute',
  },
  saveBtn: {
    position: 'absolute',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
