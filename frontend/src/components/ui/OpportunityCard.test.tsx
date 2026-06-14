/**
 * Testes TDD (Red Phase) — OpportunityCard component
 *
 * Cobre:
 * - Renderiza título da vaga
 * - Renderiza nome da organização
 * - Renderiza badge de área
 * - Renderiza modalidade
 * - Renderiza localização
 * - Renderiza data de início
 * - Renderiza carga horária
 * - Renderiza contagem de vagas (X de Y vagas)
 * - Renderiza botão de salvar (ícone de bookmark)
 * - Chama onSave quando bookmark é pressionado
 * - Chama onPress quando o card é pressionado
 * - Estado is_saved refletido no ícone (bookmark vs bookmark-outline)
 * - Featured card tem indicador visual diferente (testID)
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import OpportunityCard from './OpportunityCard';

const BASE_OPPORTUNITY = {
  id: 'uuid-opp-1',
  title: 'Tutoria de Matemática',
  organization: {
    id: 'uuid-org-1',
    razao_social: 'ONG Educação Ltda',
  },
  area: 'educacao',
  description: 'Apoio a estudantes do ensino médio em matemática.',
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

const DEFAULT_PROPS = {
  opportunity: BASE_OPPORTUNITY,
  isSaved: false,
  onSave: jest.fn(),
  onPress: jest.fn(),
};

describe('OpportunityCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the opportunity title', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Tutoria de Matemática')).toBeTruthy();
  });

  it('renders the organization name', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('ONG Educação Ltda')).toBeTruthy();
  });

  it('renders the area badge', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    // Should render some text related to educacao area
    expect(screen.getByTestId('opportunity-area-badge')).toBeTruthy();
  });

  it('renders the modality', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('opportunity-modality')).toBeTruthy();
  });

  it('renders the location', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByText('Brasília - DF')).toBeTruthy();
  });

  it('renders the start date', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    // Date should be displayed in some human-readable format
    expect(screen.getByTestId('opportunity-date')).toBeTruthy();
  });

  it('renders the workload', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('opportunity-workload')).toBeTruthy();
  });

  it('renders the vacancies count', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('opportunity-vacancies')).toBeTruthy();
  });

  it('renders save button', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('save-button')).toBeTruthy();
  });

  it('calls onSave when save button is pressed', () => {
    const onSave = jest.fn();
    render(<OpportunityCard {...DEFAULT_PROPS} onSave={onSave} />);
    fireEvent.press(screen.getByTestId('save-button'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onPress when card is pressed', () => {
    const onPress = jest.fn();
    render(<OpportunityCard {...DEFAULT_PROPS} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('opportunity-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders saved bookmark icon when isSaved is true', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} isSaved={true} />);
    // Ionicons mock renders "[icon:bookmark]" when saved
    expect(screen.getByText('[icon:bookmark]')).toBeTruthy();
  });

  it('renders unsaved bookmark-outline icon when isSaved is false', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} isSaved={false} />);
    // Ionicons mock renders "[icon:bookmark-outline]" when not saved
    expect(screen.getByText('[icon:bookmark-outline]')).toBeTruthy();
  });

  it('renders featured indicator when opportunity is featured', () => {
    const featuredOpp = { ...BASE_OPPORTUNITY, featured: true };
    render(<OpportunityCard {...DEFAULT_PROPS} opportunity={featuredOpp} />);
    expect(screen.getByTestId('featured-indicator')).toBeTruthy();
  });

  it('does not render featured indicator when not featured', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.queryByTestId('featured-indicator')).toBeNull();
  });

  it('renders card with testID opportunity-card', () => {
    render(<OpportunityCard {...DEFAULT_PROPS} />);
    expect(screen.getByTestId('opportunity-card')).toBeTruthy();
  });

  it('renders with remote modality', () => {
    const remoteOpp = { ...BASE_OPPORTUNITY, modality: 'remoto' };
    render(<OpportunityCard {...DEFAULT_PROPS} opportunity={remoteOpp} />);
    expect(screen.getByTestId('opportunity-modality')).toBeTruthy();
  });

  it('renders with hibrido modality', () => {
    const hibridoOpp = { ...BASE_OPPORTUNITY, modality: 'hibrido' };
    render(<OpportunityCard {...DEFAULT_PROPS} opportunity={hibridoOpp} />);
    expect(screen.getByTestId('opportunity-modality')).toBeTruthy();
  });
});
