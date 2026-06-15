import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

import OrgHomeScreen from './HomeScreen';
import * as api from '../../services/api';
import { OpportunityData } from '../../services/api';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native') as any;
  const react = require('react');
  return {
    ...actualNav,
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: (cb: any) => {
      react.useEffect(cb, [cb]);
    },
  };
});

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'fake-token',
    user: { nome: 'ONG Teste', email: 'ong@test.com' },
    logout: jest.fn(),
  }),
}));

// Mock Vector Icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

// Mock Data
const mockOpportunities: OpportunityData[] = [
  {
    id: '1',
    title: 'Tutoria em Matemática Básica para o Ensino Médio',
    category: 'Educação',
    status: 'active',
    workload_hours: 4,
    workload_type: 'weekly',
    location_type: 'in_person',
    city: 'Brasília',
    state: 'DF',
    start_date: '2026-06-15T00:00:00Z',
    end_date: '2026-07-30T00:00:00Z',
    available_spots: 10,
    filled_spots: 6,
    created_at: '2026-06-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Apoio em Campanha de Vacinação',
    category: 'Saúde',
    status: 'draft',
    workload_hours: 8,
    workload_type: 'total',
    location_type: 'in_person',
    city: 'São Paulo',
    state: 'SP',
    start_date: '',
    end_date: '',
    available_spots: 15,
    filled_spots: 0,
    created_at: '2026-06-10T00:00:00Z',
  },
  {
    id: '3',
    title: 'Mutirão de Distribuição de Alimentos',
    category: 'Assistência Social',
    status: 'closed',
    workload_hours: 8,
    workload_type: 'total',
    location_type: 'in_person',
    city: 'Brasília',
    state: 'DF',
    start_date: '2026-01-01T00:00:00Z',
    end_date: '2026-01-10T00:00:00Z',
    available_spots: 80,
    filled_spots: 76,
    created_at: '2025-12-01T00:00:00Z',
  },
];

describe('OrgHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially and then shows opportunities', async () => {
    jest.spyOn(api, 'getOrgOpportunities').mockResolvedValueOnce(mockOpportunities);
    
    render(<OrgHomeScreen />);
    
    // Should show ActivityIndicator or "Carregando"
    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    
    await waitFor(() => {
      expect(screen.getByText('Tutoria em Matemática Básica para o Ensino Médio')).toBeTruthy();
      expect(screen.getByText('Apoio em Campanha de Vacinação')).toBeTruthy();
    });
  });

  it('filters opportunities when clicking on tabs', async () => {
    jest.spyOn(api, 'getOrgOpportunities').mockResolvedValueOnce(mockOpportunities);
    
    render(<OrgHomeScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Tutoria em Matemática Básica para o Ensino Médio')).toBeTruthy();
    });

    // Click "Ativas" tab
    fireEvent.press(screen.getByText(/Ativas/));
    
    expect(screen.getByText('Tutoria em Matemática Básica para o Ensino Médio')).toBeTruthy();
    expect(screen.queryByText('Apoio em Campanha de Vacinação')).toBeNull(); // Draft

    // Click "Rascunho" tab
    fireEvent.press(screen.getByText(/Rascunho/));
    expect(screen.getByText('Apoio em Campanha de Vacinação')).toBeTruthy();
    expect(screen.queryByText('Tutoria em Matemática Básica para o Ensino Médio')).toBeNull();
  });

  it('navigates to CreateOpportunity when clicking the create button', async () => {
    jest.spyOn(api, 'getOrgOpportunities').mockResolvedValueOnce(mockOpportunities);
    
    render(<OrgHomeScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Minhas Vagas')).toBeTruthy();
    });

    const createButton = screen.getByText('Criar');
    fireEvent.press(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('CreateOpportunity');
  });

  it('shows error state if API fails', async () => {
    jest.spyOn(api, 'getOrgOpportunities').mockRejectedValueOnce(new Error('API error'));
    
    render(<OrgHomeScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar vagas')).toBeTruthy();
    });
  });
});
