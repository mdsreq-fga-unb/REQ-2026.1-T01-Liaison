import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Step4Interests from './Step4Interests';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

const defaultProps = {
  onFinish: jest.fn(),
  formData: {
    email: 'ana@unb.br',
    password: 'Senha123',
    nome: 'Ana Souza',
    universidade: 'UnB',
    curso: 'Eng. Software',
    matricula: '20231234567',
  },
};

describe('Step4Interests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 6 category cards', () => {
    render(<Step4Interests {...defaultProps} />);
    const cards = screen.getAllByTestId('category-card');
    expect(cards).toHaveLength(6);
  });

  it('renders Saúde category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText('Saúde')).toBeTruthy();
  });

  it('renders Educação category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText('Educação')).toBeTruthy();
  });

  it('renders Tecnologia category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText('Tecnologia')).toBeTruthy();
  });

  it('renders Meio Ambiente category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText(/meio ambiente/i)).toBeTruthy();
  });

  it('renders Assistência Social category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText(/assistência social/i)).toBeTruthy();
  });

  it('renders Arte & Cultura category', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText(/arte.*cultura/i)).toBeTruthy();
  });

  it('shows counter starting at 0 / 3', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText(/0\s*\/\s*3/)).toBeTruthy();
  });

  it('updates counter when category is selected', () => {
    render(<Step4Interests {...defaultProps} />);
    fireEvent.press(screen.getByText('Saúde'));
    expect(screen.getByText(/1\s*\/\s*3/)).toBeTruthy();
  });

  it('allows selecting up to 3 categories', () => {
    render(<Step4Interests {...defaultProps} />);
    fireEvent.press(screen.getByText('Saúde'));
    fireEvent.press(screen.getByText('Educação'));
    fireEvent.press(screen.getByText('Tecnologia'));
    expect(screen.getByText(/3\s*\/\s*3/)).toBeTruthy();
  });

  it('does not allow selecting more than 3 categories', () => {
    render(<Step4Interests {...defaultProps} />);
    fireEvent.press(screen.getByText('Saúde'));
    fireEvent.press(screen.getByText('Educação'));
    fireEvent.press(screen.getByText('Tecnologia'));
    fireEvent.press(screen.getByText(/meio ambiente/i));
    expect(screen.getByText(/3\s*\/\s*3/)).toBeTruthy();
  });

  it('deselects category when pressed again', () => {
    render(<Step4Interests {...defaultProps} />);
    fireEvent.press(screen.getByText('Saúde'));
    expect(screen.getByText(/1\s*\/\s*3/)).toBeTruthy();
    fireEvent.press(screen.getByText('Saúde'));
    expect(screen.getByText(/0\s*\/\s*3/)).toBeTruthy();
  });

  it('renders "Criar minha conta" submit button', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText('Criar minha conta')).toBeTruthy();
  });

  it('calls onFinish with selected interests when submit is pressed', () => {
    const onFinish = jest.fn();
    render(<Step4Interests {...defaultProps} onFinish={onFinish} />);
    fireEvent.press(screen.getByText('Saúde'));
    fireEvent.press(screen.getByText('Criar minha conta'));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        interesses: expect.arrayContaining(['saude']),
      }),
    );
  });

  it('calls onFinish with empty interesses when none selected', () => {
    const onFinish = jest.fn();
    render(<Step4Interests {...defaultProps} onFinish={onFinish} />);
    fireEvent.press(screen.getByText('Criar minha conta'));
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        interesses: [],
      }),
    );
  });

  it('renders progress bar with step 4 active', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByTestId('progress-step-active')).toBeTruthy();
  });

  it('renders "Voltar" link', () => {
    render(<Step4Interests {...defaultProps} />);
    expect(screen.getByText('Voltar')).toBeTruthy();
  });
});
