import { act, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { AuthProvider, useAuth } from './AuthContext';

// Mock do serviço de API
jest.mock('../services/api', () => ({
  studentRegister: jest.fn(),
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
  const { register } = useAuth();
  return (
    <Text
      testID="register-btn"
      onPress={() =>
        register({
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

  it('provides no user in default state', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('user-state').props.children).toBe('no-user');
  });

  it('provides isLoading as false initially', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('loading-state').props.children).toBe('not-loading');
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
});
