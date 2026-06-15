import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking'; // <-- 1. Import do Expo Linking

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { useLiaisonFonts } from './src/theme/fonts';

// Configuração do Linking (fora do componente)
const linking = {
  prefixes: ['liaison://', Linking.createURL('/')],
  config: {
    screens: {
      ResetPasswordScreen: 'reset-password',
    },
  },
};

export default function App() {
  const { fontsLoaded, fontError } = useLiaisonFonts();

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  return (
    <AuthProvider>
      {/* <-- 3. Inserindo o linking no container */}
      <NavigationContainer linking={linking}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.bg,
  },
});