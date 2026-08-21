import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { Screen, TextField, Button } from '../../components/ui';
import { resetPassword } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from '../../utils/validators';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [token, setToken] = useState(route?.params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!token.trim()) nextErrors.token = 'Reset token is required.';
    if (!isStrongPassword(password)) {
      nextErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    }
    if (confirmPassword !== password) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setLoading(true);
    try {
      await resetPassword({ token: token.trim(), password, confirmPassword });
      setDone(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ gap: spacing.xxs, marginBottom: spacing.md }}>
          <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.bold, color: colors.text }}>
            Reset password
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.textMuted }}>
            Paste the reset code from your email and choose a new password.
          </Text>
        </View>

        {done ? (
          <>
            <Text style={{ color: colors.success, fontSize: fontSizes.md }}>
              Your password has been reset. You can now log in.
            </Text>
            <Button label="Back to Login" onPress={() => navigation.navigate('Login')} fullWidth />
          </>
        ) : (
          <>
            <TextField
              label="Reset Code"
              placeholder="Paste the code from your email"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              error={errors.token}
            />
            <TextField
              label="New Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureToggle
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />
            <TextField
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureToggle
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
            />
            {submitError ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{submitError}</Text> : null}
            <Button label="Reset Password" onPress={onSubmit} loading={loading} fullWidth />
            <Button label="Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
