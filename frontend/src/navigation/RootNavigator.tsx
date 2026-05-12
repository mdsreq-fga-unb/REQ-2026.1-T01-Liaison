import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import AdminStack from './AdminStack';
import OrgStack from './OrgStack';
import StudentStack from './StudentStack';

export type RootTabParamList = {
  Student: undefined;
  Organization: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#9ca3af',
        }}
      >
        <Tab.Screen
          name="Student"
          component={StudentStack}
          options={{ title: 'Estudante' }}
        />
        <Tab.Screen
          name="Organization"
          component={OrgStack}
          options={{ title: 'Organização' }}
        />
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{ title: 'Admin' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
