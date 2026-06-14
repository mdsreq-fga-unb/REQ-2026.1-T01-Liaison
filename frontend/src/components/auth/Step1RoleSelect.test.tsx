import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Step1RoleSelect from './Step1RoleSelect';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

describe('Step1RoleSelect', () => {
  it('renders the Estudante card', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    expect(screen.getByText(/Estudante universitário/)).toBeTruthy();
  });

  it('renders the Organização card', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    expect(screen.getByText(/Organização social/)).toBeTruthy();
  });

  it('renders two role selection cards', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    const cards = [
      screen.getByTestId('radio-card-estudante'),
      screen.getByTestId('radio-card-organizacao'),
    ];
    expect(cards).toHaveLength(2);
  });

  it('continue button is disabled when no role is selected', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    const buttonEl = screen.getByTestId('button-touchable');
    expect(buttonEl.props.accessibilityState?.disabled).toBe(true);
  });

  it('continue button is enabled after selecting Estudante', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    const buttonEl = screen.getByTestId('button-touchable');
    expect(buttonEl.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('calls onContinue with role "estudante" when Estudante is selected and Continue is pressed', () => {
    const onContinue = jest.fn();
    render(<Step1RoleSelect onContinue={onContinue} />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));
    expect(onContinue).toHaveBeenCalledWith('estudante');
  });

  it('Organização card is enabled and can be selected', () => {
    const onContinue = jest.fn();
    render(<Step1RoleSelect onContinue={onContinue} />);
    const orgCard = screen.getByTestId('radio-card-organizacao');
    expect(orgCard.props.accessibilityState?.disabled).toBeFalsy();

    fireEvent.press(orgCard);
    fireEvent.press(screen.getByTestId('button-touchable'));
    expect(onContinue).toHaveBeenCalledWith('organizacao');
  });

  it('renders "Voltar" link', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    expect(screen.getByText('Voltar')).toBeTruthy();
  });

  it('renders footer with login link', () => {
    render(<Step1RoleSelect onContinue={() => {}} />);
    expect(screen.getByText(/fazer login/i)).toBeTruthy();
  });
});
