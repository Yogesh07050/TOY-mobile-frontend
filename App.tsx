import 'react-native-gesture-handler';
import React from 'react';
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
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/linking';

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
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <LocationProvider>
              <AuthProvider>
                {/* Inside AuthProvider: the prompt replays a guest's held action
                    the moment a session appears (§7). */}
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
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
