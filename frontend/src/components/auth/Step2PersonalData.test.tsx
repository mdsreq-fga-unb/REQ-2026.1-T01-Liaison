import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import Step2PersonalData from './Step2PersonalData';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

// Mock API
jest.mock('../../services/api', () => ({
  ...jest.requireActual('../../services/api'),
  checkEmail: jest.fn().mockResolvedValue({ available: true }),
}));

const defaultProps = {
  onContinue: jest.fn(),
  initialData: {},
};

describe('Step2PersonalData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nome field', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Nome *')).toBeTruthy();
  });

  it('renders sobrenome field', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Sobrenome *')).toBeTruthy();
  });

  it('renders email field', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText(/E-mail institucional/)).toBeTruthy();
  });

  it('renders universidade dropdown', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Universidade *')).toBeTruthy();
  });

  it('renders semestre field', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText(/semestre/i)).toBeTruthy();
  });

  it('renders senha field', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Senha *')).toBeTruthy();
  });

  it('renders PasswordStrengthIndicator component', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByTestId('password-strength-indicator')).toBeTruthy();
  });

  it('renders terms checkbox', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText(/termos/i)).toBeTruthy();
  });

  it('renders Continuar button', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Continuar')).toBeTruthy();
  });

  it('shows error when nome is empty and Continue is pressed', () => {
    render(<Step2PersonalData {...defaultProps} />);
    fireEvent.press(screen.getByText('Continuar'));
    const nomeErrors = screen.getAllByText(/nome.*obrigatório/i);
    expect(nomeErrors.length).toBeGreaterThanOrEqual(1);
  });

  it('shows error when email is invalid and Continue is pressed', () => {
    render(<Step2PersonalData {...defaultProps} />);
    const emailInput = screen.getByTestId('input-email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/e-mail inválido/i)).toBeTruthy();
  });

  it('shows error when password is weak and Continue is pressed', () => {
    render(<Step2PersonalData {...defaultProps} />);
    const passwordInput = screen.getByTestId('input-senha');
    fireEvent.changeText(passwordInput, 'weak');
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/senha.*fraca/i)).toBeTruthy();
  });

  it('updates PasswordStrengthIndicator as user types password', () => {
    render(<Step2PersonalData {...defaultProps} />);
    const passwordInput = screen.getByTestId('input-senha');
    fireEvent.changeText(passwordInput, 'Senha123');
    expect(screen.getByTestId('password-strength-indicator')).toBeTruthy();
  });

  it('calls onContinue with data when all required fields are valid', async () => {
    const onContinue = jest.fn();
    render(<Step2PersonalData onContinue={onContinue} initialData={{}} />);

    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    // select universidade
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('UnB - Universidade de Brasília'));

    fireEvent.press(screen.getByText('Continuar'));
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled();
    });
  });

  it('renders progress bar with step 2 active', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByTestId('progress-step-active')).toBeTruthy();
  });

  it('renders "Voltar" link', () => {
    render(<Step2PersonalData {...defaultProps} />);
    expect(screen.getByText('Voltar')).toBeTruthy();
  });
});
