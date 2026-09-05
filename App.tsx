import 'react-native-gesture-handler';
import React from 'react';
import { AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/queryClient';
import { ThemeProvider, useTheme } from './src/theme';
import { AuthProvider } from './src/store/AuthContext';
import { AuthPromptProvider } from './src/store/AuthPromptContext';
import { PushNotificationsProvider } from './src/services/notifications/PushNotificationsProvider';
import { LocationProvider } from './src/services/location/LocationContext';
import { NetworkStatusProvider } from './src/store/NetworkStatusContext';
import { OfflineBanner } from './src/components/ui';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';
import { primeSessionIdentity } from './src/utils/session';
import { flushVisibility } from './src/services/analytics/visibilityService';

function AppShell() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.brand,
      background: colors.page,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* §36. Above the navigator so it is visible on every screen, and
          outside it so navigating does not dismiss it. */}
      <OfflineBanner />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  React.useEffect(() => {
    // Read the install id out of storage before the first request needs it, so
    // a cold start's opening screen is not reported without one (§18).
    primeSessionIdentity();

    // Visibility events are queued and flushed on a timer, so a customer who
    // backgrounds the app mid-interval would otherwise lose that screen's
    // impressions - which is exactly the screen they engaged with least.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') flushVisibility();
    });
    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            {/* Outermost of the app providers: every other one makes API
                calls, and all of them feed this the same reachability
                signal (§36). */}
            <NetworkStatusProvider>
              <LocationProvider>
                <AuthProvider>
                  {/* Inside AuthProvider: the prompt replays a guest's held
                      action the moment a session appears (§7). */}
                  <AuthPromptProvider>
                    {/* Inside AuthProvider too: a device is only registered for
                        push once there is an account to attach it to, and it is
                        re-registered on every sign-in (Push §30, §37). */}
                    <PushNotificationsProvider>
                      <AppShell />
                    </PushNotificationsProvider>
                  </AuthPromptProvider>
                </AuthProvider>
              </LocationProvider>
            </NetworkStatusProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
