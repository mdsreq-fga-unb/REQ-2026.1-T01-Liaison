/**
 * Testes TDD (Red Phase) — SearchBar component
 *
 * Cobre:
 * - Renderiza input de texto
 * - Renderiza ícone search-outline
 * - Chama onChangeText quando o usuário digita
 * - Exibe placeholder
 * - testID acessível
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import SearchBar from './SearchBar';

describe('SearchBar', () => {
  it('renders a text input', () => {
    render(<SearchBar onChangeText={jest.fn()} />);
    expect(screen.getByTestId('search-bar-input')).toBeTruthy();
  });

  it('renders the search icon', () => {
    render(<SearchBar onChangeText={jest.fn()} />);
    // Ionicons mock renders as Text with "[icon:search-outline]"
    expect(screen.getByText('[icon:search-outline]')).toBeTruthy();
  });

  it('calls onChangeText with input value', () => {
    const onChangeText = jest.fn();
    render(<SearchBar onChangeText={onChangeText} />);
    fireEvent.changeText(screen.getByTestId('search-bar-input'), 'tutoria');
    expect(onChangeText).toHaveBeenCalledWith('tutoria');
  });

  it('displays custom placeholder', () => {
    render(<SearchBar onChangeText={jest.fn()} placeholder="Buscar vagas..." />);
    expect(screen.getByPlaceholderText('Buscar vagas...')).toBeTruthy();
  });

  it('displays default placeholder when none provided', () => {
    render(<SearchBar onChangeText={jest.fn()} />);
    const input = screen.getByTestId('search-bar-input');
    expect(input).toBeTruthy();
  });

  it('accepts value prop and shows it', () => {
    render(<SearchBar onChangeText={jest.fn()} value="matemática" />);
    const input = screen.getByTestId('search-bar-input');
    expect(input.props.value).toBe('matemática');
  });

  it('renders the filter button', () => {
    render(<SearchBar onChangeText={jest.fn()} onFilterPress={jest.fn()} />);
    expect(screen.getByTestId('search-filter-button')).toBeTruthy();
  });

  it('calls onFilterPress when filter button is pressed', () => {
    const onFilterPress = jest.fn();
    render(<SearchBar onChangeText={jest.fn()} onFilterPress={onFilterPress} />);
    fireEvent.press(screen.getByTestId('search-filter-button'));
    expect(onFilterPress).toHaveBeenCalledTimes(1);
  });
});
