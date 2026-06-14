import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock do AuthContext
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock das navegações filhas
jest.mock('./AuthStack', () => {
  const { Text } = require('react-native');
  return function MockAuthStack() {
    return <Text>AuthStack</Text>;
  };
});

jest.mock('./StudentStack', () => {
  const { Text } = require('react-native');
  return function MockStudentStack() {
    return <Text>StudentStack</Text>;
  };
});

jest.mock('./OrgStack', () => {
  const { Text } = require('react-native');
  return function MockOrgStack() {
    return <Text>OrgStack</Text>;
  };
});

jest.mock('./AdminStack', () => {
  const { Text } = require('react-native');
  return function MockAdminStack() {
    return <Text>AdminStack</Text>;
  };
});

import RootNavigator from './RootNavigator';

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows AuthStack when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    render(<RootNavigator />);
    expect(screen.getByText('AuthStack')).toBeTruthy();
  });

  it('shows tabs (StudentStack) when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'ana@unb.br', role: 'estudante' },
      isLoading: false,
    });

    render(<RootNavigator />);
    expect(screen.getByText('StudentStack')).toBeTruthy();
  });

  it('does not show AuthStack when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { email: 'ana@unb.br', role: 'estudante' },
      isLoading: false,
    });

    render(<RootNavigator />);
    expect(screen.queryByText('AuthStack')).toBeNull();
  });

  it('does not show tabs when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    render(<RootNavigator />);
    expect(screen.queryByText('StudentStack')).toBeNull();
  });

  it('renders without crashing', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });

    const { toJSON } = render(<RootNavigator />);
    expect(toJSON()).toBeTruthy();
  });
});
