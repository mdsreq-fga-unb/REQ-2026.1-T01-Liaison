import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Button from './Button';

describe('Button', () => {
  it('renders the given text label', () => {
    render(<Button onPress={() => {}} title="Continuar" />);
    expect(screen.getByText('Continuar')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} title="Pressionar" />);
    fireEvent.press(screen.getByText('Pressionar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} title="Desabilitado" disabled />);
    fireEvent.press(screen.getByText('Desabilitado'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders loading state when loading prop is true', () => {
    render(<Button onPress={() => {}} title="Carregar" loading />);
    // Loading indicator deve estar visível (ActivityIndicator ou texto de carregamento)
    expect(screen.queryByText('Carregar')).toBeFalsy();
    // ou ActivityIndicator deve estar presente
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress} title="Loading" loading />);
    // Tenta pressionar — nao deve chamar
    const button = screen.getByTestId('button-touchable');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies primary variant styles by default', () => {
    render(<Button onPress={() => {}} title="Primary" variant="primary" />);
    expect(screen.getByTestId('button-touchable')).toBeTruthy();
  });

  it('applies secondary variant styles when secondary is passed', () => {
    render(<Button onPress={() => {}} title="Secondary" variant="secondary" />);
    expect(screen.getByTestId('button-touchable')).toBeTruthy();
  });

  it('renders with testID for accessibility', () => {
    render(<Button onPress={() => {}} title="Acessível" testID="btn-accessible" />);
    expect(screen.getByTestId('btn-accessible')).toBeTruthy();
  });
});
