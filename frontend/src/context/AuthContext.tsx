import React, { createContext, useContext, useState } from 'react';

import {
  StudentRegisterPayload,
  StudentRegisterResponse,
  studentRegister,
} from '../services/api';

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
  role: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  register: (payload: StudentRegisterPayload) => Promise<StudentRegisterResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function register(payload: StudentRegisterPayload): Promise<StudentRegisterResponse> {
    setIsLoading(true);
    try {
      const response = await studentRegister(payload);
      setUser({
        id: response.id,
        email: response.email,
        nome: response.nome,
        role: response.role,
      });
      setAccessToken(response.tokens.access);
      setRefreshToken(response.tokens.refresh);
      return response;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading,
    user,
    accessToken,
    refreshToken,
    register,
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
