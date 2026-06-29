import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import StudentHomeScreen from '../screens/student/HomeScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import { getDashboard } from '../services/opportunities';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';

const Tab = createBottomTabNavigator();

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{title}</Text>
    </View>
  );
}

export default function StudentTabNavigator() {
  const { accessToken } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    getDashboard(accessToken)
      .then(d => {
        setSavedCount(d?.vagas_salvas ?? 0);
        setActiveCount(d?.inscricoes_ativas ?? 0);
      })
      .catch(() => {});
  }, [accessToken]);

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
        tabBarBadgeStyle: {
          fontFamily: fontFamilies.dmSansBold,
          fontSize: 9,
          lineHeight: 14,
          backgroundColor: colors.brand.gold,
          color: colors.brand.navy,
        },
      }}
    >
      <Tab.Screen
        name="Explorar"
        component={StudentHomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="compass-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Salvos"
        component={() => <PlaceholderScreen title="Salvos" />}
        options={{
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inscrições"
        component={() => <PlaceholderScreen title="Inscrições" />}
        options={{
          tabBarBadge: activeCount > 0 ? activeCount : undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={StudentProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={20} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
