import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import StudentHomeScreen from '../screens/student/HomeScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import { getDashboard } from '../services/opportunities';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';
import MyApplicationsScreen from '../screens/student/MyApplicationsScreen';
import SavedOpportunitiesScreen from '../screens/student/SavedOpportunitiesScreen';

const Tab = createBottomTabNavigator();

export default function StudentTabNavigator() {
  const { accessToken } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  // Recarrega os contadores do menu. Chamado no mount e a cada foco de aba
  // (ex.: salvar/remover uma vaga em Explorar reflete no badge de Salvos).
  const refreshCounts = useCallback(() => {
    if (!accessToken) return;
    getDashboard(accessToken)
      .then(d => {
        setSavedCount(d?.vagas_salvas ?? 0);
        setActiveCount(d?.inscricoes_ativas ?? 0);
      })
      .catch(() => {});
  }, [accessToken]);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenListeners={{ focus: refreshCounts }}
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
        component={SavedOpportunitiesScreen}
        options={{
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={20} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inscrições"
        component={MyApplicationsScreen}
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
