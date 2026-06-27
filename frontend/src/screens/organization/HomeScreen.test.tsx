import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import OrgHomeScreen from './HomeScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { nome: 'ONG Teste', email: 'ong@test.com' },
    logout: jest.fn(),
    accessToken: 'fake-token',
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

jest.mock('../../services/opportunities', () => ({
  getMyOpportunities: jest.fn(() => Promise.resolve([])),
}));

describe('OrgHomeScreen', () => {
  it('renders the header title and create button', async () => {
    render(<OrgHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Minhas Vagas')).toBeTruthy();
      expect(screen.getByText('Criar')).toBeTruthy();
    });
  });

  it('renders the tabs', async () => {
    render(<OrgHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Todas/)).toBeTruthy();
      expect(screen.getByText(/Ativas/)).toBeTruthy();
    });
  });

  it('renders the search bar', async () => {
    render(<OrgHomeScreen />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Buscar vagas...')).toBeTruthy();
    });
  });
});
