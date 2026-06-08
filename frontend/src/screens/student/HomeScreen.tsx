import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function StudentHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <TouchableOpacity
        testID="profile-card"
        style={styles.profileCard}
        onPress={() => navigation.navigate('StudentProfile')}
        activeOpacity={0.7}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={28} color={colors.brand.gold} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.nome || 'Estudante'}</Text>
          <Text style={styles.profileAction}>Meu Perfil</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {/* Placeholder Content */}
      <View style={styles.emptyState}>
        <Ionicons name="rocket-outline" size={48} color={colors.text.secondary} />
        <Text style={styles.emptyTitle}>Área do Estudante</Text>
        <Text style={styles.emptySubtitle}>
          Novas funcionalidades estão chegando!{'\n'}
          Em breve você poderá descobrir e se inscrever em vagas de voluntariado.
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        testID="logout-button"
        style={styles.logoutButton}
        onPress={() => logout()}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.text.secondary} />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: 16,
    gap: 14,
    ...shadows.card,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: typography.button.fontFamily,
    fontSize: 16,
    color: colors.text.primary,
  },
  profileAction: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 20,
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
  },
});
