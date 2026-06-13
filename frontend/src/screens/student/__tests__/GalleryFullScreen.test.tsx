import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { jest } from '@jest/globals';

// ── Mock navigation ──────────────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

// ── Mock AuthContext ──────────────────────────────────────────────────
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

// ── Mock ImageViewer component ────────────────────────────────────────
jest.mock('../../../components/profile/ImageViewer', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    __esModule: true,
    default: ({ visible, imageUrl, onClose }: { visible: boolean; imageUrl: string; onClose: () => void }) => {
      if (!visible) return null;
      return React.createElement(
        View,
        { testID: 'gallery-image-viewer' },
        React.createElement(Text, { testID: 'image-viewer-url' }, imageUrl),
        React.createElement(
          TouchableOpacity,
          { testID: 'image-viewer-close', onPress: onClose },
          React.createElement(Text, null, 'Close'),
        ),
      );
    },
  };
});

// ── Mock API ──────────────────────────────────────────────────────────
const mockGetProfile = jest.fn();
jest.mock('../../../services/api', () => ({
  getStudentProfile: (...args: any[]) => mockGetProfile(...args),
}));

// ── Mock expo vector icons (prevents native module errors) ────────────
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, size, color }: any) =>
      React.createElement(Text, null, `icon:${name}`),
  };
});

// ═══════════════════════════════════════════════════════════════════════
// Import component AFTER all mocks are established
// ═══════════════════════════════════════════════════════════════════════
import GalleryFullScreen from '../GalleryFullScreen';

// ── Test Data ─────────────────────────────────────────────────────────

const MOCK_PHOTOS = Array.from({ length: 15 }, (_, i) => ({
  id: `photo-${i + 1}`,
  image_url: i % 3 === 0 ? '' : `http://test.com/photo${i + 1}.jpg`,
  created_at: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
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
  gallery: MOCK_PHOTOS,
  stats: {
    total_hours_completed: 120,
    total_hours_required: 200,
    total_events: 8,
  },
  events: [],
};

const FEW_PHOTOS = MOCK_PHOTOS.slice(0, 5);
const MOCK_PROFILE_FEW = { ...MOCK_PROFILE, gallery: FEW_PHOTOS };

const MOCK_PROFILE_EMPTY = { ...MOCK_PROFILE, gallery: [] };

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════

describe('GalleryFullScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProfile.mockReset();
  });

  // ── 1. Loading state ──────────────────────────────────────────────
  it('shows "Carregando fotos..." while loading', () => {
    // Never-resolving promise keeps component in loading state
    mockGetProfile.mockReturnValueOnce(new Promise(() => {}));
    render(<GalleryFullScreen />);
    expect(screen.getByText('Carregando fotos...')).toBeTruthy();
  });

  // ── 2. Gallery with photos ────────────────────────────────────────
  it('renders photos in a grid and shows photo count after loading', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.getByText('15 fotos')).toBeTruthy();
    });

    // First 12 photos (PAGE_SIZE) should be visible
    expect(screen.getByTestId('gallery-full-photo-photo-1')).toBeTruthy();
    expect(screen.getByTestId('gallery-full-photo-photo-2')).toBeTruthy();
    expect(screen.getByTestId('gallery-full-photo-photo-12')).toBeTruthy();
  });

  // ── 3. Less than PAGE_SIZE photos → no "Carregar mais" ────────────
  it('does not show "Carregar mais" button when photos < PAGE_SIZE', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_FEW);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByText('5 fotos')).toBeTruthy();
    });

    expect(screen.queryByTestId('gallery-full-load-more')).toBeNull();
  });

  // ── 4. More than PAGE_SIZE → "Carregar mais" ──────────────────────
  it('shows "Carregar mais" button when photos exceed PAGE_SIZE', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-full-load-more')).toBeTruthy();
    });

    expect(screen.getByText(/Carregar mais fotos/)).toBeTruthy();
    // 15 total - 12 visible = 3 remaining
    expect(screen.getByText(/3 restantes/)).toBeTruthy();
  });

  // ── 5. Load more click increases displayed count ──────────────────
  it('increases displayed photo count when "Carregar mais" is pressed', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-full-load-more')).toBeTruthy();
    });

    // Before load more: photo-13 should not be in the DOM
    expect(screen.queryByTestId('gallery-full-photo-photo-13')).toBeNull();

    fireEvent.press(screen.getByTestId('gallery-full-load-more'));

    // Wait for the 300ms setTimeout to flush and state to update
    await waitFor(
      () => {
        expect(screen.getByTestId('gallery-full-photo-photo-13')).toBeTruthy();
      },
      { timeout: 1000 },
    );

    // All 15 photos now visible; "Carregar mais" should be gone
    expect(screen.queryByTestId('gallery-full-load-more')).toBeNull();
  });

  // ── 6. Photo tap opens viewer ─────────────────────────────────────
  it('opens ImageViewer when a photo with an image_url is tapped', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-full-photo-photo-2')).toBeTruthy();
    });

    // photo-2 has image_url = 'http://test.com/photo2.jpg'
    fireEvent.press(screen.getByTestId('gallery-full-photo-photo-2'));

    await waitFor(() => {
      expect(screen.getByTestId('gallery-image-viewer')).toBeTruthy();
    });

    expect(screen.getByTestId('image-viewer-url').props.children).toBe(
      'http://test.com/photo2.jpg',
    );
  });

  // ── 6b. Photo without image_url does NOT open viewer ──────────────
  it('does NOT open viewer when tapping a photo with empty image_url', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-full-photo-photo-1')).toBeTruthy();
    });

    // photo-1 has image_url = '' (i=0, 0%3===0)
    fireEvent.press(screen.getByTestId('gallery-full-photo-photo-1'));

    // Viewer should NOT appear
    expect(screen.queryByTestId('gallery-image-viewer')).toBeNull();
  });

  // ── 7. Back button calls navigation.goBack ────────────────────────
  it('calls navigation.goBack when back button is pressed', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByTestId('gallery-full-back')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('gallery-full-back'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  // ── 8. Error state ────────────────────────────────────────────────
  it('shows error message and "Tentar novamente" button when API fails', async () => {
    mockGetProfile.mockRejectedValueOnce(new Error('Network failure'));
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar as fotos.')).toBeTruthy();
    });

    // Retry button present
    expect(screen.getByText('Tentar novamente')).toBeTruthy();

    // Press retry — should call getStudentProfile again
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_EMPTY);
    fireEvent.press(screen.getByText('Tentar novamente'));

    await waitFor(() => {
      expect(screen.getByText('Nenhuma foto na galeria')).toBeTruthy();
    });

    expect(mockGetProfile).toHaveBeenCalledTimes(2);
  });

  // ── 9. Empty gallery ──────────────────────────────────────────────
  it('shows "Nenhuma foto na galeria" when gallery is empty', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE_EMPTY);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma foto na galeria')).toBeTruthy();
    });

    // Photo count should show 0
    expect(screen.getByText('0 fotos')).toBeTruthy();
  });

  // ── 10. Header title is always present ────────────────────────────
  it('renders "Galeria de Fotos" header title', async () => {
    mockGetProfile.mockResolvedValueOnce(MOCK_PROFILE);
    render(<GalleryFullScreen />);

    await waitFor(() => {
      expect(screen.getByText('Galeria de Fotos')).toBeTruthy();
    });
  });
});
