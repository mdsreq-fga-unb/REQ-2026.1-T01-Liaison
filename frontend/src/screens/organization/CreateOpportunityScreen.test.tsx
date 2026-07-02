import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CreateOpportunityScreen from './CreateOpportunityScreen';

jest.mock('../../services/opportunities');
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ accessToken: 'fake-token' })
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 })
}));

describe('CreateOpportunityScreen', () => {
  it('renders step 1 initially', () => {
    const { getByText } = render(<CreateOpportunityScreen />);
    expect(getByText('Informações Básicas')).toBeTruthy();
  });

  it('navigates to step 2 when clicking Próximo', () => {
    const { getByText } = render(<CreateOpportunityScreen />);
    fireEvent.press(getByText('Próximo →'));
    expect(getByText('Local, Data & Cronograma')).toBeTruthy();
  });

  it('adds a requirement dynamically in step 3', () => {
    const { getByText, getAllByPlaceholderText } = render(<CreateOpportunityScreen />);
    fireEvent.press(getByText('Próximo →'));
    fireEvent.press(getByText('Próximo →'));
    
    // Check if we are on step 3
    expect(getByText('Fotos da Atividade')).toBeTruthy();
    
    // Add requirement
    const inputs = getAllByPlaceholderText('Ex: Ter notebook próprio');
    fireEvent.changeText(inputs[0], 'Saber Python');
    
    expect(inputs[0].props.value).toBe('Saber Python');
  });
});
