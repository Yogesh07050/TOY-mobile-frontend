import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  style,
  icon,
  fullWidth,
}: ButtonProps) {
  const { colors, radii, spacing, fontSizes, fontWeights, shadows } = useTheme();
  const isDisabled = disabled || loading;
  const paddingVertical = size === 'sm' ? spacing.xxs + 2 : spacing.xs + 2;
  const paddingHorizontal = size === 'sm' ? spacing.sm : spacing.md + 2;

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.textOnBrand : colors.text}
        />
      ) : (
        <>
          {icon}
          <Text
            style={{
              color:
                variant === 'primary'
                  ? colors.textOnBrand
                  : variant === 'danger'
                    ? '#ffffff'
                    : variant === 'secondary'
                      ? colors.text
                      : colors.textMuted,
              fontSize: size === 'sm' ? fontSizes.sm : fontSizes.base,
              fontWeight: fontWeights.semibold,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </>
  );

  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingVertical,
    paddingHorizontal,
    borderRadius: radii.sm,
    opacity: isDisabled ? 0.55 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={[shadows.brand, style]}>
        <LinearGradient
          colors={colors.gradientBrand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyle: ViewStyle =
    variant === 'secondary'
      ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong, ...shadows.sm }
      : variant === 'danger'
        ? { backgroundColor: colors.danger }
        : { backgroundColor: 'transparent' };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, baseStyle, variantStyle, style]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {},
});
