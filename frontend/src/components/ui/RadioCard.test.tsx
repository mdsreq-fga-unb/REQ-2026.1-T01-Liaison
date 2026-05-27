import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import RadioCard from './RadioCard';

describe('RadioCard', () => {
  it('renders the title text', () => {
    render(
      <RadioCard
        title="Estudante"
        description="Universitário buscando voluntariado"
        selected={false}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Estudante')).toBeTruthy();
  });

  it('renders the description text', () => {
    render(
      <RadioCard
        title="Estudante"
        description="Universitário buscando voluntariado"
        selected={false}
        onPress={() => {}}
      />,
    );
    expect(screen.getByText('Universitário buscando voluntariado')).toBeTruthy();
  });

  it('shows selected state when selected prop is true', () => {
    render(
      <RadioCard
        title="Estudante"
        description="Desc"
        selected={true}
        onPress={() => {}}
      />,
    );
    const card = screen.getByTestId('radio-card');
    expect(card.props.accessibilityState?.selected).toBe(true);
  });

  it('shows unselected state when selected prop is false', () => {
    render(
      <RadioCard
        title="Estudante"
        description="Desc"
        selected={false}
        onPress={() => {}}
      />,
    );
    const card = screen.getByTestId('radio-card');
    expect(card.props.accessibilityState?.selected).toBe(false);
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    render(
      <RadioCard
        title="Estudante"
        description="Desc"
        selected={false}
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByTestId('radio-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with disabled state when disabled prop is true', () => {
    const onPress = jest.fn();
    render(
      <RadioCard
        title="Organização"
        description="Em breve"
        selected={false}
        onPress={onPress}
        disabled
      />,
    );
    fireEvent.press(screen.getByTestId('radio-card'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders badge text when badge prop is provided', () => {
    render(
      <RadioCard
        title="Estudante"
        description="Universitário buscando voluntariado"
        selected={false}
        onPress={() => {}}
        badge="PARA ESTUDANTES"
      />,
    );
    expect(screen.getByText('PARA ESTUDANTES')).toBeTruthy();
  });
});
