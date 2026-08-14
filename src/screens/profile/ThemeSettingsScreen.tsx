import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { ThemePreference } from '../../theme';
import { Screen } from '../../components/ui';
import type { GoBackScreenProps } from '../../navigation/types';

type Props = GoBackScreenProps;

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'system', label: 'System Default', icon: 'phone-portrait-outline' },
];

export function ThemeSettingsScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights, radii, preference, setPreference } = useTheme();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Theme</Text>
      </View>

      <View style={{ paddingHorizontal: spacing.md, gap: spacing.xs }}>
        {OPTIONS.map((opt) => {
          const selected = preference === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setPreference(opt.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: selected ? colors.brand : colors.border,
                backgroundColor: selected ? colors.brandTint : colors.surface,
              }}
            >
              <Ionicons name={opt.icon} size={20} color={selected ? colors.brandStrong : colors.textMuted} />
              <Text style={{ flex: 1, color: colors.text, fontSize: fontSizes.md, fontWeight: fontWeights.medium }}>{opt.label}</Text>
              {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.brand} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
