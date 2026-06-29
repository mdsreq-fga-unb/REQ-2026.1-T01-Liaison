/**
 * Testes TDD (Red Phase) — StatCard component (Issue #20)
 *
 * Card de estatística do header do feed (ícone + valor + label).
 * Props: value, label, icon.
 *
 * Cobre:
 * - Renderiza o valor
 * - Renderiza o label
 * - Renderiza o ícone (Ionicons mock → "[icon:<name>]")
 * - testID acessível
 */

import { render, screen } from '@testing-library/react-native';
import React from 'react';

import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders the value', () => {
    render(<StatCard value="16h" label="acumuladas" icon="time-outline" />);
    expect(screen.getByText('16h')).toBeTruthy();
  });

  it('renders the label', () => {
    render(<StatCard value="3" label="inscrições ativas" icon="document-text-outline" />);
    expect(screen.getByText('inscrições ativas')).toBeTruthy();
  });

  it('renders the icon', () => {
    render(<StatCard value="5" label="salvas" icon="bookmark-outline" />);
    // @expo/vector-icons mock renders as Text "[icon:<name>]"
    expect(screen.getByText('[icon:bookmark-outline]')).toBeTruthy();
  });

  it('renders the stat-card testID', () => {
    render(<StatCard value="5" label="salvas" icon="bookmark-outline" />);
    expect(screen.getByTestId('stat-card')).toBeTruthy();
  });

  it('renders numeric value coerced to string', () => {
    render(<StatCard value={42} label="qualquer" icon="star-outline" />);
    expect(screen.getByText('42')).toBeTruthy();
  });
});
