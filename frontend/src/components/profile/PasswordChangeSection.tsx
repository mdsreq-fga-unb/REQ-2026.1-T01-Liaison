import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import PasswordStrengthIndicator from '../ui/PasswordStrengthIndicator';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { changePassword } from '../../services/api';

export interface PasswordChangeSectionProps {
  testID?: string;
}

export default function PasswordChangeSection({
  testID = 'password-change-section',
}: PasswordChangeSectionProps) {
  const { accessToken } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function validate(): string | null {
    if (!newPassword) return 'A nova senha é obrigatória.';
    if (newPassword.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'A senha deve conter letras e números.';
    }
    if (newPassword !== confirmPassword) return 'As senhas não coincidem.';
    return null;
  }

  async function handleSubmit() {
    setSuccessMessage('');
    setErrorMessage('');

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!accessToken) {
      setErrorMessage('Você precisa estar autenticado para alterar a senha.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePassword(accessToken, newPassword, confirmPassword);
      setSuccessMessage(result.detail || 'Senha alterada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      if (e.data && typeof e.data === 'object') {
        const messages = Object.values(e.data).flat().join('\n');
        setErrorMessage(messages || 'Erro ao alterar a senha. Tente novamente.');
      } else {
        setErrorMessage('Erro ao alterar a senha. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View testID={testID} style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconSquare}>
          <Ionicons name="lock-closed" size={18} color={colors.brand.gold} />
        </View>
        <Text style={styles.sectionTitle}>Segurança</Text>
      </View>

      {/* Nova Senha */}
      <Text style={styles.label}>Nova senha</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          testID="new-password-input"
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          placeholder="Digite sua nova senha"
          placeholderTextColor={colors.text.secondary}
        />
        <TouchableOpacity
          testID="toggle-new-password"
          style={styles.eyeButton}
          onPress={() => setShowNewPassword(!showNewPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showNewPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      </View>
      <PasswordStrengthIndicator password={newPassword} />

      {/* Confirmar Senha */}
      <Text style={styles.label}>Confirmar nova senha</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          testID="confirm-password-input"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirme sua nova senha"
          placeholderTextColor={colors.text.secondary}
        />
        <TouchableOpacity
          testID="toggle-confirm-password"
          style={styles.eyeButton}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={20}
            color={colors.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Success/Error Messages */}
      {successMessage ? (
        <Text style={styles.successText} testID="password-success-message">{successMessage}</Text>
      ) : null}
      {errorMessage ? (
        <Text style={styles.errorText} testID="password-error-message">{errorMessage}</Text>
      ) : null}

      {/* Submit Button */}
      <TouchableOpacity
        testID="password-submit-button"
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.neutral.white} />
        ) : (
          <Text style={styles.submitButtonText}>Alterar senha</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: colors.accent.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 15,
    color: colors.text.primary,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.text.info,
    marginBottom: spacing.labelGap,
    marginTop: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    paddingHorizontal: 16,
    paddingRight: 44,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  successText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.success,
    marginTop: 12,
  },
  errorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#ef4444',
    marginTop: 12,
  },
  submitButton: {
    marginTop: 16,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 15,
    color: colors.neutral.white,
  },
});
