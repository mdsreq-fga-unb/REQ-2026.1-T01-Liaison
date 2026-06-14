import React from 'react';

import { useAuth } from '../context/AuthContext';
import AdminStack from './AdminStack';
import AuthStack from './AuthStack';
import OrgStack from './OrgStack';
import StudentStack from './StudentStack';

export type RootTabParamList = {
  Student: undefined;
  Organization: undefined;
  Admin: undefined;
};

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  // Authenticated: show appropriate stack based on user role
  if (user?.role === 'admin') {
    return <AdminStack />;
  }

  if (user?.role === 'organizacao') {
    return <OrgStack />;
  }

  // Default: student
  return <StudentStack />;
}
