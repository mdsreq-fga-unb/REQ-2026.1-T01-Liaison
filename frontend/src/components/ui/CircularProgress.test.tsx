/**
 * Testes TDD (Red Phase) — CircularProgress component (Issue #20)
 *
 * Anel de progresso da meta de extensão. Mostra a porcentagem no centro.
 * Prop: percentage (0..100, clamp fora do range).
 * Usa react-native-svg (jest-expo transforma o módulo).
 *
 * Cobre:
 * - Renderiza o texto de porcentagem central
 * - Clamp: > 100 vira 100
 * - Clamp: < 0 vira 0
 * - testID acessível
 */

import { render, screen } from '@testing-library/react-native';
import React from 'react';

import CircularProgress from './CircularProgress';

describe('CircularProgress', () => {
  it('renders the percentage text in the center', () => {
    render(<CircularProgress percentage={42} />);
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('renders the circular-progress testID', () => {
    render(<CircularProgress percentage={50} />);
    expect(screen.getByTestId('circular-progress')).toBeTruthy();
  });

  it('clamps values above 100 to 100', () => {
    render(<CircularProgress percentage={150} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('clamps negative values to 0', () => {
    render(<CircularProgress percentage={-10} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('renders 0% at zero progress', () => {
    render(<CircularProgress percentage={0} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });
});
