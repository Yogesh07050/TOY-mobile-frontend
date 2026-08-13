import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Screen, TextField, Button } from '../../components/ui';
import { forgotPassword } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { isValidEmail } from '../../utils/validators';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ gap: spacing.xxs, marginBottom: spacing.md }}>
          <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.bold, color: colors.text }}>
            Forgot password
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.textMuted }}>
            Enter your email and we'll send you a reset link.
          </Text>
        </View>

        {sent ? (
          <Text style={{ color: colors.success, fontSize: fontSizes.md }}>
            If an account exists for {email.trim()}, a reset link is on its way.
          </Text>
        ) : (
          <>
            <TextField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon="mail-outline"
              error={error ?? undefined}
            />
            <Button label="Send Reset Link" onPress={onSubmit} loading={loading} fullWidth />
          </>
        )}

        <Button label="Back to Login" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
    </Screen>
  );
}
