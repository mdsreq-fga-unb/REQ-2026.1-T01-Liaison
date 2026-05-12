import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AdminHomeScreen from '../screens/admin/HomeScreen';

export type AdminStackParamList = {
  AdminHome: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ title: 'Início — Admin' }}
      />
    </Stack.Navigator>
  );
}
