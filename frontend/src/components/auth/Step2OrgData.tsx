import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import Input from '../ui/Input';
import PasswordStrengthIndicator from '../ui/PasswordStrengthIndicator';
import ProgressBar from '../ui/ProgressBar';
import { ApiError, checkEmail } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { extractFieldErrors } from '../../utils/errors';
import { formatCNPJ, formatPhone } from '../../utils/formatters';
import { isStrongPassword, isValidCNPJ, isValidEmail } from '../../utils/validators';

export interface OrgStep2Data {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  email: string;
  telefone: string;
  nome_responsavel: string;
  password?: string;
  termos?: boolean;
}

export interface Step2OrgDataProps {
  onContinue: (data: OrgStep2Data) => void;
  initialData?: Partial<OrgStep2Data>;
  initialErrors?: Record<string, string>;
  onBack?: () => void;
}

export default function Step2OrgData({
  onContinue,
  initialData = {},
  initialErrors,
  onBack,
}: Step2OrgDataProps) {
  const navigation = useNavigation<any>();
  const [cnpj, setCnpj] = useState(initialData.cnpj ?? '');
  const [razaoSocial, setRazaoSocial] = useState(initialData.razao_social ?? '');
  const [nomeFantasia, setNomeFantasia] = useState(initialData.nome_fantasia ?? '');
  const [email, setEmail] = useState(initialData.email ?? '');
  const [telefone, setTelefone] = useState(initialData.telefone ?? '');
  const [nomeResponsavel, setNomeResponsavel] = useState(initialData.nome_responsavel ?? '');
  const [password, setPassword] = useState(initialData.password ?? '');
  const [termos, setTermos] = useState(initialData.termos ?? false);

  const [localErrors, setLocalErrors] = useState<Record<string, string>>(initialErrors ?? {});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);

  // Sincroniza initialErrors do componente pai (ex: erros de validação do backend após submit)
  React.useEffect(() => {
    if (initialErrors && Object.keys(initialErrors).length > 0) {
      setLocalErrors(initialErrors);
    }
  }, [initialErrors]);

  const errors: Record<string, string> = { ...serverErrors, ...localErrors };
  const hasErrors = Object.keys(errors).length > 0;

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!isValidCNPJ(cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }

    if (!razaoSocial.trim()) newErrors.razao_social = 'Razão Social é obrigatória';
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!nomeResponsavel.trim()) newErrors.nome_responsavel = 'Nome do responsável é obrigatório';

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!isStrongPassword(password)) {
      newErrors.password = 'Senha fraca: use 8+ caracteres com letras e números';
    }

    if (!termos) {
      newErrors.termos = 'Você deve aceitar os termos';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearError(field: string) {
    setLocalErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setServerErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleContinue() {
    const localValid = validate();

    let serverValid = true;
    if (isValidEmail(email.trim())) {
      setIsChecking(true);
      try {
        await checkEmail(email.trim());
        setServerErrors((prev) => {
          const next = { ...prev };
          delete next.email;
          return next;
        });
      } catch (error) {
        serverValid = false;
        const fieldErrors = extractFieldErrors(error);
        setServerErrors((prev) => ({
          ...prev,
          ...(Object.keys(fieldErrors).length > 0
            ? fieldErrors
            : { email: 'Erro ao verificar e-mail. Tente novamente.' }),
        }));
      } finally {
        setIsChecking(false);
      }
    }

    if (!localValid || !serverValid) return;

    onContinue({
      cnpj: cnpj.replace(/\D/g, ''),
      razao_social: razaoSocial.trim(),
      nome_fantasia: nomeFantasia.trim() || undefined,
      email: email.trim(),
      telefone: telefone.replace(/\D/g, ''),
      nome_responsavel: nomeResponsavel.trim(),
      password,
      termos,
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (onBack ? onBack() : navigation.goBack())}
          accessibilityRole="link"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etapa 2 de 3</Text>
      </View>

      <ProgressBar
        currentStep={2}
        totalSteps={3}
        stepLabels={['Perfil', 'Instituição', 'Interesses']}
        checkmarkIcon={<Ionicons name="checkmark" size={14} color={colors.neutral.white} />}
      />

      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={90}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.badge}>CADASTRO DE ORGANIZAÇÃO</Text>
        <Text style={styles.heading}>Dados da instituição</Text>
        <Text style={styles.subtitle}>Preencha as informações da sua organização ou projeto.</Text>

        {hasErrors && (
          <View style={styles.errorSummary}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorSummaryText}>Corrija os campos abaixo</Text>
          </View>
        )}

        <Input
          testID="input-cnpj"
          label="CNPJ"
          required
          value={cnpj}
          onChangeText={(t) => {
            const formatted = formatCNPJ(t);
            setCnpj(formatted);
            if (formatted.replace(/\D/g, '').length === 14) clearError('cnpj');
          }}
          keyboardType="numeric"
          placeholder="00.000.000/0000-00"
          error={errors.cnpj}
        />

        <Input
          testID="input-razao-social"
          label="Razão Social"
          required
          value={razaoSocial}
          onChangeText={(t) => {
            setRazaoSocial(t);
            if (t.trim()) clearError('razao_social');
          }}
          placeholder="Ex: Associação de Apoio à Criança"
          error={errors.razao_social}
        />

        <Input
          testID="input-nome-fantasia"
          label="Nome Fantasia"
          value={nomeFantasia}
          onChangeText={setNomeFantasia}
          placeholder="Ex: Projeto Esperança"
          error={errors.nome_fantasia}
        />

        <Input
          testID="input-email"
          label="E-mail"
          required
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (isValidEmail(t)) clearError('email');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="contato@organizacao.org"
          error={errors.email}
        />

        <Input
          testID="input-telefone"
          label="Telefone"
          required
          value={telefone}
          onChangeText={(t) => {
            const formatted = formatPhone(t);
            setTelefone(formatted);
            if (formatted.replace(/\D/g, '').length >= 10) clearError('telefone');
          }}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
          error={errors.telefone}
        />

        <Input
          testID="input-nome-responsavel"
          label="Nome do Responsável"
          required
          value={nomeResponsavel}
          onChangeText={(t) => {
            setNomeResponsavel(t);
            if (t.trim()) clearError('nome_responsavel');
          }}
          placeholder="Quem está realizando o cadastro?"
          error={errors.nome_responsavel}
        />

        <Input
          testID="input-senha"
          label="Senha"
          required
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (isStrongPassword(t)) clearError('password');
          }}
          secureTextEntry
          placeholder="Mínimo 8 caracteres"
          error={errors.password}
        />

        <View style={styles.strengthWrapper}>
          <PasswordStrengthIndicator password={password} />
        </View>

        <View style={styles.termsWrapper}>
          <Checkbox
            label="Li e aceito os Termos de Uso e a Política de Privacidade"
            checked={termos}
            onChange={(v) => {
              setTermos(v);
              if (v) clearError('termos');
            }}
            error={errors.termos}
          />
        </View>

        <Button
          title="Continuar"
          onPress={handleContinue}
          loading={isChecking}
          rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.neutral.white} />}
        />

        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate('Login')}
          accessibilityRole="link"
        >
          <Text style={styles.footerText}>
            Já tem uma conta? <Text style={styles.footerLink}>Fazer login</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  flex1: { flex: 1 },

  header: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.horizontal.step,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { ...typography.label, color: colors.text.primary },
  stepIndicator: { ...typography['body-sm'], color: colors.text.secondary },

  scrollContent: { padding: spacing.horizontal.step, paddingTop: 24, paddingBottom: 40 },
  badge: { ...typography['label-upper'], color: colors.text.secondary, marginBottom: 8 },
  heading: { ...typography.h1, color: colors.text.primary, fontSize: 24, lineHeight: 28.8 },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 6, marginBottom: 24 },

  errorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorSummaryText: {
    ...typography['body-sm'],
    color: '#ef4444',
    fontWeight: '600',
  },

  strengthWrapper: { marginTop: -14, marginBottom: 16 },
  termsWrapper: { marginBottom: 24 },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerText: { ...typography.body, color: colors.text.secondary },
  footerLink: { fontFamily: typography.button.fontFamily, color: colors.brand.navy },
});
