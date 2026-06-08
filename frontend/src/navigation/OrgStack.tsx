import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OrgHomeScreen from '../screens/organization/HomeScreen';
import OrgProfileScreen from '../screens/organization/OrgProfileScreen';
import OrgProfileEditScreen from '../screens/organization/OrgProfileEditScreen';

export type OrgStackParamList = {
  OrgHome: undefined;
  OrgProfile: undefined;
  OrgProfileEdit: undefined;
};

const Stack = createNativeStackNavigator<OrgStackParamList>();

export default function OrgStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="OrgHome"
        component={OrgHomeScreen}
        options={{ title: 'Início — Organização' }}
      />
      <Stack.Screen
        name="OrgProfile"
        component={OrgProfileScreen}
        options={{ title: 'Perfil Institucional' }}
      />
      <Stack.Screen
        name="OrgProfileEdit"
        component={OrgProfileEditScreen}
        options={{ title: 'Editar Perfil' }}
      />
    </Stack.Navigator>
  );
}
