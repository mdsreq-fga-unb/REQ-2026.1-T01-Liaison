import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// Mock AuthContext
const mockAccessToken = 'eyJtoken...';
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: mockAccessToken,
    isAuthenticated: true,
    isLoading: false,
    user: null,
    refreshToken: null,
    handleLogin: jest.fn(),
    studentRegister: jest.fn(),
    organizationRegister: jest.fn(),
    authenticatedFetch: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock changePassword API
const mockChangePassword = jest.fn();
jest.mock('../../../services/api', () => ({
  changePassword: (...args: any[]) => mockChangePassword(...args),
}));

import PasswordChangeSection from '../PasswordChangeSection';

describe('PasswordChangeSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockChangePassword.mockReset();
  });

  it('renders the section title "Segurança"', () => {
    render(<PasswordChangeSection />);
    expect(screen.getByText('Segurança')).toBeTruthy();
  });

  it('renders new password input field', () => {
    render(<PasswordChangeSection />);
    expect(screen.getByTestId('new-password-input')).toBeTruthy();
  });

  it('renders confirm password input field', () => {
    render(<PasswordChangeSection />);
    expect(screen.getByTestId('confirm-password-input')).toBeTruthy();
  });

  it('renders the strength indicator', () => {
    render(<PasswordChangeSection />);
    expect(screen.getByTestId('password-strength-indicator')).toBeTruthy();
  });

  it('renders "Alterar senha" submit button', () => {
    render(<PasswordChangeSection />);
    expect(screen.getByText('Alterar senha')).toBeTruthy();
  });

  it('toggles password visibility for new password', () => {
    render(<PasswordChangeSection />);
    const toggle = screen.getByTestId('toggle-new-password');

    // By default, input is secureTextEntry
    const input = screen.getByTestId('new-password-input');
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(toggle);
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('toggles password visibility for confirm password', () => {
    render(<PasswordChangeSection />);
    const toggle = screen.getByTestId('toggle-confirm-password');

    const input = screen.getByTestId('confirm-password-input');
    expect(input.props.secureTextEntry).toBe(true);

    fireEvent.press(toggle);
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('shows error when passwords do not match', async () => {
    render(<PasswordChangeSection />);

    fireEvent.changeText(screen.getByTestId('new-password-input'), 'Senha123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'Different456');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeTruthy();
    });
  });

  it('shows error when password is too short', async () => {
    render(<PasswordChangeSection />);

    fireEvent.changeText(screen.getByTestId('new-password-input'), 'Ab1');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'Ab1');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(screen.getByText('A senha deve ter no mínimo 8 caracteres.')).toBeTruthy();
    });
  });

  it('shows error when password has no letters or no numbers', async () => {
    render(<PasswordChangeSection />);

    // Only letters
    fireEvent.changeText(screen.getByTestId('new-password-input'), 'abcdefgh');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'abcdefgh');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(screen.getByText('A senha deve conter letras e números.')).toBeTruthy();
    });
  });

  it('calls changePassword API on valid submission', async () => {
    mockChangePassword.mockResolvedValueOnce({ detail: 'Senha alterada com sucesso.' });

    render(<PasswordChangeSection />);

    fireEvent.changeText(screen.getByTestId('new-password-input'), 'NovaSenha123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'NovaSenha123');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        mockAccessToken,
        'NovaSenha123',
        'NovaSenha123',
      );
    });
  });

  it('shows success message on successful password change', async () => {
    mockChangePassword.mockResolvedValueOnce({ detail: 'Senha alterada com sucesso.' });

    render(<PasswordChangeSection />);

    fireEvent.changeText(screen.getByTestId('new-password-input'), 'NovaSenha123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'NovaSenha123');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(screen.getByText('Senha alterada com sucesso.')).toBeTruthy();
    });
  });

  it('shows API error message on failure', async () => {
    mockChangePassword.mockRejectedValueOnce({
      data: { confirm_password: ['As senhas não coincidem.'] },
    });

    render(<PasswordChangeSection />);

    fireEvent.changeText(screen.getByTestId('new-password-input'), 'NovaSenha123');
    fireEvent.changeText(screen.getByTestId('confirm-password-input'), 'NovaSenha123');

    fireEvent.press(screen.getByText('Alterar senha'));

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeTruthy();
    });
  });
});
