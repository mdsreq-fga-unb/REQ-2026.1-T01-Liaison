import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import {
  StudentRegisterPayload,
  StudentRegisterResponse,
  studentRegister,
  OrganizationRegisterPayload,
  OrganizationRegisterResponse,
  organizationRegister,
  login,
  LoginPayload,
  fetchWithAuth,
  refreshAccessToken,
} from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: string;
}

const SECURE_STORE_KEYS = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
  user: 'auth_user',
} as const;

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  studentRegister: (payload: StudentRegisterPayload) => Promise<StudentRegisterResponse>;
  organizationRegister: (payload: OrganizationRegisterPayload) => Promise<OrganizationRegisterResponse>;
  handleLogin: (email: string, password: string) => Promise<void>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  tryRefreshSession: () => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // T1.7: Hydrate session from SecureStore on app init
  useEffect(() => {
    async function hydrate() {
      try {
        const storedToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.accessToken);
        const storedRefresh = await SecureStore.getItemAsync(SECURE_STORE_KEYS.refreshToken);
        const storedUser = await SecureStore.getItemAsync(SECURE_STORE_KEYS.user);

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setRefreshToken(storedRefresh);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // If reading fails, stay logged out — tokens may be corrupted or unavailable
      } finally {
        setIsHydrated(true);
      }
    }
    hydrate();
  }, []);

  async function handleStudentRegister(payload: StudentRegisterPayload): Promise<StudentRegisterResponse> {
    setIsLoading(true);
    try {
      const response = await studentRegister(payload);
      const authUser: AuthUser = {
        id: response.id,
        email: response.email,
        nome: response.nome,
        role: response.role,
      };
      setUser(authUser);
      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);

      // Persist to SecureStore
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, response.tokens.access);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, response.tokens.refresh);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.user, JSON.stringify(authUser));

      return response;
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOrganizationRegister(payload: OrganizationRegisterPayload): Promise<OrganizationRegisterResponse> {
    setIsLoading(true);
    try {
      const response = await organizationRegister(payload);
      // Organizations start as 'pending' — no auto-login
      return response;
    } finally {
      setIsLoading(false);
    }
  }

  // T1.6: handleLogin — calls api.login(), stores user + tokens in state AND SecureStore
  async function handleLogin(email: string, password: string): Promise<void> {
    setIsLoading(true);
    try {
      const payload: LoginPayload = { email, password };
      const response = await login(payload);

      const authUser: AuthUser = {
        id: response.id,
        email,
        nome: response.nome,
        role: response.role,
      };

      setUser(authUser);
      setAccessToken(response.access);
      setRefreshToken(response.refresh);

      // Persist to SecureStore
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, response.access);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, response.refresh);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.user, JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  }

  // T1.8: authenticated fetch helper exposed from context
  async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    if (!accessToken) {
      throw new Error('No access token available. User must be logged in.');
    }
    return fetchWithAuth(url, accessToken, options);
  }

  /**
   * Attempt to refresh the access token using the stored refresh token.
   * On success: updates state + SecureStore with new tokens, returns new access token.
   * On failure: logs out (clears session entirely), returns null.
   *
   * Callers should check the return value — if null, navigation will
   * automatically redirect to AuthStack because isAuthenticated becomes false.
   */
  async function tryRefreshSession(): Promise<string | null> {
    if (!refreshToken) {
      await logout();
      return null;
    }
    try {
      const result = await refreshAccessToken(refreshToken);
      setAccessToken(result.access);
      setRefreshToken(result.refresh);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.accessToken, result.access);
      await SecureStore.setItemAsync(SECURE_STORE_KEYS.refreshToken, result.refresh);
      return result.access;
    } catch {
      // Refresh failed — token is expired/invalid, force re-login
      await logout();
      return null;
    }
  }

  async function logout(): Promise<void> {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    // Clear SecureStore
    try {
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.accessToken);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.refreshToken);
      await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.user);
    } catch {
      // If deletion fails, state is already cleared — session is effectively logged out
    }
  }

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading: isLoading || !isHydrated,
    user,
    accessToken,
    refreshToken,
    studentRegister: handleStudentRegister,
    organizationRegister: handleOrganizationRegister,
    handleLogin,
    authenticatedFetch,
    tryRefreshSession,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
