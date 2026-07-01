/**
 * MyApplicationsScreen (RF12/US2.9 cancelamento, RF15/US3.4 download de certificado)
 * Cobre: cancelamento de candidatura pendente (sucesso/erro) e exibição/download
 * do certificado quando a organização registrou presença.
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
  useAuth: () => ({ accessToken: 'tok' }),
}));

jest.mock('../../../services/notifications', () => ({
  getNotifications: jest.fn().mockResolvedValue({ unread_count: 0 }),
}));

const mockGetMyApplications = jest.fn();
const mockCancelApplication = jest.fn();
jest.mock('../../../services/applications', () => ({
  getMyApplications: (...args: any[]) => mockGetMyApplications(...args),
  cancelApplication: (...args: any[]) => mockCancelApplication(...args),
}));

const mockDownloadFileAsync = jest.fn();
jest.mock('expo-file-system', () => ({
  File: { downloadFileAsync: (...args: any[]) => mockDownloadFileAsync(...args) },
  Directory: jest.fn(),
  Paths: { cache: 'cache-dir' },
}));

const mockIsAvailableAsync = jest.fn();
const mockShareAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: (...args: any[]) => mockIsAvailableAsync(...args),
  shareAsync: (...args: any[]) => mockShareAsync(...args),
}));

const mockStartActivityAsync = jest.fn();
jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: (...args: any[]) => mockStartActivityAsync(...args),
}));

import MyApplicationsScreen from '../MyApplicationsScreen';

const PENDING_APP = {
  id: 'app-1',
  opportunity: { id: 'opp-1', title: 'Apoio em Eventos', status: 'active', organization: { user_id: 'org-1', razao_social: 'ONG Solidária' } },
  status: 'pending',
  created_at: '2026-01-10',
  attendance: null,
  hours_completed: null,
  certificate: null,
};

const COMPLETED_APP = {
  id: 'app-2',
  opportunity: { id: 'opp-2', title: 'Tutoria', status: 'closed', organization: { user_id: 'org-2', razao_social: 'ONG Educa' } },
  status: 'completed',
  created_at: '2026-01-05',
  attendance: 'present',
  hours_completed: 20,
  certificate: { id: 'cert-1', download_url: 'http://api/certificates/cert-1/download/' },
};

const ABSENT_APP = {
  id: 'app-3',
  opportunity: { id: 'opp-3', title: 'Mutirão', status: 'closed', organization: { user_id: 'org-3', razao_social: 'ONG Verde' } },
  status: 'completed',
  created_at: '2026-01-03',
  attendance: 'absent',
  hours_completed: 0,
  certificate: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsAvailableAsync.mockResolvedValue(true);
});

describe('MyApplicationsScreen — cancelamento (US2.9)', () => {
  it('cancels a pending application and updates its status', async () => {
    mockGetMyApplications.mockResolvedValue([PENDING_APP]);
    mockCancelApplication.mockResolvedValue({ ...PENDING_APP, status: 'cancelled' });

    render(<MyApplicationsScreen />);
    await waitFor(() => expect(screen.getByText('Apoio em Eventos')).toBeTruthy());

    fireEvent.press(screen.getByTestId('cancel-button-app-1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('confirm-cancel-button'));
    });

    await waitFor(() => {
      expect(mockCancelApplication).toHaveBeenCalledWith('tok', 'app-1');
      expect(screen.getByText('CANCELADA')).toBeTruthy();
    });
  });

  it('shows an alert and keeps status when cancel fails (already evaluated)', async () => {
    const { Alert } = require('react-native');
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockGetMyApplications.mockResolvedValue([PENDING_APP]);
    mockCancelApplication.mockRejectedValue(new Error('Não é possível cancelar uma candidatura que já foi avaliada pela organização.'));

    render(<MyApplicationsScreen />);
    await waitFor(() => expect(screen.getByText('Apoio em Eventos')).toBeTruthy());

    fireEvent.press(screen.getByTestId('cancel-button-app-1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('confirm-cancel-button'));
    });

    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    expect(screen.getByText('AGUARDANDO')).toBeTruthy();
  });
});

describe('MyApplicationsScreen — certificado (US3.4)', () => {
  it('shows the download button only when a certificate was issued (presence confirmed)', async () => {
    mockGetMyApplications.mockResolvedValue([COMPLETED_APP, ABSENT_APP]);

    render(<MyApplicationsScreen />);
    await waitFor(() => expect(screen.getByText('Tutoria')).toBeTruthy());

    expect(screen.getByTestId('download-certificate-app-2')).toBeTruthy();
    expect(screen.queryByTestId('download-certificate-app-3')).toBeNull();
    expect(screen.getByText('PRESENÇA CONFIRMADA')).toBeTruthy();
    expect(screen.getByText('AUSENTE')).toBeTruthy();
  });

  it('downloads and opens the certificate PDF via share sheet on iOS', async () => {
    mockGetMyApplications.mockResolvedValue([COMPLETED_APP]);
    mockDownloadFileAsync.mockResolvedValue({ uri: 'file:///cache/cert.pdf' });

    render(<MyApplicationsScreen />);
    await waitFor(() => expect(screen.getByText('Tutoria')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByTestId('download-certificate-app-2'));
    });

    await waitFor(() => {
      expect(mockDownloadFileAsync).toHaveBeenCalledWith(
        'http://api/certificates/cert-1/download/',
        expect.anything(),
        expect.objectContaining({ headers: { Authorization: 'Bearer tok' } })
      );
      expect(mockShareAsync).toHaveBeenCalledWith('file:///cache/cert.pdf', expect.any(Object));
    });
    expect(mockStartActivityAsync).not.toHaveBeenCalled();
  });

  it('opens the certificate PDF in the system viewer on Android', async () => {
    const { Platform } = require('react-native');
    const originalOS = Platform.OS;
    Platform.OS = 'android';
    try {
      mockGetMyApplications.mockResolvedValue([COMPLETED_APP]);
      mockDownloadFileAsync.mockResolvedValue({
        uri: 'file:///cache/cert.pdf',
        contentUri: 'content://cache/cert.pdf',
      });

      render(<MyApplicationsScreen />);
      await waitFor(() => expect(screen.getByText('Tutoria')).toBeTruthy());

      await act(async () => {
        fireEvent.press(screen.getByTestId('download-certificate-app-2'));
      });

      await waitFor(() => {
        expect(mockStartActivityAsync).toHaveBeenCalledWith(
          'android.intent.action.VIEW',
          expect.objectContaining({ data: 'content://cache/cert.pdf', type: 'application/pdf' })
        );
      });
      expect(mockShareAsync).not.toHaveBeenCalled();
    } finally {
      Platform.OS = originalOS;
    }
  });
});
