import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: 'mock-token',
    tryRefreshSession: jest.fn().mockResolvedValue(null),
  }),
}));

// Mock ImagePicker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock API - must define the ApiError class inline in the factory
jest.mock('../../../services/api', () => {
  class ApiError extends Error {
    data: unknown;
    status: number;
    constructor(msg: string, data: unknown, status: number) {
      super(msg);
      this.data = data;
      this.status = status;
    }
  }
  return {
    getOrgProfile: jest.fn(),
    updateOrgProfile: jest.fn(),
    uploadOrgLogo: jest.fn(),
    uploadOrgBanner: jest.fn(),
    uploadOrgGallery: jest.fn(),
    deleteOrgGalleryPhoto: jest.fn(),
    changeOrgPassword: jest.fn(),
    ApiError,
  };
});

import { getOrgProfile, updateOrgProfile, changeOrgPassword } from '../../../services/api';
import OrgProfileEditScreen from '../OrgProfileEditScreen';

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
  areas_de_atuacao: ['saude'],
  site: 'https://ong.org',
  endereco: 'Rua A, 123',
  logo_url: 'http://localhost:8000/media/org_logos/logo.jpg',
  banner_url: 'http://localhost:8000/media/org_banners/banner.jpg',
  gallery: [],
  stats: { total_events: 0, total_volunteers: 0, rating: 0 },
  events: [],
  open_positions: [],
};

describe('OrgProfileEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getOrgProfile as jest.Mock).mockResolvedValue(MOCK_ORG_PROFILE);
    (updateOrgProfile as jest.Mock).mockResolvedValue(MOCK_ORG_PROFILE);
    (changeOrgPassword as jest.Mock).mockResolvedValue({ detail: 'Senha alterada com sucesso.' });
  });

  it('shows loading state initially', () => {
    (getOrgProfile as jest.Mock).mockReturnValueOnce(new Promise(() => {}));
    render(<OrgProfileEditScreen />);
    expect(screen.getByText(/carregando/i)).toBeTruthy();
  });

  it('renders header with title', async () => {
    render(<OrgProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeTruthy();
    });
  });

  it('displays CNPJ label', async () => {
    render(<OrgProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('CNPJ')).toBeTruthy();
    });
  });

  it('renders areas de atuacao chips', async () => {
    render(<OrgProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Saúde')).toBeTruthy();
      expect(screen.getByText('Educação')).toBeTruthy();
    });
  });

  it('renders add gallery button', async () => {
    render(<OrgProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Adicionar Fotos/i)).toBeTruthy();
    });
  });
});
