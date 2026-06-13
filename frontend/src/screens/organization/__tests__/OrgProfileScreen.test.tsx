import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mock-token',
    tryRefreshSession: jest.fn().mockResolvedValue(null),
    logout: jest.fn(),
  }),
}));

// Mock API
jest.mock('../../../services/api', () => ({
  getOrgProfile: jest.fn(),
  ApiError: class extends Error {
    data: unknown;
    status: number;
    constructor(msg: string, data: unknown, status: number) {
      super(msg);
      this.data = data;
      this.status = status;
    }
  },
}));

import { getOrgProfile } from '../../../services/api';
import OrgProfileScreen from '../OrgProfileScreen';

const MOCK_ORG_PROFILE = {
  id: 'org-uuid',
  email: 'org@test.com',
  nome: 'ORG Teste',
  cnpj: '11222333000181',
  razao_social: 'ORG Teste LTDA',
  nome_fantasia: 'ONG Teste',
  telefone: '(11) 99999-9999',
  nome_responsavel: 'Responsável',
  mission: 'Nossa missão',
  full_description: 'Descrição completa',
  areas_de_atuacao: ['saude', 'educacao'],
  site: 'https://ong.org',
  endereco: 'Rua A, 123',
  logo_url: null,
  banner_url: null,
  gallery: [],
  stats: { total_events: 0, total_volunteers: 0, rating: 0 },
  events: [],
  open_positions: [],
};

describe('OrgProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getOrgProfile as jest.Mock).mockResolvedValue(MOCK_ORG_PROFILE);
  });

  it('shows loading state initially', () => {
    (getOrgProfile as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<OrgProfileScreen />);
    expect(screen.getByText(/carregando/i)).toBeTruthy();
  });

  it('renders header with title', async () => {
    render(<OrgProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('Perfil Institucional')).toBeTruthy();
    });
  });

  it('renders organization name', async () => {
    render(<OrgProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('ONG Teste')).toBeTruthy();
    });
  });

  it('renders stats', async () => {
    render(<OrgProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('Eventos')).toBeTruthy();
      expect(screen.getByText('Voluntários')).toBeTruthy();
      expect(screen.getByText('Avaliação')).toBeTruthy();
    });
  });

  it('renders mission section', async () => {
    render(<OrgProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('Missão')).toBeTruthy();
      expect(screen.getByText('Nossa missão')).toBeTruthy();
    });
  });

  it('renders contact info section', async () => {
    render(<OrgProfileScreen />);
    await waitFor(() => {
      expect(screen.getByText('Contato')).toBeTruthy();
    });
  });
});
