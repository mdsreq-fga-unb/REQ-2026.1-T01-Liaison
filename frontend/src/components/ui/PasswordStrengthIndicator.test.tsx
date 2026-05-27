import { render, screen } from '@testing-library/react-native';
import React from 'react';

import PasswordStrengthIndicator from './PasswordStrengthIndicator';

describe('PasswordStrengthIndicator', () => {
  it('renders with no bars filled when password is empty', () => {
    render(<PasswordStrengthIndicator password="" />);
    const emptyBars = screen.getAllByTestId('strength-bar-empty');
    expect(emptyBars.length).toBeGreaterThanOrEqual(4);
  });

  it('shows weak strength (1 bar) for short password under 8 chars', () => {
    render(<PasswordStrengthIndicator password="Ab1" />);
    const filledBars = screen.getAllByTestId('strength-bar-filled');
    expect(filledBars).toHaveLength(1);
  });

  it('shows weak strength label for short password', () => {
    render(<PasswordStrengthIndicator password="Ab1" />);
    expect(screen.getByText(/fraca/i)).toBeTruthy();
  });

  it('shows medium strength (2 bars) for password with only letters', () => {
    render(<PasswordStrengthIndicator password="AbcdefGH" />);
    const filledBars = screen.getAllByTestId('strength-bar-filled');
    expect(filledBars.length).toBeGreaterThanOrEqual(2);
    expect(filledBars.length).toBeLessThan(4);
  });

  it('shows medium strength label for letters-only password', () => {
    render(<PasswordStrengthIndicator password="Abcdefgh" />);
    expect(screen.getByText(/média/i)).toBeTruthy();
  });

  it('shows strong strength (4 bars) for valid password with 8+ chars, letters+numbers', () => {
    render(<PasswordStrengthIndicator password="Senha123" />);
    const filledBars = screen.getAllByTestId('strength-bar-filled');
    expect(filledBars).toHaveLength(4);
  });

  it('shows strong strength label for valid password', () => {
    render(<PasswordStrengthIndicator password="Senha123" />);
    expect(screen.getByText(/forte/i)).toBeTruthy();
  });

  it('renders 4 bar containers total', () => {
    render(<PasswordStrengthIndicator password="" />);
    const allBars = screen.getAllByTestId(/strength-bar/);
    expect(allBars).toHaveLength(4);
  });
});
