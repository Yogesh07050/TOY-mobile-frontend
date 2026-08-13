import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import * as usersApi from '../api/users';
import { setSessionExpiredHandler } from '../api/client';
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthResult = useCallback(async (result: AuthResult) => {
    await setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    setUser(result.user);
  }, []);

  const clearSession = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void clearSession();
    });
    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      try {
        const tokens = await getTokens();
        if (!tokens) return;
        const me = await authApi.fetchMe();
        setUser(me);
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

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout — clear the local session regardless.
    }
    await clearSession();
  }, [clearSession]);

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
