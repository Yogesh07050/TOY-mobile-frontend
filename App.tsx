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
import { LocationProvider } from './src/services/location/LocationContext';
import { RootNavigator } from './src/navigation/RootNavigator';

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
    <NavigationContainer theme={navigationTheme}>
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
                  <AppShell />
                </AuthPromptProvider>
              </AuthProvider>
            </LocationProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
