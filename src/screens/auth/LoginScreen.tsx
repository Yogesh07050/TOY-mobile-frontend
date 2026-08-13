import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Screen, TextField, Button } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { getApiErrorMessage } from '../../api/client';
import { isValidEmail } from '../../utils/validators';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!isValidEmail(email)) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.xxs, marginBottom: spacing.md }}>
          <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.bold, color: colors.text }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center' }}>
            Log in to discover offers near you.
          </Text>
        </View>

        <TextField
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.email}
        />
        <TextField
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureToggle
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.password}
        />

        {submitError ? (
          <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{submitError}</Text>
        ) : null}

        <Button label="Log In" onPress={onSubmit} loading={loading} fullWidth />

        <Button
          label="Forgot password?"
          variant="ghost"
          onPress={() => navigation.navigate('ForgotPassword')}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xxs, marginTop: spacing.sm }}>
          <Text style={{ color: colors.textMuted }}>New here?</Text>
          <Text
            style={{ color: colors.brand, fontWeight: fontWeights.semibold }}
            onPress={() => navigation.navigate('Register')}
          >
            Create an account
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
