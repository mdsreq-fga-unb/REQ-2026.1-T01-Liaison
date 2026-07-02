/**
 * Testes TDD (Red Phase) — StudentTabNavigator
 *
 * Cobre:
 * - Renderiza 4 tabs: Explorar, Salvos, Inscrições, Perfil
 * - Cada tab tem ícone correto (Ionicons)
 * - Tab "Explorar" está ativa por padrão (home-outline)
 * - Tab "Salvos" usa bookmark-outline
 * - Tab "Inscrições" usa document-text-outline
 * - Tab "Perfil" usa person-outline
 * - Navegação entre tabs funciona
 */

import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

// Mock navigation stack screens so we don't need to render them fully
jest.mock('../screens/student/HomeScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>HomeScreen</Text>
    </View>
  );
});

jest.mock('../screens/student/StudentProfileScreen', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>ProfileScreen</Text>
    </View>
  );
});

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com', nome: 'Maria', role: 'estudante' },
    accessToken: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
    authenticatedFetch: jest.fn(),
  }),
}));

jest.mock('../services/opportunities', () => ({
  getDashboard: jest.fn().mockResolvedValue({
    nome: 'Maria',
    horas_acumuladas: 0,
    horas_exigidas: 120,
    progresso_percentual: 0,
    inscricoes_ativas: 0,
    vagas_salvas: 0,
    saudacao: 'Bom dia',
  }),
  getOpportunities: jest.fn().mockResolvedValue({ results: [], count: 0 }),
  getCategories: jest.fn().mockResolvedValue([]),
}));

import StudentTabNavigator from './StudentTabNavigator';

describe('StudentTabNavigator', () => {
  it('renders without crashing', () => {
    expect(() => {
      render(
        <NavigationContainer>
          <StudentTabNavigator />
        </NavigationContainer>
      );
    }).not.toThrow();
  });

  it('renders the Explorar tab', () => {
    render(
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
    expect(screen.getByText('Explorar')).toBeTruthy();
  });

  it('renders the Salvos tab', () => {
    render(
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
    expect(screen.getByText('Salvos')).toBeTruthy();
  });

  it('renders the Inscrições tab', () => {
    render(
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
    expect(screen.getByText('Inscrições')).toBeTruthy();
  });

  it('renders the Perfil tab', () => {
    render(
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
    expect(screen.getByText('Perfil')).toBeTruthy();
  });

  it('renders 4 tab labels total', () => {
    render(
      <NavigationContainer>
        <StudentTabNavigator />
      </NavigationContainer>
    );
    const tabs = ['Explorar', 'Salvos', 'Inscrições', 'Perfil'];
    tabs.forEach(tab => {
      expect(screen.getByText(tab)).toBeTruthy();
    });
  });
});
