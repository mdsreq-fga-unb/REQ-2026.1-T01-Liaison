import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import Step3Academic from './Step3Academic';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

// Mock API
jest.mock('../../services/api', () => ({
  ...jest.requireActual('../../services/api'),
  checkMatricula: jest.fn().mockResolvedValue({ available: true }),
}));

const defaultProps = {
  onContinue: jest.fn(),
  initialData: {},
};

describe('Step3Academic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders curso field', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText('Curso *')).toBeTruthy();
  });

  it('renders turno dropdown', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText('Turno *')).toBeTruthy();
  });

  it('renders ano_conclusao dropdown', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText(/conclusão/i)).toBeTruthy();
  });

  it('renders horas_extensao_exigidas field', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText(/Horas de extensão exigidas/)).toBeTruthy();
  });

  it('renders matricula field', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText('Matrícula *')).toBeTruthy();
  });

  it('renders Continuar button', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText('Continuar')).toBeTruthy();
  });

  it('shows error when curso is empty and Continue is pressed', () => {
    render(<Step3Academic {...defaultProps} />);
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/curso.*obrigatório/i)).toBeTruthy();
  });

  it('shows error when matricula is empty and Continue is pressed', () => {
    render(<Step3Academic {...defaultProps} />);
    fireEvent.press(screen.getByText('Continuar'));
    expect(screen.getByText(/matrícula.*obrigatória/i)).toBeTruthy();
  });

  it('calls onContinue with academic data when required fields are filled', async () => {
    const onContinue = jest.fn();
    render(<Step3Academic onContinue={onContinue} initialData={{}} />);

    fireEvent.changeText(screen.getByTestId('input-curso'), 'Engenharia de Software');
    fireEvent.changeText(screen.getByTestId('input-matricula'), '20231234567');

    fireEvent.press(screen.getByTestId('select-turno'));
    fireEvent.press(screen.getByText('Matutino'));

    fireEvent.changeText(screen.getByTestId('input-horas'), '360');

    fireEvent.press(screen.getByText('Continuar'));
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalledWith(
        expect.objectContaining({
          curso: 'Engenharia de Software',
          matricula: '20231234567',
          turno: 'matutino',
          horas_extensao_exigidas: 360,
        }),
      );
    });
  });

  it('renders info box about horas extensao', () => {
    render(<Step3Academic {...defaultProps} />);
    // Info box is hidden behind info-icon image
    expect(screen.getByText(/horas de voluntariado/i)).toBeTruthy();
  });

  it('renders progress bar with step 3 active', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByTestId('progress-step-active')).toBeTruthy();
  });

  it('renders "Voltar" link', () => {
    render(<Step3Academic {...defaultProps} />);
    expect(screen.getByText('Voltar')).toBeTruthy();
  });
});
