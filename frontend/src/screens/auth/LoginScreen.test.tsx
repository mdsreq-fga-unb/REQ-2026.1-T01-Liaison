import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import LoginScreen from './LoginScreen';

// Mock de navegação
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
});
