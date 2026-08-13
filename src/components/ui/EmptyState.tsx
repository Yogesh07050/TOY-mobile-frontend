import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'file-tray-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xs }}>
      <Ionicons name={icon} size={40} color={colors.textSubtle} />
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, textAlign: 'center' }}>
        {title}
      </Text>
      {message ? (
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.base, textAlign: 'center' }}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={{ marginTop: spacing.xs }} />
      ) : null}
    </View>
  );
}
