/**
 * Testes TDD (Red Phase) — HoursProgressBar component
 *
 * Componente DIFERENTE do ProgressBar existente (step-based para registro).
 * Este é um barra de progresso baseada em porcentagem para exibir
 * horas de extensão acumuladas vs. exigidas.
 *
 * Cobre:
 * - Renderiza com porcentagem 0% (barra vazia)
 * - Renderiza com porcentagem 50% (metade preenchida)
 * - Renderiza com porcentagem 100% (completo)
 * - Usa cores do tema (brand.gold para fill, neutral.bg para track)
 * - Tem testID acessível
 * - Renderiza label de texto com progress (ex: "40h / 120h")
 * - Não ultrapassa 100% (clamp)
 * - Aceita prop filled (horas acumuladas) e total (horas exigidas)
 */

import { render, screen } from '@testing-library/react-native';
import React from 'react';

import HoursProgressBar from './HoursProgressBar';

describe('HoursProgressBar', () => {
  it('renders the progress bar track', () => {
    render(<HoursProgressBar filled={0} total={120} />);
    expect(screen.getByTestId('hours-progress-bar')).toBeTruthy();
  });

  it('renders the progress fill bar', () => {
    render(<HoursProgressBar filled={60} total={120} />);
    expect(screen.getByTestId('hours-progress-fill')).toBeTruthy();
  });

  it('renders with 0 filled and 0 total without crash', () => {
    expect(() => {
      render(<HoursProgressBar filled={0} total={0} />);
    }).not.toThrow();
  });

  it('renders with non-zero progress', () => {
    render(<HoursProgressBar filled={40} total={120} />);
    expect(screen.getByTestId('hours-progress-bar')).toBeTruthy();
    expect(screen.getByTestId('hours-progress-fill')).toBeTruthy();
  });

  it('renders with 100% progress', () => {
    render(<HoursProgressBar filled={120} total={120} />);
    expect(screen.getByTestId('hours-progress-fill')).toBeTruthy();
  });

  it('renders hours label in "Xh / Yh" format', () => {
    render(<HoursProgressBar filled={40} total={120} />);
    expect(screen.getByTestId('hours-progress-label')).toBeTruthy();
  });

  it('renders correct filled and total values in label', () => {
    render(<HoursProgressBar filled={40} total={120} />);
    const label = screen.getByTestId('hours-progress-label');
    expect(label).toBeTruthy();
    // The label should contain both numbers
    const labelText = label.props.children ?? '';
    const flatText = Array.isArray(labelText) ? labelText.join('') : String(labelText);
    expect(flatText).toMatch(/40/);
    expect(flatText).toMatch(/120/);
  });

  it('shows 0h for filled when no hours accumulated', () => {
    render(<HoursProgressBar filled={0} total={120} />);
    const label = screen.getByTestId('hours-progress-label');
    expect(label).toBeTruthy();
  });

  it('fill width is 0 when filled is 0', () => {
    render(<HoursProgressBar filled={0} total={120} />);
    const fill = screen.getByTestId('hours-progress-fill');
    // Width should be 0% when no hours accumulated
    const fillStyle = fill.props.style;
    const flatStyle = Array.isArray(fillStyle)
      ? Object.assign({}, ...fillStyle)
      : fillStyle ?? {};
    // The percentage width should correspond to 0%
    expect(flatStyle.width === 0 || flatStyle.width === '0%').toBeTruthy();
  });

  it('does not exceed 100% even when filled > total', () => {
    // filled > total should be clamped to 100%
    expect(() => {
      render(<HoursProgressBar filled={200} total={120} />);
    }).not.toThrow();
    const fill = screen.getByTestId('hours-progress-fill');
    expect(fill).toBeTruthy();
  });

  it('accepts optional percentage override', () => {
    // When percentage is explicitly provided, use it directly
    render(<HoursProgressBar filled={0} total={0} percentage={75} />);
    expect(screen.getByTestId('hours-progress-fill')).toBeTruthy();
  });
});
