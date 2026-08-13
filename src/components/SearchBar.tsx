import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  editable?: boolean;
  onPress?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, onSubmit, placeholder = 'Search offers, shops, categories', editable = true, onPress, autoFocus }: SearchBarProps) {
  const { colors, radii, spacing, fontSizes } = useTheme();

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xxs,
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: radii.sm,
        paddingHorizontal: spacing.sm,
        height: 44,
      }}
    >
      <Ionicons name="search-outline" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        editable={editable}
        autoFocus={autoFocus}
        returnKeyType="search"
        style={{ flex: 1, color: colors.text, fontSize: fontSizes.md }}
      />
      {value.length > 0 && editable ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );

  if (!editable && onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}
