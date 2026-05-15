import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OrgHomeScreen from '../screens/organization/HomeScreen';

export type OrgStackParamList = {
  OrgHome: undefined;
};

const Stack = createNativeStackNavigator<OrgStackParamList>();

export default function OrgStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrgHome"
        component={OrgHomeScreen}
        options={{ title: 'Início — Organização' }}
      />
    </Stack.Navigator>
  );
}
