import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import OrgHomeScreen from './HomeScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { nome: 'ONG Teste', email: 'ong@test.com' },
    logout: jest.fn(),
  }),
}));

describe('OrgHomeScreen', () => {
  it('renders the organization title', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText('Organização')).toBeTruthy();
  });

  it('renders the welcome message with user name', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText(/ONG Teste/)).toBeTruthy();
  });

  it('renders the profile link button', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText(/Ver Perfil Institucional/i)).toBeTruthy();
  });

  it('renders the logout button', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText('Sair')).toBeTruthy();
  });
});
