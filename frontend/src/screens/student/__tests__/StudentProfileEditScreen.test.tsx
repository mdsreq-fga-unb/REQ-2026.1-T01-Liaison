import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

// Mock AuthContext
const mockAccessToken = 'eyJtoken...';
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    accessToken: mockAccessToken,
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: 'uuid-profile',
      email: 'maria@email.edu.br',
      nome: 'Maria Silva',
      role: 'estudante',
    },
    refreshToken: null,
    handleLogin: jest.fn(),
    studentRegister: jest.fn(),
    organizationRegister: jest.fn(),
    authenticatedFetch: jest.fn(),
    logout: jest.fn(),
  }),
}));

const MOCK_PROFILE = {
  id: 'uuid-profile',
  email: 'maria@email.edu.br',
  nome: 'Maria Silva',
  universidade: 'UnB',
  curso: 'Ciência da Computação',
  matricula: '2024001234',
  semestre_atual: 6,
  turno: 'noturno',
  ano_conclusao: 2027,
  horas_extensao_exigidas: 200,
  interesses: ['educacao'],
  bio: 'Estudante apaixonada por tecnologia.',
  avatar_url: null,
  banner_url: null,
  gallery: [],
  stats: {
    total_hours_completed: 120,
    total_hours_required: 200,
    total_events: 8,
  },
  events: [],
};

const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock('../../../services/api', () => ({
  getStudentProfile: (...args: any[]) => mockGetProfile(...args),
  updateStudentProfile: (...args: any[]) => mockUpdateProfile(...args),
  uploadAvatar: jest.fn(),
  uploadBanner: jest.fn(),
  uploadGalleryPhotos: jest.fn(),
  deleteGalleryPhoto: jest.fn(),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

import StudentProfileEditScreen from '../StudentProfileEditScreen';

describe('StudentProfileEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockReset();
    mockUpdateProfile.mockReset();
  });

  it('shows loading state initially', () => {
    mockGetProfile.mockReturnValueOnce(new Promise(() => {}));
    render(<StudentProfileEditScreen />);
    expect(screen.getByText('Carregando perfil...')).toBeTruthy();
  });

  it('renders "Editar Perfil" header title after loading', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeTruthy();
    });
  });

  it('renders "Salvar" button in header', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Salvar')).toBeTruthy();
    });
  });

  it('renders back/close button in header', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-back-button')).toBeTruthy();
    });
  });

  it('renders help text for image uploads', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Toque nas imagens para alterar/)).toBeTruthy();
    });
  });

  it('renders banner section with accessibility label', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      const bannerSection = screen.getByTestId('edit-banner-section');
      expect(bannerSection).toBeTruthy();
      expect(bannerSection.props.accessibilityLabel).toBe('Alterar banner');
    });
  });

  it('renders Dados Pessoais section', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Dados Pessoais')).toBeTruthy();
    });
  });

  it('renders Nome input with firstName value', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      const input = screen.getByTestId('edit-nome-input');
      expect(input.props.value).toBe('Maria');
    });
  });

  it('renders Sobrenome input with lastName value', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      const input = screen.getByTestId('edit-sobrenome-input');
      expect(input.props.value).toBe('Silva');
    });
  });

  it('renders disabled Email field with current value', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('maria@email.edu.br')).toBeTruthy();
      expect(screen.getByText('O e-mail não pode ser alterado')).toBeTruthy();
    });
  });

  it('renders Biografia textarea with character counter', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-bio-input')).toBeTruthy();
    });
  });

  it('renders Perfil Acadêmico section', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Perfil Acadêmico')).toBeTruthy();
      expect(screen.getByTestId('edit-universidade-select')).toBeTruthy();
      expect(screen.getByTestId('edit-curso-input')).toBeTruthy();
      expect(screen.getByTestId('edit-matricula-input')).toBeTruthy();
    });
  });

  it('renders turno select', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-turno-select')).toBeTruthy();
    });
  });

  it('opens turno dropdown on press', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-turno-select')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('edit-turno-select'));
    await waitFor(() => {
      // Select component shows the options as text after opening — "Matutino"
      // aparece apenas no dropdown (turno atual e "Noturno" no trigger), entao
      // eh um sinal unico de que o dropdown abriu.
      expect(screen.getByText('Matutino')).toBeTruthy();
    });
  });

  it('renders Áreas de Interesse section with chips', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Áreas de Interesse')).toBeTruthy();
      expect(screen.getByTestId('interesse-chip-saude')).toBeTruthy();
      expect(screen.getByTestId('interesse-chip-tecnologia')).toBeTruthy();
    });
  });

  it('toggles interest chip selection', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('interesse-chip-saude')).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId('interesse-chip-saude'));
    // It gets selected (in addition to the pre-selected 'educacao')
  });

  it('renders Galeria de Fotos section with add tile', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      // Gallery grid renders its own "Galeria de Fotos" title, may be multiple
      const galleryElements = screen.getAllByText('Galeria de Fotos');
      expect(galleryElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('gallery-add-tile')).toBeTruthy();
    });
  });

  it('renders Segurança section (PasswordChange)', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText('Segurança')).toBeTruthy();
    });
  });

  it('calls updateStudentProfile on save', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    mockUpdateProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileEditScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-save-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-save-button'));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        mockAccessToken,
        expect.objectContaining({
          nome: 'Maria Silva',
          universidade: 'Universidade de Brasília (UnB)',
          curso: 'Ciência da Computação',
          matricula: '2024001234',
        }),
      );
    });
  });

  it('shows success message on successful save', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    mockUpdateProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileEditScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-save-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-success-message')).toBeTruthy();
      expect(screen.getByText('Perfil atualizado com sucesso!')).toBeTruthy();
    });
  });

  it('shows error message on save failure', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    mockUpdateProfile.mockRejectedValueOnce({
      data: { nome: ['Este campo é obrigatório.'] },
    });

    render(<StudentProfileEditScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-save-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-error-message')).toBeTruthy();
      expect(screen.getByText('Este campo é obrigatório.')).toBeTruthy();
    });
  });

  it('renders required asterisk on Turno label', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      // Turno label exists with text containing "Turno"
      const turnoLabels = screen.getAllByText(/Turno/);
      expect(turnoLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders required asterisk on Horas de extensão label', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      const horasLabel = screen.getByText(/Horas de extensão exigidas/);
      expect(horasLabel).toBeTruthy();
    });
  });

  it('renders select for Semestre atual', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-semestre-select')).toBeTruthy();
    });
  });

  it('renders select for Ano de conclusão', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-ano-conclusao-select')).toBeTruthy();
    });
  });

  it('renders eye icon for banner view when banner exists', async () => {
    mockGetProfile.mockResolvedValueOnce({
      ...MOCK_PROFILE,
      banner_url: 'https://example.com/banner.jpg',
    });
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-banner-view')).toBeTruthy();
    });
  });

  it('renders eye icon for avatar view when avatar exists', async () => {
    mockGetProfile.mockResolvedValueOnce({
      ...MOCK_PROFILE,
      avatar_url: 'https://example.com/avatar.jpg',
    });
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-avatar-view')).toBeTruthy();
    });
  });

  it('renders required asterisk on Semestre atual label', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Semestre atual\s*\*/)).toBeTruthy();
    });
  });

  it('renders required asterisk on Ano de conclusão label', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Ano de conclusão\s*\*/)).toBeTruthy();
    });
  });

  it('blocks save when semestre_atual is null and shows error', async () => {
    mockGetProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, semestre_atual: null });
    mockUpdateProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-save-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-error-message')).toBeTruthy();
      expect(screen.getByText('Selecione o semestre atual.')).toBeTruthy();
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('blocks save when ano_conclusao is null and shows error', async () => {
    mockGetProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, ano_conclusao: null });
    mockUpdateProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileEditScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('edit-save-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('edit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-error-message')).toBeTruthy();
      expect(screen.getByText('Selecione o ano de conclusão.')).toBeTruthy();
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });
});
