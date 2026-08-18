import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import { refreshSession, setSessionExpiredHandler } from '../api/client';
import { clearTokens, getTokens, setTokens } from '../services/auth/tokenStorage';
import type { AuthResult, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (payload: authApi.RegisterPayload) => Promise<void>;
  login: (payload: authApi.LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: usersApi.UpdateMePayload) => Promise<void>;
}

/** Where the customer lands after signing in, decided by the backend's roles (§24). */
export function landingFor(user: User | null): 'admin' | 'customer' | 'onboarding' | 'auth' {
  if (!user) return 'auth';
  if (user.canAccessAdmin) return 'admin';
  return user.preferencesCompleted ? 'customer' : 'onboarding';
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResult = useCallback(async (result: AuthResult) => {
    await setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser(result.user);
  }, []);

  const clearSession = useCallback(async () => {
    await clearTokens();
    setUser(null);
    // §25.4 / §26: a revoked or expired session must not leave the previous
    // user's offers, claims or analytics readable from cache.
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void clearSession();
    });
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  /**
   * Automatic authentication on app start (§23).
   *
   *   secure storage -> refresh token present? -> validate/refresh -> home
   *
   * A stored refresh token is enough to resume: the access token in storage is
   * usually already expired after the app has been closed for a while, so a
   * failed /me is answered with a refresh rather than a trip to the login
   * screen. Only an outright rejection ends the session (§19).
   */
  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens) return;

        try {
          setUser(await authApi.fetchMe());
        } catch (error) {
          // The client interceptor already retried once; reaching here with a
          // live refresh token means the access token was rejected before it
          // could. Try explicitly, then give up.
          const refreshed = await refreshSession();
          if (!refreshed) throw error;
          setUser(await authApi.fetchMe());
        }
      } catch {
        await clearTokens().catch(() => {});
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register = useCallback(
    async (payload: authApi.RegisterPayload) => {
      const result = await authApi.register(payload);
      await handleAuthResult(result);
    },
    [handleAuthResult],
  );

  const login = useCallback(
    async (payload: authApi.LoginPayload) => {
      const result = await authApi.login(payload);
      await handleAuthResult(result);
    },
    [handleAuthResult],
  );

  /**
   * Ends the persistent session (§25): revoke server-side, clear secure
   * storage, then drop every cached response so the next account that signs in
   * on this device never sees the previous one's data.
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout — clear the local session regardless.
    }
    await clearSession();
    queryClient.clear();
  }, [clearSession, queryClient]);

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchMe();
    setUser(me);
  }, []);

  const updateProfile = useCallback(async (payload: usersApi.UpdateMePayload) => {
    const updated = await usersApi.updateMe(payload);
    setUser(updated);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      refreshUser,
      updateProfile,
    }),
    [user, isLoading, register, login, logout, refreshUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
