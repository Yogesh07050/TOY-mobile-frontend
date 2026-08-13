import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { Screen } from '../../components/ui';
import { PreferenceEditorForm } from '../../components/PreferenceEditorForm';
import { useSubmitPreferences } from '../../hooks/usePreferences';
import { getApiErrorMessage } from '../../api/client';
import { trackEvent } from '../../services/analytics/analyticsService';

export function PreferenceSetupScreen() {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const submitPreferences = useSubmitPreferences();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent({ event: 'PREFERENCE_ONBOARDING_STARTED' });
  }, []);

  return (
    <Screen>
      <PreferenceEditorForm
        initial={{ categoryIds: [], shopIds: [], minimumDiscountPercent: null, offerTypes: [] }}
        submitLabel="Show My Offers"
        submitting={submitPreferences.isPending}
        error={error}
        header={
          <View style={{ gap: spacing.xxs, marginBottom: spacing.xs }}>
            <Text style={{ color: colors.text, fontSize: fontSizes.xxl, fontWeight: fontWeights.bold }}>
              Personalize Your Offers
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSizes.md }}>
              Tell us what you like and we&rsquo;ll show you offers that matter to you.
            </Text>
          </View>
        }
        onSubmit={(payload) => {
          setError(null);
          submitPreferences.mutate(payload, {
            onError: (err) => setError(getApiErrorMessage(err, 'Could not save your preferences.')),
          });
        }}
      />
    </Screen>
  );
}
