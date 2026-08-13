import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { Screen, TextField, Button } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { getApiErrorMessage } from '../../api/client';
import { isStrongPassword, isValidEmail, PASSWORD_REQUIREMENTS_MESSAGE } from '../../utils/validators';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export function RegisterScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { register } = useAuth();
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async () => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!isStrongPassword(form.password)) {
      nextErrors.password = PASSWORD_REQUIREMENTS_MESSAGE;
    }
    if (form.confirmPassword !== form.password) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError(null);
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone.trim() || undefined,
        acceptedTerms: true,
      });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Could not create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ gap: spacing.xxs, marginBottom: spacing.md }}>
          <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.bold, color: colors.text }}>
            Create your account
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.textMuted }}>
            Save offers, follow shops, and never miss a deal.
          </Text>
        </View>

        <TextField label="Name" placeholder="Full name" value={form.name} onChangeText={update('name')} leftIcon="person-outline" error={errors.name} />
        <TextField
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChangeText={update('email')}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail-outline"
          error={errors.email}
        />
        <TextField
          label="Phone (optional)"
          placeholder="Phone number"
          value={form.phone}
          onChangeText={update('phone')}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />
        <TextField
          label="Password"
          placeholder="Aa1... at least 8 characters"
          value={form.password}
          onChangeText={update('password')}
          secureToggle
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.password}
        />
        <TextField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChangeText={update('confirmPassword')}
          secureToggle
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.confirmPassword}
        />

        {submitError ? <Text style={{ color: colors.danger, fontSize: fontSizes.sm }}>{submitError}</Text> : null}

        <Button label="Create Account" onPress={onSubmit} loading={loading} fullWidth />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xxs, marginTop: spacing.sm }}>
          <Text style={{ color: colors.textMuted }}>Already have an account?</Text>
          <Text style={{ color: colors.brand, fontWeight: fontWeights.semibold }} onPress={() => navigation.navigate('Login')}>
            Log in
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
