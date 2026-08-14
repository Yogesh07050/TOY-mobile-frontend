import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Screen, Button, TextField } from '../../components/ui';
import { changePassword } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from '../../utils/validators';
import type { GoBackScreenProps } from '../../navigation/types';

type Props = GoBackScreenProps;

export function ChangePasswordScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!currentPassword) nextErrors.currentPassword = 'Current password is required.';
    if (!isStrongPassword(password)) nextErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setLoading(true);
    try {
      await changePassword({ currentPassword, password, confirmPassword });
      setDone(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ color: colors.text, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
        {done ? (
          <>
            <Text style={{ color: colors.success, fontSize: fontSizes.md }}>Your password has been updated.</Text>
            <Button label="Done" onPress={() => navigation.goBack()} fullWidth />
          </>
        ) : (
          <>
            <TextField label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureToggle secureTextEntry leftIcon="lock-closed-outline" error={errors.currentPassword} />
            <TextField label="New Password" value={password} onChangeText={setPassword} secureToggle secureTextEntry leftIcon="lock-closed-outline" error={errors.password} />
            <TextField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} secureToggle secureTextEntry leftIcon="lock-closed-outline" error={errors.confirmPassword} />
            {submitError ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{submitError}</Text> : null}
            <Button label="Update Password" onPress={onSubmit} loading={loading} fullWidth />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
