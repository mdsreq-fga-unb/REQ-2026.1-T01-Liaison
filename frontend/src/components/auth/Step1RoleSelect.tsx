import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import StudentIcon from '../../../assets/step1_student_icon.svg';
import OrgIcon from '../../../assets/step1_org_icon.svg';

import Button from '../ui/Button';
import RadioCard from '../ui/RadioCard';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface Step1RoleSelectProps {
  onContinue: (role: string) => void;
}

export default function Step1RoleSelect({ onContinue }: Step1RoleSelectProps) {
  const navigation = useNavigation<any>();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="link"
          accessibilityLabel="Voltar"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>Como você vai usar o Liaison?</Text>
        <Text style={styles.subtitle}>
          Escolha o perfil que melhor descreve quem você é.
        </Text>

        <RadioCard
          testID="radio-card-estudante"
          title="Estudante universitário"
          description="Quero encontrar oportunidades de voluntariado e cumprir horas de extensão."
          selected={selectedRole === 'estudante'}
          onPress={() => setSelectedRole('estudante')}
          icon={<StudentIcon width={24} height={24} />}
          badge="PARA ESTUDANTES"
          badgeColor={colors.brand.navy}
        />

        <RadioCard
          testID="radio-card-organizacao"
          title="Organização social"
          description="Quero publicar vagas de voluntariado e gerenciar participantes."
          selected={selectedRole === 'organizacao'}
          onPress={() => setSelectedRole('organizacao')}
          disabled
          icon={<OrgIcon width={24} height={24} />}
          badge="PARA ONGS E PROJETOS"
          badgeColor={colors.brand.gold}
        />

        <View style={styles.spacer} />

        <Button
          title="Continuar"
          onPress={() => {
            if (selectedRole) onContinue(selectedRole);
          }}
          disabled={!selectedRole}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="link"
        >
          <Text style={styles.footerText}>
            Já tem uma conta?{' '}
            <Text style={styles.footerLink}>Fazer login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
    justifyContent: 'space-between',
  },

  /* Header */
  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.horizontal.step,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    ...typography.label,
    color: colors.text.primary,
  },

  /* Content */
  content: {
    flex: 1,
    paddingHorizontal: spacing.horizontal.step,
    paddingTop: 28,
  },
  heading: {
    ...typography.h1,
    color: colors.text.primary,
    lineHeight: 38.4,
    fontSize: 24,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 24,
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },

  /* Footer */
  footer: {
    paddingVertical: 20,
    paddingHorizontal: spacing.horizontal.step,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  footerLink: {
    fontFamily: typography.button.fontFamily,
    color: colors.brand.navy,
  },
});
