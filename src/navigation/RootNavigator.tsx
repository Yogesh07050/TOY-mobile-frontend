import React from 'react';
import { useAuth } from '../store/AuthContext';
import { ShopAdminProvider } from '../store/ShopAdminContext';
import { LoadingView } from '../components/ui';
import { AuthPromptSheet } from '../components/AuthPromptSheet';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { AdminNavigator } from './AdminNavigator';
import { PreferenceSetupScreen } from '../screens/onboarding/PreferenceSetupScreen';

/**
 * Which experience this launch gets (V3 §3/§4, Guest Browsing §20/§32).
 *
 * The order below is the whole access model in one function:
 *
 *   loading    -> spinner
 *   merchant   -> Shop Admin app        (always authenticated, §32)
 *   new account-> preference onboarding (once per account, V2 §2/§3)
 *   customer   -> the marketplace
 *   guest      -> the same marketplace, minus the account-scoped parts (§21)
 *   first run  -> Login / Sign Up  OR  Continue as Guest (§20)
 *
 * Guest and signed-in customers deliberately render the *same* `AppNavigator`
 * element. React then reconciles rather than remounts, so a guest who signs in
 * mid-browse keeps their navigation stack and comes back to the offer they were
 * reading (§29) instead of being dropped at the top of the app.
 */
export function RootNavigator() {
  const { isAuthenticated, isGuest, isLoading, user } = useAuth();

  if (isLoading) return <LoadingView />;

  // V3 §3/§4: a shop-team member (canAccessAdmin) gets the merchant experience,
  // never the plain customer one — Super Admin stays web-only per product
  // decision, so canAccessAdmin here only ever routes to the Shop Admin app.
  if (isAuthenticated && user?.canAccessAdmin) {
    return (
      <ShopAdminProvider>
        <AdminNavigator />
      </ShopAdminProvider>
    );
  }

  // Mandatory once per account (V2 §2/§3) — gated on the backend-owned
  // preferences_completed flag, never a local flag, so it survives reinstalls
  // and can't be bypassed by clearing device storage. Guests never see it:
  // there is no account to attach the preferences to.
  if (isAuthenticated && !user?.preferencesCompleted) return <PreferenceSetupScreen />;

  if (isAuthenticated || isGuest) {
    return (
      <>
        <AppNavigator />
        {/* Above the navigator so the sheet covers whichever screen raised it. */}
        <AuthPromptSheet />
      </>
    );
  }

  return <AuthNavigator />;
}
