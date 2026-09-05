import React from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { FeaturedPlacement } from '../types';
import { SectionHeader } from './SectionHeader';

interface FeaturedRailProps {
  title?: string;
  subtitle?: string;
  placements: FeaturedPlacement[];
  onPress: (placement: FeaturedPlacement, position: number) => void;
}

const CARD_WIDTH = Math.min(280, Dimensions.get('window').width * 0.74);

/**
 * A promotional rail (§6, §7, §11).
 *
 * ## Why every card says "Promoted"
 *
 * §11 requires featured content to be "clearly distinguishable from normal
 * organic results". A promoted card that looks exactly like an organic one is
 * not a design choice, it is a claim the platform cannot support: the customer
 * is being shown it because a merchant paid for the space, and §26's whole
 * premise is that customers keep trusting the marketplace.
 *
 * So the label is not optional, not a subtle tint, and not something a caller
 * can turn off - it is baked into the card. The tint reinforces it for people
 * who read shapes before words, but the word is what carries the meaning.
 *
 * ## What this rail does not do
 *
 * It does not sort, filter or cap. The server decided which campaigns occupy
 * the slot and in what order (§10's rotation), and re-ordering them here would
 * silently undo the fairness the rotation exists to produce.
 */
export function FeaturedRail({ title = 'Featured', subtitle, placements, onPress }: FeaturedRailProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();

  if (!placements.length) return null;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <SectionHeader title={title} subtitle={subtitle} />
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={placements}
        keyExtractor={(item) => `${item.featuredCampaignId}-${item.listingType}-${item.id}`}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onPress(item, index + 1)}
            accessibilityRole="button"
            // The label reaches screen readers too - "clearly distinguishable"
            // cannot mean "visually distinguishable only".
            accessibilityLabel={`Promoted: ${item.headline}, ${item.shop.name}`}
            style={[
              styles.card,
              shadows.sm,
              {
                width: CARD_WIDTH,
                backgroundColor: colors.surface,
                borderColor: colors.brand,
                borderRadius: radii.md,
              },
            ]}
          >
            <View style={styles.imageWrap}>
              <Image
                source={item.imageUrl ? { uri: item.imageUrl } : undefined}
                style={[styles.image, { backgroundColor: colors.surfaceAlt }]}
                contentFit="cover"
                transition={150}
              />
              <View
                style={[
                  styles.promoted,
                  { backgroundColor: colors.brand, borderRadius: radii.pill, paddingHorizontal: spacing.xs },
                ]}
              >
                <Ionicons name="megaphone" size={11} color={colors.textOnBrand} />
                <Text
                  style={{
                    color: colors.textOnBrand,
                    fontSize: fontSizes.xs,
                    fontWeight: fontWeights.bold,
                  }}
                >
                  Promoted
                </Text>
              </View>
            </View>

            <View style={{ padding: spacing.sm, gap: 2 }}>
              {item.promotionalMessage ? (
                <Text
                  numberOfLines={1}
                  style={{ color: colors.brand, fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}
                >
                  {item.promotionalMessage}
                </Text>
              ) : null}
              <Text
                numberOfLines={2}
                style={{ color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.semibold }}
              >
                {item.headline}
              </Text>
              <Text numberOfLines={1} style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
                {item.shop.name}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderWidth: 1.5 },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 130 },
  promoted: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
  },
});
