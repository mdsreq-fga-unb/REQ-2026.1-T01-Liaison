import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OrgTabNavigator from './OrgTabNavigator';
import CreateOpportunityScreen from '../screens/organization/CreateOpportunityScreen';
import OrgProfileEditScreen from '../screens/organization/OrgProfileEditScreen';
import OpportunityApplicantsScreen from '../screens/organization/OpportunityApplicantsScreen';
import OpportunityAttendanceScreen from '../screens/organization/OpportunityAttendanceScreen';
import EvaluateCandidateScreen from '../screens/organization/EvaluateCandidateScreen';
import { Application } from '../services/evaluations';
import NotificationsScreen from '../screens/NotificationsScreen';
import PublicStudentProfileScreen from '../screens/student/PublicStudentProfileScreen';
import PublicOrgProfileScreen from '../screens/organization/PublicOrgProfileScreen';

export type OrgStackParamList = {
  OrgTabs: undefined;
  CreateOpportunity: undefined;
  OrgProfileEdit: undefined;
  OpportunityApplicants: { opportunityId: string; opportunityTitle: string };
  OpportunityAttendance: { opportunityId: string; opportunityTitle: string; expectedHours?: number };
  EvaluateCandidate: {
    opportunityId: string;
    opportunityTitle: string;
    applications: Application[];
    index?: number;
  };
  Notifications: undefined;
  PublicStudentProfile: { userId: string };
  PublicOrgProfile: { orgId: string };
};

const Stack = createNativeStackNavigator<OrgStackParamList>();

export default function OrgStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrgTabs" component={OrgTabNavigator} />
      <Stack.Screen name="CreateOpportunity" component={CreateOpportunityScreen} options={{ title: 'Criar Oportunidade' }} />
      <Stack.Screen name="OrgProfileEdit" component={OrgProfileEditScreen} options={{ title: 'Editar Perfil' }} />
      <Stack.Screen name="OpportunityApplicants" component={OpportunityApplicantsScreen} options={{ title: 'Candidatos' }} />
      <Stack.Screen name="OpportunityAttendance" component={OpportunityAttendanceScreen} options={{ title: 'Frequência' }} />
      <Stack.Screen name="EvaluateCandidate" component={EvaluateCandidateScreen} options={{ title: 'Avaliar Candidato' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicStudentProfile" component={PublicStudentProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PublicOrgProfile" component={PublicOrgProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
