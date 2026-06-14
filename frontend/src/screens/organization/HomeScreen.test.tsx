import { render, screen } from '@testing-library/react-native';
import React from 'react';

import OrgHomeScreen from './HomeScreen';

describe('OrgHomeScreen', () => {
  it('renders the organization title', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText('Organização')).toBeTruthy();
  });

  it('renders the placeholder subtitle', () => {
    render(<OrgHomeScreen />);
    expect(screen.getByText('Área da Organização — em breve')).toBeTruthy();
  });
});
