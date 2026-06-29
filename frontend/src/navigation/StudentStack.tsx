import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import StudentTabNavigator from './StudentTabNavigator';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import StudentProfileEditScreen from '../screens/student/StudentProfileEditScreen';
import GalleryFullScreen from '../screens/student/GalleryFullScreen';
import OpportunityDetailScreen from '../screens/student/OpportunityDetailScreen';
import MyApplicationsScreen from '../screens/student/MyApplicationsScreen';

export type StudentStackParamList = {
  StudentHome: undefined;
  StudentProfile: undefined;
  StudentProfileEdit: undefined;
  GalleryFull: undefined;
  OpportunityDetail: { id: string };
  MyApplications: undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

export default function StudentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentHome"
        component={StudentTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentProfile"
        component={StudentProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StudentProfileEdit"
        component={StudentProfileEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GalleryFull"
        component={GalleryFullScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OpportunityDetail"
        component={OpportunityDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyApplications"
        component={MyApplicationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
