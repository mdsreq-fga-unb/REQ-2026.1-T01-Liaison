import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com', nome: 'Maria Silva', role: 'estudante' },
    isAuthenticated: true,
    isLoading: false,
    accessToken: null,
    refreshToken: null,
    handleLogin: jest.fn(),
    studentRegister: jest.fn(),
    organizationRegister: jest.fn(),
    authenticatedFetch: jest.fn(),
    logout: jest.fn(),
  }),
}));

import StudentHomeScreen from './HomeScreen';

describe('StudentHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile card', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByTestId('profile-card')).toBeTruthy();
  });

  it('displays user name in profile card', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Maria Silva')).toBeTruthy();
  });

  it('displays "Meu Perfil" action text', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Meu Perfil')).toBeTruthy();
  });

  it('navigates to StudentProfile when profile card is pressed', () => {
    render(<StudentHomeScreen />);
    fireEvent.press(screen.getByTestId('profile-card'));
    expect(mockNavigate).toHaveBeenCalledWith('StudentProfile');
  });

  it('renders the empty state area', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Área do Estudante')).toBeTruthy();
  });
});
