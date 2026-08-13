import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, LoadingView } from '../../components/ui';
import { PreferenceEditorForm } from '../../components/PreferenceEditorForm';
import { usePreferences, useUpdatePreferences } from '../../hooks/usePreferences';
import { getApiErrorMessage } from '../../api/client';
import type { RootStackScreenProps } from '../../navigation/types';

type Props = RootStackScreenProps<'EditPreferences'>;

export function EditPreferencesScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { data: preferences, isLoading } = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const [error, setError] = useState<string | null>(null);

  return (
    <Screen>
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
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Preferences</Text>
      </View>

      {isLoading || !preferences ? (
        <LoadingView />
      ) : (
        <PreferenceEditorForm
          initial={preferences}
          submitLabel="Save Changes"
          submitting={updatePreferences.isPending}
          error={error}
          onSubmit={(payload) => {
            setError(null);
            updatePreferences.mutate(payload, {
              onSuccess: () => navigation.goBack(),
              onError: (err) => setError(getApiErrorMessage(err, 'Could not save your preferences.')),
            });
          }}
        />
      )}
    </Screen>
  );
}
