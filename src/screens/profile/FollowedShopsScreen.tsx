import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, EmptyState, LoadingView } from '../../components/ui';
import { ShopCard } from '../../components';
import { useFollowedShops, useToggleShopFollow } from '../../hooks/useFollowing';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'FollowedShops'>;

export function FollowedShopsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { data, isLoading } = useFollowedShops();
  const toggleFollow = useToggleShopFollow();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Favorite Shops</Text>
      </View>

      {isLoading ? (
        <LoadingView />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon="storefront-outline" title="No favorite shops yet" message="Follow shops to see their new offers here." />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={{ flex: 1 }}>
                <ShopCard shop={{ ...item, isFollowing: true }} onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })} />
              </View>
              <Pressable onPress={() => toggleFollow.mutate({ shopId: item.id, isFollowing: true })} hitSlop={8}>
                <Ionicons name="heart" size={22} color={colors.accent} />
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
