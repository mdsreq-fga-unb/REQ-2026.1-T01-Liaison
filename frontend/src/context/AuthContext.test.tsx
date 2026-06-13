import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { AuthProvider, useAuth } from './AuthContext';

// Mock do serviço de API
jest.mock('../services/api', () => ({
  studentRegister: jest.fn(),
  organizationRegister: jest.fn(),
  login: jest.fn(),
  fetchWithAuth: jest.fn(),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Componente auxiliar para testar o hook
function TestConsumer() {
  const { isAuthenticated, user, isLoading } = useAuth();
  return (
    <>
      <Text testID="auth-state">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</Text>
      <Text testID="loading-state">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="user-state">{user ? user.email : 'no-user'}</Text>
    </>
  );
}

// Componente auxiliar para testar o register
function RegisterConsumer({ onRegister }: { onRegister: () => void }) {
  const { studentRegister } = useAuth();
  return (
    <Text
      testID="register-btn"
      onPress={() =>
        studentRegister({
          email: 'ana@unb.br',
          password: 'Senha123',
          nome: 'Ana Souza',
          universidade: 'UnB',
          curso: 'Eng. Software',
          matricula: '20231234567',
          interesses: [],
        }).then(onRegister)
      }
    >
      Register
    </Text>
  );
}

// Componente auxiliar para testar o register de ONG
function OrgRegisterConsumer({ onRegister }: { onRegister: () => void }) {
  const { organizationRegister } = useAuth();
  return (
    <Text
      testID="org-register-btn"
      onPress={() =>
        organizationRegister({
          email: 'ong@example.com',
          password: 'Senha123',
          cnpj: '12.345.678/0001-90',
          razao_social: 'ONG Test',
          telefone: '61999999999',
          nome_responsavel: 'João',
        }).then(onRegister)
      }
    >
      Register Org
    </Text>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides default unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('auth-state').props.children).toBe('unauthenticated');
  });

  it('provides no user in default state', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('user-state').props.children).toBe('no-user');
    });
  });

  it('provides isLoading as false after hydration completes', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading-state').props.children).toBe('not-loading');
    });
  });

  it('calls API and updates state after register', async () => {
    const { studentRegister } = require('../services/api');
    studentRegister.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'ana@unb.br',
      nome: 'Ana Souza',
      role: 'estudante',
      tokens: { access: 'access-token', refresh: 'refresh-token' },
      student_profile: {
        universidade: 'UnB',
        curso: 'Eng. Software',
        matricula: '20231234567',
        interesses: [],
      },
    });

    const onRegister = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <RegisterConsumer onRegister={onRegister} />
      </AuthProvider>,
    );

    // Dispara o registro
    await act(async () => {
      screen.getByTestId('register-btn').props.onPress();
    });

    await waitFor(() => {
      expect(studentRegister).toHaveBeenCalledTimes(1);
    });
  });

  it('provides tokens after successful registration', async () => {
    const { studentRegister } = require('../services/api');
    studentRegister.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'ana@unb.br',
      nome: 'Ana Souza',
      role: 'estudante',
      tokens: { access: 'my-access-token', refresh: 'my-refresh-token' },
      student_profile: {
        universidade: 'UnB',
        curso: 'Eng. Software',
        matricula: '20231234567',
        interesses: [],
      },
    });

    // Componente que lê o token
    function TokenConsumer() {
      const { accessToken } = useAuth();
      return <Text testID="token">{accessToken || 'no-token'}</Text>;
    }

    const onRegister = jest.fn();

    render(
      <AuthProvider>
        <TokenConsumer />
        <RegisterConsumer onRegister={onRegister} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('register-btn').props.onPress();
    });

    await waitFor(() => {
      expect(screen.getByTestId('token').props.children).toBe('my-access-token');
    });
  });

  it('sets isAuthenticated to true after successful registration', async () => {
    const { studentRegister } = require('../services/api');
    studentRegister.mockResolvedValueOnce({
      id: 'uuid-123',
      email: 'ana@unb.br',
      nome: 'Ana Souza',
      role: 'estudante',
      tokens: { access: 'access-token', refresh: 'refresh-token' },
      student_profile: {},
    });

    const onRegister = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <RegisterConsumer onRegister={onRegister} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('register-btn').props.onPress();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').props.children).toBe('authenticated');
    });
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleError.mockRestore();
  });

  it('does NOT set isAuthenticated to true after organization registration (pending approval)', async () => {
    const { organizationRegister } = require('../services/api');
    organizationRegister.mockResolvedValueOnce({
      id: 'uuid-456',
      email: 'ong@example.com',
      nome: 'ONG Test',
      role: 'organizacao',
      organization_profile: {
        cnpj: '12.345.678/0001-90',
        razao_social: 'ONG Test',
        nome_fantasia: '',
        telefone: '61999999999',
        nome_responsavel: 'João',
        status: 'pending',
      },
    });

    const onRegister = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <OrgRegisterConsumer onRegister={onRegister} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('org-register-btn').props.onPress();
    });

    await waitFor(() => {
      expect(organizationRegister).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('auth-state').props.children).toBe('unauthenticated');
    expect(screen.getByTestId('user-state').props.children).toBe('no-user');
  });

  // ─── T1.6: handleLogin tests ───

  function LoginConsumer({ onLoginDone }: { onLoginDone: () => void }) {
    const { handleLogin } = useAuth();
    return (
      <Text
        testID="login-btn"
        onPress={async () => {
          await handleLogin('maria@email.edu.br', 'Senha123');
          onLoginDone();
        }}
      >
        Login
      </Text>
    );
  }

  it('calls api.login and updates state after successful login', async () => {
    const { login } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'access-token-login',
      refresh: 'refresh-token-login',
      email: 'maria@email.edu.br',
      role: 'estudante',
      nome: 'Maria Silva',
      id: 'uuid-maria',
    });

    const onLoginDone = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <LoginConsumer onLoginDone={onLoginDone} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ email: 'maria@email.edu.br', password: 'Senha123' });
    });
  });

  it('sets isAuthenticated to true after successful login', async () => {
    const { login } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'access-token',
      refresh: 'refresh-token',
      email: 'maria@email.edu.br',
      role: 'estudante',
      nome: 'Maria Silva',
      id: 'uuid-maria',
    });

    const onLoginDone = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <LoginConsumer onLoginDone={onLoginDone} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').props.children).toBe('authenticated');
    });
  });

  it('stores user data after successful login', async () => {
    const { login } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'access-token',
      refresh: 'refresh-token',
      email: 'maria@email.edu.br',
      role: 'estudante',
      nome: 'Maria Silva',
      id: 'uuid-maria',
    });

    const onLoginDone = jest.fn();

    render(
      <AuthProvider>
        <TestConsumer />
        <LoginConsumer onLoginDone={onLoginDone} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-state').props.children).toBe('maria@email.edu.br');
    });
  });

  it('persists tokens to SecureStore on login', async () => {
    const { login } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'access-token-ss',
      refresh: 'refresh-token-ss',
      email: 'maria@email.edu.br',
      role: 'estudante',
      nome: 'Maria',
      id: 'uuid-maria',
    });

    const onLoginDone = jest.fn();
    (SecureStore.setItemAsync as jest.Mock).mockClear();

    render(
      <AuthProvider>
        <LoginConsumer onLoginDone={onLoginDone} />
      </AuthProvider>,
    );

    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_access_token',
        'access-token-ss',
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_refresh_token',
        'refresh-token-ss',
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'auth_user',
        expect.stringContaining('Maria'),
      );
    });
  });

  // ─── T1.7: Token persistence / hydration tests ───

  it('hydrates session from SecureStore on mount', async () => {
    const storedUser = JSON.stringify({
      id: 'hydrated-id',
      email: 'hydrated@test.com',
      nome: 'Hydrated User',
      role: 'estudante',
    });

    (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
      if (key === 'auth_access_token') return Promise.resolve('hydrated-access');
      if (key === 'auth_refresh_token') return Promise.resolve('hydrated-refresh');
      if (key === 'auth_user') return Promise.resolve(storedUser);
      return Promise.resolve(null);
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').props.children).toBe('authenticated');
    });

    expect(screen.getByTestId('user-state').props.children).toBe('hydrated@test.com');
  });

  // ─── T1.8: authenticatedFetch tests ───

  function FetchConsumer({ onFetch }: { onFetch: () => void }) {
    const { authenticatedFetch } = useAuth();
    return (
      <Text
        testID="fetch-btn"
        onPress={async () => {
          await authenticatedFetch('https://api.test/endpoint');
          onFetch();
        }}
      >
        Fetch
      </Text>
    );
  }

  it('authenticatedFetch calls fetchWithAuth with the access token', async () => {
    // Ensure SecureStore returns null so hydration doesn't set a stale token
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { login, fetchWithAuth } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'fetch-token',
      refresh: 'refresh-token',
      email: 'fetch@email.edu.br',
      role: 'estudante',
      nome: 'Fetch User',
      id: 'uuid-fetch',
    });
    fetchWithAuth.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    const onLoginDone = jest.fn();
    const onFetch = jest.fn();

    render(
      <AuthProvider>
        <LoginConsumer onLoginDone={onLoginDone} />
        <FetchConsumer onFetch={onFetch} />
      </AuthProvider>,
    );

    // First login
    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });

    // Then fetch
    await act(async () => {
      screen.getByTestId('fetch-btn').props.onPress();
    });

    await waitFor(() => {
      expect(fetchWithAuth).toHaveBeenCalledWith(
        'https://api.test/endpoint',
        'fetch-token',
        {},
      );
    });
  });

  // ─── Logout tests ───

  it('clears SecureStore on logout', async () => {
    const { login } = require('../services/api');
    login.mockResolvedValueOnce({
      access: 'token-to-clear',
      refresh: 'refresh-to-clear',
      email: 'clear@email.edu.br',
      role: 'estudante',
      nome: 'Clear Me',
      id: 'uuid-clear',
    });

    const onLoginDone = jest.fn();

    function LogoutConsumer() {
      const { logout } = useAuth();
      return <Text testID="logout-btn" onPress={() => logout()}>Logout</Text>;
    }

    render(
      <AuthProvider>
        <TestConsumer />
        <LoginConsumer onLoginDone={onLoginDone} />
        <LogoutConsumer />
      </AuthProvider>,
    );

    // Login first
    await act(async () => {
      screen.getByTestId('login-btn').props.onPress();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-state').props.children).toBe('authenticated');
    });

    (SecureStore.deleteItemAsync as jest.Mock).mockClear();

    // Logout
    await act(async () => {
      screen.getByTestId('logout-btn').props.onPress();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_access_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_refresh_token');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_user');
    expect(screen.getByTestId('auth-state').props.children).toBe('unauthenticated');
  });
});
