import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

// Mock AuthContext
const mockLogout = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { nome: 'Maria Silva', role: 'estudante' },
    logout: mockLogout,
    accessToken: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
  }),
}));

import StudentHomeScreen from '../HomeScreen';

describe('StudentHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the student name from user context', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Maria Silva')).toBeTruthy();
  });

  it('renders "Meu Perfil" action text', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Meu Perfil')).toBeTruthy();
  });

  it('renders profile card that navigates to StudentProfile', () => {
    render(<StudentHomeScreen />);
    const card = screen.getByTestId('profile-card');
    expect(card).toBeTruthy();
    fireEvent.press(card);
    expect(mockNavigate).toHaveBeenCalledWith('StudentProfile');
  });

  it('renders "Sair da conta" logout button', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Sair da conta')).toBeTruthy();
  });

  it('calls logout() when logout button is pressed', () => {
    render(<StudentHomeScreen />);
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeTruthy();
    fireEvent.press(logoutButton);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('renders empty state placeholder text', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Área do Estudante')).toBeTruthy();
  });
});
