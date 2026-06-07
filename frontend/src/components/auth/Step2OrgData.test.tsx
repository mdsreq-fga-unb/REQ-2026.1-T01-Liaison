import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import Step2OrgData from './Step2OrgData';

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

describe('Step2OrgData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<Step2OrgData {...defaultProps} />);
    expect(screen.getByText('Dados da instituição')).toBeTruthy();
    expect(screen.getByTestId('input-cnpj')).toBeTruthy();
    expect(screen.getByTestId('input-razao-social')).toBeTruthy();
    expect(screen.getByTestId('input-email')).toBeTruthy();
    expect(screen.getByTestId('input-telefone')).toBeTruthy();
    expect(screen.getByTestId('input-senha')).toBeTruthy();
    expect(screen.getByTestId('checkbox')).toBeTruthy();
    expect(screen.getByText('Continuar')).toBeTruthy();
  });

  it('shows validation errors when fields are empty', async () => {
    render(<Step2OrgData {...defaultProps} />);
    fireEvent.press(screen.getByText('Continuar'));

    expect(screen.getByText(/CNPJ é obrigatório/i)).toBeTruthy();
    expect(screen.getByText(/Razão Social é obrigatória/i)).toBeTruthy();
    expect(screen.getByText(/E-mail é obrigatório/i)).toBeTruthy();
    expect(screen.getByText(/Telefone é obrigatório/i)).toBeTruthy();
    expect(screen.getByText(/Nome do responsável é obrigatório/i)).toBeTruthy();
    expect(screen.getByText(/Senha é obrigatória/i)).toBeTruthy();
    expect(screen.getByText(/Você deve aceitar os termos/i)).toBeTruthy();
  });

  it('formats CNPJ as user types', () => {
    render(<Step2OrgData {...defaultProps} />);
    const cnpjInput = screen.getByTestId('input-cnpj');
    fireEvent.changeText(cnpjInput, '52210871000133');
    expect(cnpjInput.props.value).toBe('52.210.871/0001-33');
  });

  it('formats phone as user types', () => {
    render(<Step2OrgData {...defaultProps} />);
    const phoneInput = screen.getByTestId('input-telefone');
    fireEvent.changeText(phoneInput, '61988887777');
    expect(phoneInput.props.value).toBe('(61) 98888-7777');
  });

  it('calls onContinue with sanitized data when valid', async () => {
    const onContinue = jest.fn();
    render(<Step2OrgData onContinue={onContinue} initialData={{}} />);

    fireEvent.changeText(screen.getByTestId('input-cnpj'), '52210871000133');
    fireEvent.changeText(screen.getByTestId('input-razao-social'), 'Org Social');
    fireEvent.changeText(screen.getByTestId('input-email'), 'contato@org.br');
    fireEvent.changeText(screen.getByTestId('input-telefone'), '61988887777');
    fireEvent.changeText(screen.getByTestId('input-nome-responsavel'), 'Responsável');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));

    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledWith({
        cnpj: '52210871000133',
        razao_social: 'Org Social',
        nome_fantasia: undefined,
        email: 'contato@org.br',
        telefone: '61988887777',
        nome_responsavel: 'Responsável',
        password: 'Senha123',
        termos: true,
      });
    });
  });

  it('validates email format', () => {
    render(<Step2OrgData {...defaultProps} />);
    const emailInput = screen.getByTestId('input-email');
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/E-mail inválido/i)).toBeTruthy();
  });

  it('validates password strength', () => {
    render(<Step2OrgData {...defaultProps} />);
    const passwordInput = screen.getByTestId('input-senha');
    fireEvent.changeText(passwordInput, '12345');
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/Senha fraca/i)).toBeTruthy();
  });
});
