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
  interesses: ['educacao', 'tecnologia'],
  bio: 'Estudante apaixonada por tecnologia.',
  avatar_url: null,
  banner_url: null,
  gallery: [],
  stats: {
    total_hours_completed: 120,
    total_hours_required: 200,
    total_events: 8,
  },
  events: [
    {
      category: 'tecnologia',
      title: 'Hackathon Solidário',
      organization: 'Tech4Good',
      date: '2026-05-20',
      status: 'concluído' as const,
      hours: 20,
    },
  ],
};

// MOCK with 6+ gallery photos to test grid rendering, view-all navigation, and image viewer
const MOCK_GALLERY_PHOTOS = [
  { id: 'photo-1', image_url: 'https://example.com/photo1.jpg', created_at: '2026-01-10' },
  { id: 'photo-2', image_url: 'https://example.com/photo2.jpg', created_at: '2026-01-11' },
  { id: 'photo-3', image_url: 'https://example.com/photo3.jpg', created_at: '2026-01-12' },
  { id: 'photo-4', image_url: 'https://example.com/photo4.jpg', created_at: '2026-01-13' },
  { id: 'photo-5', image_url: 'https://example.com/photo5.jpg', created_at: '2026-01-14' },
  { id: 'photo-6', image_url: 'https://example.com/photo6.jpg', created_at: '2026-01-15' },
];

const MOCK_PROFILE_WITH_GALLERY = {
  ...MOCK_PROFILE,
  gallery: MOCK_GALLERY_PHOTOS,
};

// Mock getStudentProfile
const mockGetProfile = jest.fn();
jest.mock('../../../services/api', () => ({
  getStudentProfile: (...args: any[]) => mockGetProfile(...args),
}));

import StudentProfileScreen from '../StudentProfileScreen';

describe('StudentProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockReset();
  });

  it('shows loading state initially', () => {
    // Never resolve to keep loading state
    mockGetProfile.mockReturnValueOnce(new Promise(() => {}));

    render(<StudentProfileScreen />);
    expect(screen.getByText('Carregando perfil...')).toBeTruthy();
  });

  it('renders header with "Meu Perfil" title after loading', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeTruthy();
    });
  });

  it('renders the "Editar" button in header', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeTruthy();
    });
  });

  it('renders student name', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeTruthy();
    });
  });

  it('renders course info with university and semester', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      // Course info appears in multiple places (header + academic data row)
      const courseElements = screen.getAllByText(/Ciência da Computação/);
      expect(courseElements.length).toBeGreaterThanOrEqual(1);
      const uniElements = screen.getAllByText(/UnB/);
      expect(uniElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders the "Estudante" badge', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Estudante')).toBeTruthy();
    });
  });

  it('renders progress bar with hours', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText(/120h \/ 200h/)).toBeTruthy();
    });
  });

  it('renders stats section with hours and events', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('120h')).toBeTruthy();
      expect(screen.getByText('8')).toBeTruthy();
      expect(screen.getByText('Horas de Extensão')).toBeTruthy();
      expect(screen.getByText('Eventos')).toBeTruthy();
    });
  });

  it('renders biography section when bio exists', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Biografia')).toBeTruthy();
      expect(screen.getByText('Estudante apaixonada por tecnologia.')).toBeTruthy();
    });
  });

  it('does not render biography section when bio is empty', async () => {
    mockGetProfile.mockResolvedValueOnce({
      ...MOCK_PROFILE,
      bio: '',
    });

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeTruthy();
    });

    // Biography should not appear
    expect(() => screen.getByText('Biografia')).toThrow();
  });

  it('renders interests chips', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Áreas de Interesse')).toBeTruthy();
      expect(screen.getByText('Educacao')).toBeTruthy();
      // Tecnologia appears both as interese chip and in event category
      const tecElements = screen.getAllByText('Tecnologia');
      expect(tecElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders academic data rows', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Dados Acadêmicos')).toBeTruthy();
      expect(screen.getByText('Universidade')).toBeTruthy();
      expect(screen.getByText('Curso')).toBeTruthy();
      expect(screen.getByText('Matrícula')).toBeTruthy();
    });
  });

  it('renders events section when events exist', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Eventos Participados')).toBeTruthy();
      expect(screen.getByText('Hackathon Solidário')).toBeTruthy();
      expect(screen.getByText(/Tech4Good/)).toBeTruthy();
      expect(screen.getByText('20h')).toBeTruthy();
    });
  });

  it('navigates to edit screen when "Editar" is pressed', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-edit-button')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('profile-edit-button'));
    expect(mockNavigate).toHaveBeenCalledWith('StudentProfileEdit');
  });

  it('shows error state on API failure', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Network error'));

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar o perfil. Tente novamente.')).toBeTruthy();
    });
  });

  it('shows "Tentar novamente" button on error', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Network error'));

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Tentar novamente')).toBeTruthy();
    });
  });

  // ── Gallery section ──────────────────────────────────────────────

  it('renders gallery section title', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText('Galeria de Fotos')).toBeTruthy();
    });
  });

  // ── C6: GalleryPreview renders with photos ────────────────────────

  it('renders GalleryPreview with hero photo and thumbnails when gallery has photos', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_WITH_GALLERY);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      // Gallery section title
      expect(screen.getByText('Galeria de Fotos')).toBeTruthy();
      // Hero photo (photo-1 is the first)
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
      // Thumbnails for photos 2-5
      expect(screen.getByTestId('gallery-thumb-photo-2')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-photo-3')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-photo-4')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-photo-5')).toBeTruthy();
    });
  });

  // ── C6: "Ver todas as fotos" navigates to GalleryFull ─────────────

  it('navigates to GalleryFull when "Ver todas as fotos" is pressed', async () => {
    // GalleryPreview shows "Ver todas as fotos" only when photos.length > 5
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_WITH_GALLERY);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-view-all')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('gallery-view-all'));
    expect(mockNavigate).toHaveBeenCalledWith('GalleryFull');
  });

  // ── C6: Tapping a photo opens ImageViewer ─────────────────────────

  it('opens ImageViewer modal when a gallery photo is pressed', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_WITH_GALLERY);

    render(<StudentProfileScreen />);

    // Wait for the gallery hero to render
    await waitFor(() => {
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
    });

    // Tap the hero photo
    fireEvent.press(screen.getByTestId('gallery-hero-photo'));

    // ImageViewer modal should now be visible
    await waitFor(() => {
      expect(screen.getByTestId('image-viewer')).toBeTruthy();
    });
  });

  it('closes ImageViewer when close button is pressed', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_WITH_GALLERY);

    render(<StudentProfileScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
    });

    // Open the viewer
    fireEvent.press(screen.getByTestId('gallery-hero-photo'));

    await waitFor(() => {
      expect(screen.getByTestId('image-viewer')).toBeTruthy();
    });

    // Close the viewer
    fireEvent.press(screen.getByTestId('image-viewer-close'));

    // The modal should be dismissed — testID "image-viewer" is the Modal itself
    // and after closing it should no longer be queryable
    await waitFor(() => {
      expect(screen.queryByTestId('image-viewer')).toBeNull();
    });
  });
});
