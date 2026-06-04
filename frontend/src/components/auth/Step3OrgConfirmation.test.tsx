import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import Step3OrgConfirmation from './Step3OrgConfirmation';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('Step3OrgConfirmation', () => {
  it('renders correctly with status and messages', () => {
    render(<Step3OrgConfirmation onHome={jest.fn()} />);

    expect(screen.getByText('Aguardando aprovação')).toBeTruthy();
    expect(screen.getByText('Cadastro realizado!')).toBeTruthy();
    expect(
      screen.getByText(/Um administrador irá revisar as informações/i),
    ).toBeTruthy();
  });

  it('calls onHome when button is pressed', () => {
    const onHomeMock = jest.fn();
    render(<Step3OrgConfirmation onHome={onHomeMock} />);

    fireEvent.press(screen.getByText('Voltar para o início'));
    expect(onHomeMock).toHaveBeenCalledTimes(1);
  });
});
