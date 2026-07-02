import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import OrgHomeScreen from '../screens/organization/HomeScreen';
import CandidatesScreen from '../screens/organization/CandidatesScreen';
import OrgProfileScreen from '../screens/organization/OrgProfileScreen';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';

export type OrgTabParamList = {
  OrgHome: undefined;
  Candidates: undefined;
  OrgProfile: undefined;
};

const Tab = createBottomTabNavigator<OrgTabParamList>();

export default function OrgTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand.gold,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          height: 68 + bottomPad,
          paddingTop: 10,
          paddingBottom: bottomPad,
          backgroundColor: '#fff',
          borderTopColor: '#ddd8ce',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamilies.dmSansMedium,
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="OrgHome"
        component={OrgHomeScreen}
        options={{
          title: 'Oportunidades',
          tabBarIcon: ({ color }) => (
            <Ionicons name="briefcase-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Candidates"
        component={CandidatesScreen}
        options={{
          title: 'Candidatos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="OrgProfile"
        component={OrgProfileScreen}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
