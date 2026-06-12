import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import OrgHomeScreen from '../screens/organization/HomeScreen';
import CreateOpportunityScreen from '../screens/organization/CreateOpportunityScreen';

export type OrgStackParamList = {
  OrgHome: undefined;
  CreateOpportunity: undefined;
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
      <Stack.Screen
        name="CreateOpportunity"
        component={CreateOpportunityScreen}
        options={{ title: 'Criar Vaga' }}
      />
    </Stack.Navigator>
  );
}
