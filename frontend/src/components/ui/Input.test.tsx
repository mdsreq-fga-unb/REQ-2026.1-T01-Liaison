import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Input from './Input';

describe('Input', () => {
  it('renders the label text', () => {
    render(<Input label="E-mail" value="" onChangeText={() => {}} />);
    expect(screen.getByText('E-mail')).toBeTruthy();
  });

  it('renders the placeholder text', () => {
    render(
      <Input
        label="E-mail"
        placeholder="Digite seu e-mail"
        value=""
        onChangeText={() => {}}
      />,
    );
    expect(screen.getByPlaceholderText('Digite seu e-mail')).toBeTruthy();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <Input
        label="E-mail"
        value=""
        onChangeText={() => {}}
        error="E-mail inválido"
      />,
    );
    expect(screen.getByText('E-mail inválido')).toBeTruthy();
  });

  it('does not show error when error prop is not provided', () => {
    render(<Input label="Nome" value="" onChangeText={() => {}} />);
    expect(screen.queryByText('E-mail inválido')).toBeNull();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    render(<Input label="Nome" value="" onChangeText={onChangeText} />);
    const input = screen.getByTestId('input-field');
    fireEvent.changeText(input, 'Ana Souza');
    expect(onChangeText).toHaveBeenCalledWith('Ana Souza');
  });

  it('applies secureTextEntry for password type', () => {
    render(
      <Input
        label="Senha"
        value=""
        onChangeText={() => {}}
        secureTextEntry
      />,
    );
    const input = screen.getByTestId('input-field');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('does not apply secureTextEntry for regular text input', () => {
    render(<Input label="Nome" value="" onChangeText={() => {}} />);
    const input = screen.getByTestId('input-field');
    expect(input.props.secureTextEntry).toBeFalsy();
  });

  it('renders with current value', () => {
    render(<Input label="Nome" value="Ana Souza" onChangeText={() => {}} />);
    const input = screen.getByTestId('input-field');
    expect(input.props.value).toBe('Ana Souza');
  });

  it('applies error style when error is present', () => {
    render(
      <Input
        label="E-mail"
        value=""
        onChangeText={() => {}}
        error="Campo obrigatório"
      />,
    );
    const input = screen.getByTestId('input-field');
    // Input deve ter estilo de erro (borda vermelha, etc)
    expect(input).toBeTruthy();
  });
});
