import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import RegisterScreen from './RegisterScreen';

// Mock da API
jest.mock('../../services/api', () => ({
  ...jest.requireActual('../../services/api'),
  checkEmail: jest.fn().mockResolvedValue({ available: true }),
  checkMatricula: jest.fn().mockResolvedValue({ available: true }),
}));

// Mock do contexto de autenticação
const mockStudentRegister = jest.fn();
const mockOrganizationRegister = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    studentRegister: mockStudentRegister,
    organizationRegister: mockOrganizationRegister,
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

  it('advances to Step 2 (Org) after selecting Organização and pressing Continuar', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-organizacao'));
    fireEvent.press(screen.getByTestId('button-touchable'));
    // Step 2 Org deve estar visível
    expect(screen.getByText(/dados da instituição/i)).toBeTruthy();
  });

  it('calls organizationRegister and shows confirmation after filling Step 2 Org', async () => {
    mockOrganizationRegister.mockResolvedValueOnce({ success: true });

    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-organizacao'));
    fireEvent.press(screen.getByTestId('button-touchable'));

    // Step 2 Org
    fireEvent.changeText(screen.getByTestId('input-cnpj'), '52.210.871/0001-33');
    fireEvent.changeText(screen.getByTestId('input-razao-social'), 'Org Teste SA');
    fireEvent.changeText(screen.getByTestId('input-email'), 'contato@org.com');
    fireEvent.changeText(screen.getByTestId('input-telefone'), '(11) 99999-9999');
    fireEvent.changeText(screen.getByTestId('input-nome-responsavel'), 'Responsável');
    fireEvent.changeText(screen.getByTestId('input-senha'), 'Senha123!');
    fireEvent.press(screen.getByTestId('checkbox'));
    
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(mockOrganizationRegister).toHaveBeenCalled();
      expect(screen.getByText('Cadastro realizado!')).toBeTruthy();
      expect(screen.getByText('Aguardando aprovação')).toBeTruthy();
    });
  });

  it('advances to Step 2 after selecting Estudante and pressing Continuar', () => {
    render(<RegisterScreen />);
    fireEvent.press(screen.getByTestId('radio-card-estudante'));
    fireEvent.press(screen.getByTestId('button-touchable'));
    // Step 2 deve estar visível
    expect(screen.getByText('Nome *')).toBeTruthy();
  });

  it('advances to Step 3 after filling Step 2 data', async () => {
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
    fireEvent.press(screen.getByTestId('select-semestre'));
    fireEvent.press(screen.getByText('5º Semestre'));
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByText('Curso *')).toBeTruthy();
    });
  });

  it('advances to Step 4 after filling Step 3 data', async () => {
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
    fireEvent.press(screen.getByTestId('select-semestre'));
    fireEvent.press(screen.getByText('5º Semestre'));
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByTestId('input-curso')).toBeTruthy();
    });

    // Step 3
    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByTestId('select-turno'));
    fireEvent.press(screen.getByText('Matutino'));
    fireEvent.press(screen.getByTestId('select-ano-conclusao'));
    const currentYear = new Date().getFullYear();
    fireEvent.press(screen.getByText(String(currentYear + 2)));
    fireEvent.changeText(screen.getByTestId('input-horas'), '360');
    fireEvent.press(screen.getByText('Continuar'));

    // Step 4 deve estar visível
    await waitFor(() => {
      expect(screen.getByText('Saúde')).toBeTruthy();
    });
  });

  it('calls register on Step 4 submit', async () => {
    mockStudentRegister.mockResolvedValueOnce({ success: true });

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
    fireEvent.press(screen.getByTestId('select-semestre'));
    fireEvent.press(screen.getByText('5º Semestre'));
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByTestId('input-curso')).toBeTruthy();
    });

    // Step 3
    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByTestId('select-turno'));
    fireEvent.press(screen.getByText('Matutino'));
    fireEvent.press(screen.getByTestId('select-ano-conclusao'));
    const currentYear = new Date().getFullYear();
    fireEvent.press(screen.getByText(String(currentYear + 2)));
    fireEvent.changeText(screen.getByTestId('input-horas'), '360');
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByText('Criar minha conta')).toBeTruthy();
    });

    // Step 4
    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(mockStudentRegister).toHaveBeenCalled();
    });
  });

  it('passes complete form data to register function', async () => {
    mockStudentRegister.mockResolvedValueOnce({ success: true });

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
    fireEvent.press(screen.getByTestId('select-semestre'));
    fireEvent.press(screen.getByText('5º Semestre'));
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByTestId('input-curso')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByTestId('select-turno'));
    fireEvent.press(screen.getByText('Matutino'));
    fireEvent.press(screen.getByTestId('select-ano-conclusao'));
    const currentYear2 = new Date().getFullYear();
    fireEvent.press(screen.getByText(String(currentYear2 + 2)));
    fireEvent.changeText(screen.getByTestId('input-horas'), '360');
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByText('Criar minha conta')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Meio Ambiente'));
    fireEvent.press(screen.getByText('Tecnologia'));

    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(mockStudentRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'ana@unb.br',
          nome: expect.stringContaining('Ana'),
          curso: 'Eng. Software',
          matricula: '20231234567',
          interesses: ['meio_ambiente', 'tecnologia'],
        }),
      );
    });
  });

  it('shows loading state during registration', async () => {
    mockStudentRegister.mockImplementation(() => new Promise(() => {}));

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
    fireEvent.press(screen.getByTestId('select-semestre'));
    fireEvent.press(screen.getByText('5º Semestre'));
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByTestId('input-curso')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('input-curso'), 'Eng. Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');
    fireEvent.press(screen.getByTestId('select-turno'));
    fireEvent.press(screen.getByText('Matutino'));
    fireEvent.press(screen.getByTestId('select-ano-conclusao'));
    const currentYear = new Date().getFullYear();
    fireEvent.press(screen.getByText(String(currentYear + 2)));
    fireEvent.changeText(screen.getByTestId('input-horas'), '360');
    fireEvent.press(screen.getByText('Continuar'));

    await waitFor(() => {
      expect(screen.getByText('Criar minha conta')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Criar minha conta'));

    await waitFor(() => {
      expect(screen.getByTestId('button-touchable')).toBeTruthy();
    });
  });
});
