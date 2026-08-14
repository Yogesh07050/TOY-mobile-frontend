import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Button } from './ui';
import type { PlanUpgradeRequiredDetails } from '../types/admin';

interface UpgradePromptProps {
  details: PlanUpgradeRequiredDetails;
  onViewPlan: () => void;
  featureLabel?: string;
}

export function UpgradePrompt({ details, onViewPlan, featureLabel }: UpgradePromptProps) {
  const { colors, spacing, fontSizes, fontWeights, radii } = useTheme();

  return (
    <View
      style={{
        margin: spacing.md,
        padding: spacing.lg,
        borderRadius: radii.md,
        backgroundColor: colors.brandTint,
        borderWidth: 1,
        borderColor: colors.brandLight,
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      <Ionicons name="sparkles" size={28} color={colors.brandStrong} />
      <Text style={{ color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.bold }}>Premium Feature</Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSizes.md, textAlign: 'center' }}>
        {featureLabel ?? 'This feature is'} available on the {details.requiredPlanName} plan
        {details.requiredPlanPrice ? ` (₹${details.requiredPlanPrice}/month)` : ''}.
      </Text>
      <Button label="View Plan & Upgrade" onPress={onViewPlan} style={{ marginTop: spacing.xs }} />
    </View>
  );
}
