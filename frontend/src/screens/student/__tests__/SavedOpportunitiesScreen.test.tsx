/**
 * Testes — SavedOpportunitiesScreen
 *
 * Cobre:
 * - Renderiza OpportunityCards das vagas salvas + contador no header
 * - Remover (heart) tira o card da lista e chama unsaveOpportunity
 * - Empty state quando lista vazia
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useFocusEffect: (cb: any) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
}));

jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }), { virtual: true });

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'mock-token' }),
}));

jest.mock('../../../services/opportunities', () => ({
  getSavedOpportunities: jest.fn(),
  unsaveOpportunity: jest.fn(),
}));

import * as service from '../../../services/opportunities';
import SavedOpportunitiesScreen from '../SavedOpportunitiesScreen';

const mockGetSaved = service.getSavedOpportunities as jest.MockedFunction<typeof service.getSavedOpportunities>;
const mockUnsave = service.unsaveOpportunity as jest.MockedFunction<typeof service.unsaveOpportunity>;

const MOCK_ITEM = {
  id: 'opp-1',
  title: 'Tutoria em Matemática Básica',
  organization: { user_id: 'u1', razao_social: 'Instituto Despertar' },
  area: 'educacao',
  description: 'Desc',
  workload_value: 20,
  workload_unit: 'h',
  vacancies: 5,
  modality: 'presencial',
  location: 'Asa Norte',
  start_date: '2026-07-01',
  start_time: '09:00',
  status: 'active',
  featured: false,
  is_saved: true,
  applicants_count: 2,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SavedOpportunitiesScreen', () => {
  it('renders saved cards with count', async () => {
    mockGetSaved.mockResolvedValue([MOCK_ITEM]);
    render(<SavedOpportunitiesScreen />);
    await waitFor(() => expect(screen.getByText('Tutoria em Matemática Básica')).toBeTruthy());
    expect(screen.getByText('1 oportunidade salva')).toBeTruthy();
  });

  it('removes card and calls unsaveOpportunity', async () => {
    mockGetSaved.mockResolvedValue([MOCK_ITEM]);
    mockUnsave.mockResolvedValue(null);
    render(<SavedOpportunitiesScreen />);
    await waitFor(() => expect(screen.getByTestId('save-button')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByTestId('save-button'));
    });

    expect(mockUnsave).toHaveBeenCalledWith('mock-token', 'opp-1');
    await waitFor(() => expect(screen.queryByText('Tutoria em Matemática Básica')).toBeNull());
  });

  it('shows empty state when no saved opportunities', async () => {
    mockGetSaved.mockResolvedValue([]);
    render(<SavedOpportunitiesScreen />);
    await waitFor(() => expect(screen.getByTestId('empty-state')).toBeTruthy());
  });
});
