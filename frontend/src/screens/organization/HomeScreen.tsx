import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export default function OrgHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organização</Text>
      <Text style={styles.subtitle}>
        Bem-vindo(a), {user?.nome || 'Organização'}
      </Text>

      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate('OrgProfile')}
        testID="org-home-profile-link"
      >
        <Ionicons name="business-outline" size={24} color={colors.neutral.white} />
        <Text style={styles.profileButtonText}>Ver Perfil Institucional</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        testID="org-home-logout-button"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.text.secondary} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.bg,
    padding: spacing.lg,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brand.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.brand.navy,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: 20,
  },
  profileButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
