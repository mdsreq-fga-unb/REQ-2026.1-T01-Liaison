import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import OrgHomeScreen from './HomeScreen';
import { getMyOpportunities, deleteOpportunity } from '../../services/opportunities';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const { useEffect } = require('react');
  return {
    useNavigation: () => ({ navigate: jest.fn() }),
    useFocusEffect: (cb: () => void) => useEffect(() => { cb(); }, []),
  };
});

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
  deleteOpportunity: jest.fn(() => Promise.resolve()),
}));

describe('OrgHomeScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header title and create button', async () => {
    render(<OrgHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Minhas oportunidades')).toBeTruthy();
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
      expect(screen.getByPlaceholderText('Buscar oportunidades...')).toBeTruthy();
    });
  });

  describe('delete draft flow', () => {
    const draft = {
      id: 'opp-1',
      title: 'Vaga Rascunho Teste',
      status: 'draft',
    };

    beforeEach(() => {
      (getMyOpportunities as jest.Mock<any>).mockResolvedValue([draft]);
    });

    it('opens the confirmation modal when "Excluir" is pressed', async () => {
      render(<OrgHomeScreen />);
      const deleteButton = await screen.findByText('Excluir');

      await act(async () => fireEvent.press(deleteButton));

      expect(screen.getByText('Excluir rascunho?')).toBeTruthy();
      expect(screen.getByTestId('confirm-delete-button')).toBeTruthy();
    });

    it('calls deleteOpportunity and closes the modal on confirm', async () => {
      render(<OrgHomeScreen />);
      const deleteButton = await screen.findByText('Excluir');
      await act(async () => fireEvent.press(deleteButton));

      await act(async () => fireEvent.press(screen.getByTestId('confirm-delete-button')));

      await waitFor(() => {
        expect(deleteOpportunity).toHaveBeenCalledWith('fake-token', 'opp-1');
        expect(screen.queryByText('Excluir rascunho?')).toBeNull();
      });
    });

    it('closes the modal without deleting when "Voltar" is pressed', async () => {
      render(<OrgHomeScreen />);
      const deleteButton = await screen.findByText('Excluir');
      await act(async () => fireEvent.press(deleteButton));

      await act(async () => fireEvent.press(screen.getByText('Voltar')));

      expect(screen.queryByText('Excluir rascunho?')).toBeNull();
      expect(deleteOpportunity).not.toHaveBeenCalled();
    });
  });
});
