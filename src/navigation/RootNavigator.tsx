import React from 'react';
import { useAuth } from '../store/AuthContext';
import { ShopAdminProvider } from '../store/ShopAdminContext';
import { LoadingView } from '../components/ui';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AdminNavigator } from './AdminNavigator';
import { PreferenceSetupScreen } from '../screens/onboarding/PreferenceSetupScreen';

export function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingView />;

  if (!isAuthenticated) return <AuthNavigator />;

  // V3 §3/§4: a shop-team member (canAccessAdmin) gets the merchant experience,
  // never the plain customer one — Super Admin stays web-only per product
  // decision, so canAccessAdmin here only ever routes to the Shop Admin app.
  if (user?.canAccessAdmin) {
    return (
      <ShopAdminProvider>
        <AdminNavigator />
      </ShopAdminProvider>
    );
  }

  // Mandatory once per account (V2 §2/§3) — gated on the backend-owned
  // preferences_completed flag, never a local flag, so it survives reinstalls
  // and can't be bypassed by clearing device storage.
  if (!user?.preferencesCompleted) return <PreferenceSetupScreen />;

  return <AppNavigator />;
}
