import React from 'react';
import { useAuth } from '../store/AuthContext';
import { LoadingView } from '../components/ui';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { PreferenceSetupScreen } from '../screens/onboarding/PreferenceSetupScreen';

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingView />;

  if (!isAuthenticated) return <AuthNavigator />;

  // Mandatory once per account (V2 §2/§3) — gated on the backend-owned
  // preferences_completed flag, never a local flag, so it survives reinstalls
  // and can't be bypassed by clearing device storage.
  if (!user?.preferencesCompleted) return <PreferenceSetupScreen />;

  return <AppNavigator />;
}
