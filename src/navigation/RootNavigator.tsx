import React from 'react';
import { useAuth } from '../store/AuthContext';
import { LoadingView } from '../components/ui';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingView />;

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}
