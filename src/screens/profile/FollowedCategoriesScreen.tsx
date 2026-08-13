import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, LoadingView, Chip } from '../../components/ui';
import { useCategories } from '../../hooks/useCategories';
import { useFollowedCategories, useToggleCategoryFollow } from '../../hooks/useFollowing';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'FollowedCategories'>;

export function FollowedCategoriesScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const categories = useCategories();
  const followed = useFollowedCategories();
  const toggleFollow = useToggleCategoryFollow();

  const followedIds = new Set((followed.data ?? []).map((c) => c.id));

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.xs }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Preferred Categories</Text>
      </View>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        What are you interested in? Tap to follow a category and improve your recommendations.
      </Text>

      {categories.isLoading || followed.isLoading ? (
        <LoadingView />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {(categories.data ?? []).map((category) => {
            const isFollowing = followedIds.has(category.id);
            return (
              <Chip
                key={category.id}
                label={category.name}
                selected={isFollowing}
                onPress={() => toggleFollow.mutate({ categoryId: category.id, isFollowing })}
              />
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
