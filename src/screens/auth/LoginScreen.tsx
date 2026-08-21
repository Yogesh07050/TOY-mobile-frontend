import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { Screen, TextField, Button } from '../../components/ui';
import { useAuth } from '../../store/AuthContext';
import { useAuthPrompt } from '../../store/AuthPromptContext';
import { getApiErrorMessage } from '../../api/client';
import { isValidEmail } from '../../utils/validators';
import type { AuthScreenProps } from '../../navigation/types';

type Props = AuthScreenProps<'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { colors, spacing, fontSizes, fontWeights } = useTheme();
  const { login } = useAuth();
  const prompt = useAuthPrompt();
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

      // §5/§7/§21, and the order here is the whole point.
      //
      // A guest raised this as a modal over the screen they were browsing, and
      // that screen is still mounted underneath (guest and customer render the
      // same navigator, so signing in reconciles rather than remounts). Two
      // things now have to happen, in this order:
      //
      //   1. pop this modal, so the screen underneath is on top again;
      //   2. replay the held action *from* that screen.
      //
      // Doing them in the other order lets the pop swallow whatever the replay
      // just pushed - a held "Claim offer" navigates to the claim screen and
      // then has it popped straight off again. Driving both from here, in this
      // order, is what keeps them straight; the provider's own effect is only a
      // fallback for sessions that begin somewhere other than this screen, and
      // `resumePending` clears the intent so it can never run twice.
      //
      // Merchants and brand-new accounts land on a different tree entirely,
      // which unmounts this screen - `canGoBack` is false there, so the pop is
      // skipped rather than becoming a stray back-navigation.
      if (navigation.canGoBack()) navigation.goBack();
      prompt.resumePending();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  /** Dropping the held intent stops it firing on some later, unrelated login. */
  const onCancel = () => {
    prompt.clearPending();
    navigation.goBack();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', gap: spacing.xxs, marginBottom: spacing.md }}>
          <Text style={{ fontSize: fontSizes.display, fontWeight: fontWeights.bold, color: colors.text }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: fontSizes.md, color: colors.textMuted, textAlign: 'center' }}>
            {prompt.pendingCopy?.message ?? 'Log in to save offers, follow shops and get expiry alerts.'}
          </Text>
        </View>

        {/* §7: name the action the guest started, so the login reads as a step
            inside it rather than as an obstacle in front of it. */}
        {prompt.pendingCopy ? (
          <View
            style={{
              backgroundColor: colors.brandTint,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 12,
              padding: spacing.sm,
            }}
          >
            <Text style={{ color: colors.text, fontSize: fontSizes.sm }}>
              {prompt.pendingCopy.title} — we&rsquo;ll finish this for you as soon as you log in.
            </Text>
          </View>
        ) : null}

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
            Create a free account
          </Text>
        </View>

        {/* §5: a guest raised this from inside the app and must be able to back
            out of it and keep browsing. */}
        {navigation.canGoBack() ? (
          <Button label="Continue browsing" variant="ghost" onPress={onCancel} fullWidth />
        ) : null}
      </ScrollView>
    </Screen>
  );
}
