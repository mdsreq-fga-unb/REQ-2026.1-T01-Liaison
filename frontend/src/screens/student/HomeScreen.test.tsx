import { render, screen } from '@testing-library/react-native';
import React from 'react';

import StudentHomeScreen from './HomeScreen';

describe('StudentHomeScreen', () => {
  it('renders the student title', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Estudante')).toBeTruthy();
  });

  it('renders the placeholder subtitle', () => {
    render(<StudentHomeScreen />);
    expect(screen.getByText('Área do Estudante — em breve')).toBeTruthy();
  });
});
