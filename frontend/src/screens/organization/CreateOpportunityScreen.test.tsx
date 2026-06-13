import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CreateOpportunityScreen from './CreateOpportunityScreen';
import { createOpportunity } from '../../services/opportunities';

jest.mock('../../services/opportunities');
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'fake-token' })
}));

describe('CreateOpportunityScreen', () => {
  it('renders step 1 initially', () => {
    const { getByText } = render(<CreateOpportunityScreen />);
    expect(getByText('Passo 1 de 3')).toBeTruthy();
  });

  it('navigates to step 2 when clicking Próximo', () => {
    const { getByText } = render(<CreateOpportunityScreen />);
    fireEvent.press(getByText('Próximo'));
    expect(getByText('Passo 2 de 3')).toBeTruthy();
  });

  it('adds a requirement dynamically in step 3', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<CreateOpportunityScreen />);
    fireEvent.press(getByText('Próximo'));
    fireEvent.press(getByText('Próximo'));
    
    // Check if we are on step 3
    expect(getByText('Passo 3 de 3')).toBeTruthy();
    
    // Add requirement
    const input = getByPlaceholderText('Digite um pré-requisito');
    fireEvent.changeText(input, 'Saber Python');
    fireEvent.press(getByText('Adicionar'));
    
    expect(getByText('Saber Python')).toBeTruthy();
  });
});
