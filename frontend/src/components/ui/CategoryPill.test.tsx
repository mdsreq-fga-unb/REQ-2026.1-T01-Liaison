/**
 * Testes TDD (Red Phase) — CategoryPill component
 *
 * Cobre:
 * - Renderiza label e count
 * - Estado selecionado/não selecionado (style difference via testID)
 * - Chama onPress quando pressionado
 * - testID acessível para testes
 * - Prop color opcional
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import CategoryPill from './CategoryPill';

describe('CategoryPill', () => {
  const defaultProps = {
    label: 'Educação',
    count: 5,
    isSelected: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the label', () => {
    render(<CategoryPill {...defaultProps} />);
    expect(screen.getByText('Educação')).toBeTruthy();
  });

  it('renders the count', () => {
    render(<CategoryPill {...defaultProps} count={12} />);
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('renders testID for the pill', () => {
    render(<CategoryPill {...defaultProps} />);
    expect(screen.getByTestId('category-pill')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<CategoryPill {...defaultProps} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('category-pill'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders in selected state', () => {
    render(<CategoryPill {...defaultProps} isSelected />);
    expect(screen.getByTestId('category-pill-selected')).toBeTruthy();
  });

  it('renders in unselected state', () => {
    render(<CategoryPill {...defaultProps} isSelected={false} />);
    expect(screen.getByTestId('category-pill-unselected')).toBeTruthy();
  });

  it('renders with a color prop without error', () => {
    expect(() => {
      render(<CategoryPill {...defaultProps} color="#1d5faa" />);
    }).not.toThrow();
  });

  it('renders zero count', () => {
    render(<CategoryPill {...defaultProps} count={0} />);
    expect(screen.getByText('0')).toBeTruthy();
  });
});
