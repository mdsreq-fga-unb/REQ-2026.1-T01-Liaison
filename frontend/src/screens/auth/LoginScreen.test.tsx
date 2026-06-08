import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import LoginScreen from './LoginScreen';

// Need to import the real ApiError for instanceof checks in the component
import { ApiError } from '../../services/api';

// Mock de navegação
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock AuthContext
const mockHandleLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    handleLogin: mockHandleLogin,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    studentRegister: jest.fn(),
    organizationRegister: jest.fn(),
    authenticatedFetch: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Existing rendering tests (kept from before) ───

  it('renders the Liaison logo text', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/liaison/i)).toBeTruthy();
  });

  it('renders stats bar with numbers', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('stats-bar')).toBeTruthy();
    expect(screen.getByText('340+')).toBeTruthy();
    expect(screen.getByText('82')).toBeTruthy();
    expect(screen.getByText('4.8k')).toBeTruthy();
  });

  it('renders Estudante/Organização tabs', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Estudante')).toBeTruthy();
    expect(screen.getByText('Organização')).toBeTruthy();
  });

  it('renders email input field', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/E-mail/)).toBeTruthy();
  });

  it('renders Entrar button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Entrar')).toBeTruthy();
  });

  it('renders "Criar conta" link', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/criar conta gratuita/i)).toBeTruthy();
  });

  it('navigates to Register screen when "criar conta" is pressed', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText(/criar conta gratuita/i));
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('renders "Esqueci minha senha" link', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/esqueci.*senha/i)).toBeTruthy();
  });

  it('renders Lembrar de mim checkbox', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/lembrar/i)).toBeTruthy();
  });

  it('renders the hero title', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/conecte seu/i)).toBeTruthy();
    expect(screen.getByText(/mundo real/i)).toBeTruthy();
  });

  it('renders security notice', () => {
    render(<LoginScreen />);
    expect(screen.getByText(/criptografia/i)).toBeTruthy();
  });

  it('renders "ou" divider', () => {
    render(<LoginScreen />);
    expect(screen.getByText('ou')).toBeTruthy();
  });

  // ─── T1.10: Form submission tests ───

  it('calls handleLogin with email and senha when Entrar is pressed', async () => {
    mockHandleLogin.mockResolvedValueOnce(undefined);

    render(<LoginScreen />);

    // Fill in email and password
    const emailInput = screen.getByTestId('input-email');
    const senhaInput = screen.getByTestId('input-senha');

    fireEvent.changeText(emailInput, 'maria@email.edu.br');
    fireEvent.changeText(senhaInput, 'Senha123');

    // Press Entrar
    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith('maria@email.edu.br', 'Senha123');
    });
  });

  it('calls handleLogin even with empty fields (validation is server-side)', async () => {
    mockHandleLogin.mockResolvedValueOnce(undefined);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith('', '');
    });
  });

  // ─── T1.11: Error handling tests ───

  it('displays error message for invalid credentials (401)', async () => {
    const apiError = new ApiError('Login failed', { detail: 'No active account' }, 401);
    mockHandleLogin.mockRejectedValueOnce(apiError);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos')).toBeTruthy();
    });
  });

  it('displays error message for network error', async () => {
    const networkError = new TypeError('Network request failed');
    mockHandleLogin.mockRejectedValueOnce(networkError);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(screen.getByText('Erro de conexão')).toBeTruthy();
    });
  });

  it('displays generic error for unexpected failures', async () => {
    mockHandleLogin.mockRejectedValueOnce(new Error('Something unexpected'));

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao realizar login. Tente novamente.')).toBeTruthy();
    });
  });

  it('error message has the error banner testID', async () => {
    const apiError = new ApiError('Login failed', { detail: 'No active account' }, 401);
    mockHandleLogin.mockRejectedValueOnce(apiError);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeTruthy();
    });
  });

  it('clears previous error message on new submission attempt', async () => {
    // First attempt: fails
    const apiError = new ApiError('Login failed', { detail: 'No active account' }, 401);
    mockHandleLogin.mockRejectedValueOnce(apiError);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos')).toBeTruthy();
    });

    // Second attempt: succeeds (error should be cleared)
    mockHandleLogin.mockResolvedValueOnce(undefined);
    fireEvent.press(screen.getByTestId('button-entrar'));

    await waitFor(() => {
      expect(() => screen.getByTestId('login-error')).toThrow();
    });
  });

  // ─── T1.10: Loading state tests ───

  it('shows loading state on button during submission', async () => {
    // Make handleLogin never resolve so we can observe loading state
    let resolveLogin: (value: void) => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    mockHandleLogin.mockReturnValueOnce(loginPromise);

    render(<LoginScreen />);

    fireEvent.press(screen.getByTestId('button-entrar'));

    // The button should show loading (the ActivityIndicator)
    await waitFor(() => {
      const button = screen.getByTestId('button-entrar');
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    // Resolve to clean up
    resolveLogin!();
  });
});
