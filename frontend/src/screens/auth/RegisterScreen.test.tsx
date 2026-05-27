import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import RegisterScreen from './RegisterScreen';

// Mock do contexto de autenticação
const mockRegister = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock de navegação
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
}));

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Step 1 initially', () => {
    render(<RegisterScreen />);
    expect(screen.getByText(/como você vai usar/i)).toBeTruthy();
  });

  it('advances to Step 2 after selecting Estudante and pressing Continuar', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));
    // Step 2 deve estar visível
    expect(screen.getByText('Nome *')).toBeTruthy();
  });

  it('advances to Step 3 after filling Step 2 data', () => {
    render(<RegisterScreen />);
    // Step 1
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    // Step 2
    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('Universidade de Brasília (UnB)'));
    fireEvent.press(screen.getByText('Continuar'));

    // Step 3 deve estar visível
    expect(screen.getByText('Curso *')).toBeTruthy();
  });

  it('advances to Step 4 after filling Step 3 data', () => {
    render(<RegisterScreen />);
    // Step 1
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    // Step 2
    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('Universidade de Brasília (UnB)'));
    fireEvent.press(screen.getByText('Continuar'));

    // Step 3
    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByText('Continuar'));

    // Step 4 deve estar visível
    expect(screen.getByText('Saúde')).toBeTruthy();
  });

  it('calls register on Step 4 submit', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });

    render(<RegisterScreen />);
    // Step 1
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    // Step 2
    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('Universidade de Brasília (UnB)'));
    fireEvent.press(screen.getByText('Continuar'));

    // Step 3
    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByText('Continuar'));

    // Step 4
    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it('passes complete form data to register function', async () => {
    mockRegister.mockResolvedValueOnce({ success: true });

    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('Universidade de Brasília (UnB)'));
    fireEvent.press(screen.getByText('Continuar'));

    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByText('Continuar'));

    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'ana@unb.br',
          nome: expect.stringContaining('Ana'),
          curso: 'Eng. Software',
          matricula: '20231234567',
        }),
      );
    });
  });

  it('shows loading state during registration', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));

    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    fireEvent.changeText(screen.getByTestId('input-nome'), 'Ana');
    fireEvent.changeText(screen.getByTestId('input-sobrenome'), 'Souza');
    fireEvent.changeText(screen.getByTestId('input-email'), 'ana@unb.br');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123');
    fireEvent.press(screen.getByTestId('checkbox'));
    fireEvent.press(screen.getByTestId('select-universidade'));
    fireEvent.press(screen.getByText('Universidade de Brasília (UnB)'));
    fireEvent.press(screen.getByText('Continuar'));

    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByText('Continuar'));

    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(screen.getByTestId('button-touchable')).toBeTruthy();
    });
  });
});
