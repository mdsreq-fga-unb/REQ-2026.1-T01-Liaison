import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OrgHomeScreen from '../screens/organization/HomeScreen';
import CreateOpportunityScreen from '../screens/organization/CreateOpportunityScreen';
import OrgProfileScreen from '../screens/organization/OrgProfileScreen';
import OrgProfileEditScreen from '../screens/organization/OrgProfileEditScreen';
import OpportunityApplicantsScreen from '../screens/organization/OpportunityApplicantsScreen';

export type OrgStackParamList = {
  OrgHome: undefined;
  CreateOpportunity: undefined;
  OrgProfile: undefined;
  OrgProfileEdit: undefined;
  OpportunityApplicants: { opportunityId: string; opportunityTitle: string };
};

const Stack = createNativeStackNavigator<OrgStackParamList>();

export default function OrgStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrgHome" component={OrgHomeScreen} options={{ title: 'Início — Organização' }} />
      <Stack.Screen name="CreateOpportunity" component={CreateOpportunityScreen} options={{ title: 'Criar Vaga' }} />
      <Stack.Screen name="OrgProfile" component={OrgProfileScreen} options={{ title: 'Perfil Institucional' }} />
      <Stack.Screen name="OrgProfileEdit" component={OrgProfileEditScreen} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="OpportunityApplicants" component={OpportunityApplicantsScreen} options={{ title: 'Candidatos' }} />
    </Stack.Navigator>
  );
}
