import { render, screen } from '@testing-library/react-native';
import React from 'react';

import AdminHomeScreen from './HomeScreen';

describe('AdminHomeScreen', () => {
  it('renders the admin title', () => {
    render(<AdminHomeScreen />);
    expect(screen.getByText('Admin')).toBeTruthy();
  });

  it('renders the placeholder subtitle', () => {
    render(<AdminHomeScreen />);
    expect(screen.getByText('Área Administrativa — em breve')).toBeTruthy();
  });
});
