/**
 * OpportunityDetailScreen (RF09/RF10)
 * Cobre: CTA por auth/status, estado not-found, fluxo de candidatura (modal → POST).
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { id: 'opp-1' } }),
}));

jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }), { virtual: true });

// Mutable auth state so each test can tweak role / isAuthenticated.
const mockAuth: any = {
  user: { id: '1', email: 'a@b.com', nome: 'João', role: 'estudante' },
  accessToken: 'tok',
  isAuthenticated: true,
};
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

jest.mock('../../../services/opportunities', () => ({
  getOpportunity: jest.fn(),
  saveOpportunity: jest.fn(),
  unsaveOpportunity: jest.fn(),
}));
jest.mock('../../../services/applications', () => ({
  createApplication: jest.fn(),
}));

import * as oppService from '../../../services/opportunities';
import * as appService from '../../../services/applications';

const mockGetOpportunity = oppService.getOpportunity as jest.MockedFunction<typeof oppService.getOpportunity>;
const mockCreateApplication = appService.createApplication as jest.MockedFunction<typeof appService.createApplication>;

const baseOpp = {
  id: 'opp-1',
  title: 'Tutoria de Matemática',
  organization: { id: 'org-1', razao_social: 'ONG X', nome_fantasia: 'X', logo: null, mission: 'Ajudar', areas_de_atuacao: ['educacao'] },
  area: 'educacao',
  description: 'Apoio escolar',
  workload_value: 4,
  workload_unit: 'h/semana',
  vacancies: 10,
  modality: 'presencial',
  location: 'Brasília',
  start_date: '2026-07-01',
  start_time: '09:00',
  schedule: [],
  requirements: ['Ensino médio completo'],
  preferred_courses: [],
  status: 'active',
  photos: [],
  is_saved: false,
  applicants_count: 0,
  already_applied: false,
};

import OpportunityDetailScreen from '../OpportunityDetailScreen';

describe('OpportunityDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.user = { id: '1', email: 'a@b.com', nome: 'João', role: 'estudante' };
    mockAuth.accessToken = 'tok';
    mockAuth.isAuthenticated = true;
    mockGetOpportunity.mockResolvedValue({ ...baseOpp });
  });

  it('renders sections for an active opportunity', async () => {
    render(<OpportunityDetailScreen />);
    expect(await screen.findByText('Tutoria de Matemática')).toBeTruthy();
    expect(screen.getByText('Apoio escolar')).toBeTruthy();
    expect(screen.getByText('Ensino médio completo')).toBeTruthy();
  });

  it('shows "Candidatar-se" for authenticated student on active', async () => {
    render(<OpportunityDetailScreen />);
    expect(await screen.findByTestId('apply-button')).toBeTruthy();
  });

  it('shows login CTA when not authenticated', async () => {
    mockAuth.isAuthenticated = false;
    mockAuth.user = null;
    render(<OpportunityDetailScreen />);
    expect(await screen.findByTestId('login-cta')).toBeTruthy();
    expect(screen.queryByTestId('apply-button')).toBeNull();
  });

  it('hides CTA and shows closed notice for closed opportunity', async () => {
    mockGetOpportunity.mockResolvedValue({ ...baseOpp, status: 'closed' });
    render(<OpportunityDetailScreen />);
    expect(await screen.findByTestId('closed-notice')).toBeTruthy();
    expect(screen.queryByTestId('apply-button')).toBeNull();
  });

  it('shows "Candidatura enviada" when already applied', async () => {
    mockGetOpportunity.mockResolvedValue({ ...baseOpp, already_applied: true });
    render(<OpportunityDetailScreen />);
    expect(await screen.findByTestId('applied-button')).toBeTruthy();
  });

  it('renders not-found state on fetch error', async () => {
    mockGetOpportunity.mockRejectedValue(new Error('HTTP error 404'));
    render(<OpportunityDetailScreen />);
    expect(await screen.findByText('Vaga não encontrada')).toBeTruthy();
  });

  it('applies via modal: confirm → POST → "Candidatura enviada"', async () => {
    mockCreateApplication.mockResolvedValue({ id: 'a1', status: 'pending' });
    render(<OpportunityDetailScreen />);
    const applyBtn = await screen.findByTestId('apply-button');
    await act(async () => { fireEvent.press(applyBtn); });
    const confirm = await screen.findByTestId('confirm-apply');
    await act(async () => { fireEvent.press(confirm); });
    await waitFor(() => expect(mockCreateApplication).toHaveBeenCalledWith('tok', 'opp-1'));
    expect(await screen.findByTestId('applied-button')).toBeTruthy();
  });

  it('shows error in modal on duplicate (400)', async () => {
    mockCreateApplication.mockRejectedValue(new Error('Você já se candidatou a esta vaga.'));
    render(<OpportunityDetailScreen />);
    const applyBtn = await screen.findByTestId('apply-button');
    await act(async () => { fireEvent.press(applyBtn); });
    const confirm = await screen.findByTestId('confirm-apply');
    await act(async () => { fireEvent.press(confirm); });
    expect(await screen.findByTestId('apply-error')).toBeTruthy();
  });
});
