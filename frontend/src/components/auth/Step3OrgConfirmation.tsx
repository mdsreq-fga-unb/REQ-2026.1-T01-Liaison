import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Button from '../ui/Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Step3OrgConfirmationProps {
  onHome: () => void;
}

export default function Step3OrgConfirmation({
  onHome,
}: Step3OrgConfirmationProps) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={colors.brand.gold}
          />
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Aguardando aprovação</Text>
        </View>

        <Text style={styles.title}>Cadastro realizado!</Text>
        <Text style={styles.description}>
          Seus dados foram enviados com sucesso. Um administrador irá revisar as
          informações para liberar o acesso da sua organização.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ O que acontece agora?</Text>
          <Text style={styles.infoText}>
            Sua organização está com status pendente. Enviaremos um e-mail para
            você assim que o perfil for aprovado.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Voltar para o início" onPress={onHome} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.horizontal.step,
    backgroundColor: colors.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    backgroundColor: colors.neutral.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    ...typography.label,
    color: colors.text.primary,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: colors.neutral.bg,
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  infoTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoText: {
    ...typography.body,
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: 24,
  },
});
