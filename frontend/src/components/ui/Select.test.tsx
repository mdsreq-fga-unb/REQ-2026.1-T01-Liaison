import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Select from './Select';

const OPTIONS = [
  { label: 'Matutino', value: 'matutino' },
  { label: 'Vespertino', value: 'vespertino' },
  { label: 'Noturno', value: 'noturno' },
];

describe('Select', () => {
  it('renders the placeholder when no option is selected', () => {
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
        placeholder="Selecione um turno"
      />,
    );
    expect(screen.getByText('Selecione um turno')).toBeTruthy();
  });

  it('renders the label text', () => {
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
        placeholder="Selecione"
      />,
    );
    expect(screen.getByText('Turno')).toBeTruthy();
  });

  it('opens options list when pressed', () => {
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
        placeholder="Selecione"
      />,
    );
    fireEvent.press(screen.getByTestId('select-trigger'));
    // Opções devem aparecer após o clique
    expect(screen.getByText('Matutino')).toBeTruthy();
    expect(screen.getByText('Vespertino')).toBeTruthy();
    expect(screen.getByText('Noturno')).toBeTruthy();
  });

  it('calls onChange when option is selected', () => {
    const onChange = jest.fn();
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value={null}
        onChange={onChange}
        placeholder="Selecione"
      />,
    );
    fireEvent.press(screen.getByTestId('select-trigger'));
    fireEvent.press(screen.getByText('Matutino'));
    expect(onChange).toHaveBeenCalledWith('matutino');
  });

  it('shows selected value label when value is set', () => {
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value="vespertino"
        onChange={() => {}}
        placeholder="Selecione"
      />,
    );
    expect(screen.getByText('Vespertino')).toBeTruthy();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <Select
        label="Turno"
        options={OPTIONS}
        value={null}
        onChange={() => {}}
        placeholder="Selecione"
        error="Campo obrigatório"
      />,
    );
    expect(screen.getByText('Campo obrigatório')).toBeTruthy();
  });
});
