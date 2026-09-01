import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

/**
 * The back-arrow-and-title row every pushed screen in this app opens with.
 *
 * Five new screens land here at once, and writing that row five times is how
 * the fifth one ends up with different padding. Kept local to this folder
 * rather than promoted into `components/ui`: the existing screens each inline
 * their own, and rewriting all of them to adopt this is a change to code these
 * pages have no business touching.
 */
export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        marginBottom: spacing.sm,
      }}
    >
      <Pressable onPress={onBack} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text
        style={{ flex: 1, color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
