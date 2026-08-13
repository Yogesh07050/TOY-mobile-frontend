import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import type { Banner } from '../types';

interface BannerCarouselProps {
  banners: Banner[];
  onPress: (banner: Banner) => void;
  onImpression?: (banner: Banner) => void;
}

const H_PADDING = 16;

export function BannerCarousel({ banners, onPress, onImpression }: BannerCarouselProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth - H_PADDING * 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const seenImpressions = useRef(new Set<number>());

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
    const banner = banners[index];
    if (banner && !seenImpressions.current.has(banner.id)) {
      seenImpressions.current.add(banner.id);
      onImpression?.(banner);
    }
  };

  if (banners.length === 0) return null;

  return (
    <View>
      <FlatList
        data={banners}
        horizontal
        pagingEnabled
        snapToInterval={cardWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PADDING }}
        keyExtractor={(item) => String(item.id)}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onPress(item)}
            style={[styles.card, shadows.md, { width: cardWidth, borderRadius: radii.md }]}
          >
            <Image
              source={{ uri: item.mobileImageUrl || item.imageUrl || item.offerImageUrl || undefined }}
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md }]}
              contentFit="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.65)']}
              style={[StyleSheet.absoluteFill, { borderRadius: radii.md }]}
            />
            <View style={{ padding: spacing.md, justifyContent: 'flex-end', flex: 1, gap: 4 }}>
              {item.subtitle ? (
                <Text style={{ color: '#fde68a', fontSize: fontSizes.sm, fontWeight: fontWeights.bold }}>
                  {item.subtitle}
                </Text>
              ) : null}
              <Text style={{ color: '#fff', fontSize: fontSizes.xl, fontWeight: fontWeights.bold }} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>
                {item.shop.name}
              </Text>
            </View>
          </Pressable>
        )}
      />
      {banners.length > 1 ? (
        <View style={styles.dots}>
          {banners.map((b, i) => (
            <View
              key={b.id}
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                borderRadius: radii.pill,
                backgroundColor: i === activeIndex ? colors.brand : colors.border,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    aspectRatio: 16 / 9,
    overflow: 'hidden',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
});
