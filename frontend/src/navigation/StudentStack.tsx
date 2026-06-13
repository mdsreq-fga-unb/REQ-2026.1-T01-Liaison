import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import StudentHomeScreen from '../screens/student/HomeScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import StudentProfileEditScreen from '../screens/student/StudentProfileEditScreen';
import GalleryFullScreen from '../screens/student/GalleryFullScreen';

export type StudentStackParamList = {
  StudentHome: undefined;
  StudentProfile: undefined;
  StudentProfileEdit: undefined;
  GalleryFull: undefined;
};

const Stack = createNativeStackNavigator<StudentStackParamList>();

export default function StudentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StudentHome"
        component={StudentHomeScreen}
        options={{ title: 'Início — Estudante' }}
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
    </Stack.Navigator>
  );
}
