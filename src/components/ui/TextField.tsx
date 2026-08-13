import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function TextField({ label, error, secureToggle, leftIcon, secureTextEntry, style, ...rest }: TextFieldProps) {
  const { colors, radii, spacing, fontSizes, fontWeights } = useTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xxs / 2 }}>
      {label ? (
        <Text style={{ color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold }}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.brand : error ? colors.danger : colors.border,
            borderRadius: radii.sm,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={colors.textMuted} /> : null}
        <TextInput
          {...rest}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.input,
            { color: colors.text, fontSize: fontSizes.md },
            style,
          ]}
        />
        {secureToggle ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={{ color: colors.danger, fontSize: fontSizes.xs }}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
});
