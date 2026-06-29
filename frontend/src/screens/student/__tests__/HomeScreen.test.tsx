/**
 * Testes TDD (Red Phase) — StudentHomeScreen (Opportunities Feed)
 *
 * A HomeScreen foi SUBSTITUÍDA por uma tela de feed de vagas.
 * Esta tela inclui:
 * - Header com saudação + nome do estudante
 * - Linha de stats: horas acumuladas / exigidas + ProgressBar
 * - SearchBar com debounce
 * - Lista horizontal de CategoryPills
 * - Lista vertical de OpportunityCards
 * - Empty state quando sem resultados
 * - Pull-to-refresh
 * - Estado de loading (ActivityIndicator)
 * - Avatar do header navega para o Perfil (logout vive no Perfil — decisão #20)
 * - 3 StatCards, headline, contador de resultados, empty-state com ação, modal de filtros
 *
 * Cobre:
 * - Renderiza saudação do dashboard
 * - Renderiza nome do estudante
 * - Renderiza ProgressBar de horas
 * - Renderiza SearchBar
 * - Renderiza CategoryPills
 * - Renderiza lista de vagas
 * - Renderiza empty state quando lista vazia
 * - Chama dashboard API no mount
 * - Chama opportunities API no mount
 * - Chama getCategories no mount
 * - Avatar do header (header-avatar) navega
 */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';

// Mock navigation — stable navigate ref so we can assert on it
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
  useFocusEffect: (cb: any) => {
    const React = require('react');
    React.useEffect(cb, []);
  },
}));

// expo-linear-gradient is used by the redesigned header (approved dep, may not be
// installed in the test env yet) — virtual mock keeps the suite resolvable.
jest.mock(
  'expo-linear-gradient',
  () => ({ LinearGradient: 'LinearGradient' }),
  { virtual: true }
);

// Mock AuthContext with stable function references
const mockAuthState = {
  user: { id: '1', email: 'joao@test.com', nome: 'João Silva', role: 'estudante' },
  accessToken: 'mock-access-token',
  isAuthenticated: true,
  isLoading: false,
  refreshToken: null,
  handleLogin: jest.fn(),
  studentRegister: jest.fn(),
  organizationRegister: jest.fn(),
  authenticatedFetch: jest.fn(),
  logout: jest.fn(),
};

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuthState,
}));

// Mock opportunities service — use jest.fn() directly inside factory to avoid hoisting issues
jest.mock('../../../services/opportunities', () => ({
  getDashboard: jest.fn(),
  getOpportunities: jest.fn(),
  getCategories: jest.fn(),
  saveOpportunity: jest.fn(),
  unsaveOpportunity: jest.fn(),
}));

// Import the mocked module to get references to the mock functions
import * as opportunitiesService from '../../../services/opportunities';

const mockGetDashboard = opportunitiesService.getDashboard as jest.MockedFunction<typeof opportunitiesService.getDashboard>;
const mockGetOpportunities = opportunitiesService.getOpportunities as jest.MockedFunction<typeof opportunitiesService.getOpportunities>;
const mockGetCategories = opportunitiesService.getCategories as jest.MockedFunction<typeof opportunitiesService.getCategories>;
const mockSaveOpportunity = opportunitiesService.saveOpportunity as jest.MockedFunction<typeof opportunitiesService.saveOpportunity>;
const mockUnsaveOpportunity = opportunitiesService.unsaveOpportunity as jest.MockedFunction<typeof opportunitiesService.unsaveOpportunity>;

const MOCK_DASHBOARD = {
  nome: 'João Silva',
  horas_acumuladas: 16,
  horas_exigidas: 120,
  progresso_percentual: 13,
  inscricoes_ativas: 3,
  vagas_salvas: 5,
  saudacao: 'Bom dia',
};

const MOCK_OPPORTUNITY = {
  id: 'uuid-opp-1',
  title: 'Tutoria de Matemática',
  organization: { id: 'org-1', razao_social: 'ONG Educação Ltda' },
  area: 'educacao',
  description: 'Apoio a alunos do ensino médio',
  workload_value: 4,
  workload_unit: 'h/semana',
  vacancies: 10,
  modality: 'presencial',
  location: 'Brasília - DF',
  start_date: '2026-07-01',
  start_time: '09:00',
  status: 'active',
  featured: false,
  is_saved: false,
  applicants_count: 0,
};

const MOCK_CATEGORIES = [
  { area: 'all', label: 'Todas', count: 5 },
  { area: 'educacao', label: 'Educação', count: 2 },
  { area: 'saude', label: 'Saúde', count: 3 },
];

import StudentHomeScreen from '../HomeScreen';

describe('StudentHomeScreen (Opportunities Feed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDashboard.mockResolvedValue(MOCK_DASHBOARD);
    mockGetOpportunities.mockResolvedValue({
      count: 1,
      results: [MOCK_OPPORTUNITY],
      next: null,
      previous: null,
    });
    mockGetCategories.mockResolvedValue(MOCK_CATEGORIES);
    mockSaveOpportunity.mockResolvedValue({});
    mockUnsaveOpportunity.mockResolvedValue({});
    // Reset stable auth mocks
    mockAuthState.logout.mockClear();
    mockAuthState.authenticatedFetch.mockClear();
  });

  it('renders without crashing', () => {
    render(<StudentHomeScreen />);
  });

  it('calls getDashboard on mount', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(mockGetDashboard).toHaveBeenCalledTimes(1);
      expect(mockGetDashboard).toHaveBeenCalledWith('mock-access-token');
    });
  });

  it('calls getOpportunities on mount', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenCalledTimes(1);
    });
  });

  it('calls getCategories on mount', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(mockGetCategories).toHaveBeenCalledTimes(1);
    });
  });

  it('renders greeting from dashboard', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Bom dia')).toBeTruthy();
    });
  });

  it('renders student name from dashboard', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeTruthy();
    });
  });

  it('renders SearchBar', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('search-bar-input')).toBeTruthy();
    });
  });

  it('renders category pills after loading', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Todas')).toBeTruthy();
    });
  });

  it('renders opportunity cards after loading', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText('Tutoria de Matemática')).toBeTruthy();
    });
  });

  it('renders empty state when no opportunities', async () => {
    mockGetOpportunities.mockResolvedValueOnce({
      count: 0,
      results: [],
      next: null,
      previous: null,
    });
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeTruthy();
    });
  });

  // Decisão de escopo #20: o feed (Figma 32:2) não tem logout — o logout vive no
  // tab Perfil. O avatar do header navega para o Perfil.
  it('renders the header avatar', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('header-avatar')).toBeTruthy();
    });
  });

  it('navigates when the header avatar is pressed', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('header-avatar')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('header-avatar'));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('calls getOpportunities with search term after typing', async () => {
    jest.useFakeTimers();
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(mockGetOpportunities).toHaveBeenCalledTimes(1); // initial load
    });
    const searchInput = screen.getByTestId('search-bar-input');
    fireEvent.changeText(searchInput, 'matemática');
    act(() => {
      jest.advanceTimersByTime(350);
    });
    await waitFor(() => {
      const calls = mockGetOpportunities.mock.calls;
      const lastCall = calls[calls.length - 1];
      const params = lastCall?.[1];
      expect(params?.search).toBe('matemática');
    });
    jest.useRealTimers();
  });

  it('renders hours progress bar', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      // HoursProgressBar should be present after dashboard loads
      expect(screen.getByTestId('hours-progress-bar')).toBeTruthy();
    });
  });

  // ── Issue #20 feed redesign additions ────────────────────────

  it('renders the 3 stat cards from the dashboard', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getAllByTestId('stat-card')).toHaveLength(3);
    });
  });

  it('renders the dashboard stat values (hours, active, saved)', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      // horas_acumuladas: 16, inscricoes_ativas: 3, vagas_salvas: 5
      expect(screen.getByText(/acumuladas/i)).toBeTruthy();
      expect(screen.getByText(/inscrições/i)).toBeTruthy();
      expect(screen.getByText(/salvas/i)).toBeTruthy();
    });
  });

  it('renders the headline containing "Descubra"', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Descubra/i)).toBeTruthy();
    });
  });

  it('renders the results count label "{count} oportunidades"', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      // getOpportunities mock returns count: 1
      expect(screen.getByText(/1 oportunidade/i)).toBeTruthy();
    });
  });

  it('renders a clear-filters button in the empty state', async () => {
    mockGetOpportunities.mockResolvedValueOnce({
      count: 0,
      results: [],
      next: null,
      previous: null,
    });
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeTruthy();
    });
    expect(screen.getByTestId('clear-filters-button')).toBeTruthy();
  });

  it('opens the advanced filters modal when the filter button is pressed', async () => {
    render(<StudentHomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('search-filter-button')).toBeTruthy();
    });
    // Modal hidden initially
    expect(screen.queryByTestId('filter-location-input')).toBeNull();
    fireEvent.press(screen.getByTestId('search-filter-button'));
    await waitFor(() => {
      expect(screen.getByTestId('filter-location-input')).toBeTruthy();
    });
  });
});
