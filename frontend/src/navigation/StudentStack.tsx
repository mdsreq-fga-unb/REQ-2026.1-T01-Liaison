import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import StudentHomeScreen from '../screens/student/HomeScreen';

export type StudentStackParamList = {
  StudentHome: undefined;
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
    </Stack.Navigator>
  );
}
