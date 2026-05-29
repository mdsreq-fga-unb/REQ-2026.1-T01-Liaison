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
import Select from '../ui/Select';
import { ApiError, checkEmail } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface Step2Data {
  nome?: string;
  sobrenome?: string;
  email?: string;
  universidade?: string;
  semestre_atual?: number | null;
  password?: string;
  termos?: boolean;
}

export interface Step2PersonalDataProps {
  onContinue: (data: Step2Data) => void;
  initialData?: Partial<Step2Data>;
  initialErrors?: Record<string, string>;
  onBack?: () => void;
}

const UNIVERSIDADES = [
  { label: 'UnB - Universidade de Brasília', value: 'Universidade de Brasília' },
  { label: 'Outra', value: 'Outra' },
];

const SEMESTRES = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}º semestre`,
  value: String(i + 1),
}));

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): boolean {
  const hasLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  return hasLength && hasLetters && hasNumbers;
}

function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const data = error.data as Record<string, unknown>;
  if (!data || typeof data !== 'object') return {};
  const fieldErrors: Record<string, string> = {};
  for (const [field, messages] of Object.entries(data)) {
    if (field === 'detail') continue;
    const msg = Array.isArray(messages) ? messages[0] : String(messages);
    fieldErrors[field] = msg;
  }
  return fieldErrors;
}

export default function Step2PersonalData({
  onContinue,
  initialData = {},
  initialErrors,
  onBack,
}: Step2PersonalDataProps) {
  const navigation = useNavigation<any>();
  const [nome, setNome] = useState(initialData.nome ?? '');
  const [sobrenome, setSobrenome] = useState(initialData.sobrenome ?? '');
  const [email, setEmail] = useState(initialData.email ?? '');
  const [universidade, setUniversidade] = useState<string | null>(initialData.universidade ?? null);
  const [semestre, setSemestre] = useState<string | null>(
    initialData.semestre_atual ? String(initialData.semestre_atual) : null,
  );
  const [password, setPassword] = useState(initialData.password ?? '');
  const [termos, setTermos] = useState(initialData.termos ?? false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>(initialErrors ?? {});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const errors: Record<string, string> = { ...serverErrors, ...localErrors };
  const [isChecking, setIsChecking] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!sobrenome.trim()) newErrors.sobrenome = 'Sobrenome é obrigatório';
    if (!email.trim()) { newErrors.email = 'E-mail é obrigatório'; }
    else if (!isValidEmail(email)) { newErrors.email = 'E-mail inválido'; }
    if (!universidade) newErrors.universidade = 'Universidade é obrigatória';
    if (!password) { newErrors.password = 'Senha é obrigatória'; }
    else if (!isStrongPassword(password)) { newErrors.password = 'Senha fraca: use 8+ caracteres com letras e números'; }
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

    // Verifica unicidade do email SEMPRE que o formato for válido,
    // independente de outros campos terem erros locais.
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

    onContinue({ nome: nome.trim(), sobrenome: sobrenome.trim(), email: email.trim(), universidade: universidade ?? undefined, semestre_atual: semestre ? Number(semestre) : null, password, termos });
  }

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Header + Progress ═══ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack ? onBack() : navigation.goBack()} accessibilityRole="link" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etapa 2 de 4</Text>
      </View>
      <ProgressBar currentStep={2} totalSteps={4} checkmarkIcon={<Ionicons name="checkmark" size={14} color={colors.neutral.white} />} />

      {/* ═══ SCROLLABLE: Form ═══ */}
      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={90}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.badge}>CADASTRO DE ESTUDANTE</Text>
        <Text style={styles.heading}>Seus dados pessoais</Text>
        <Text style={styles.subtitle}>Use o e-mail institucional da sua universidade.</Text>

        <View style={styles.twoCol}>
          <View style={styles.halfCol}>
            <Input testID="input-nome" label="Nome" required value={nome} onChangeText={(t) => { setNome(t); if (t.trim()) clearError('nome'); }} placeholder="Ana" error={errors.nome} />
          </View>
          <View style={styles.halfCol}>
            <Input testID="input-sobrenome" label="Sobrenome" required value={sobrenome} onChangeText={(t) => { setSobrenome(t); if (t.trim()) clearError('sobrenome'); }} placeholder="Souza" error={errors.sobrenome} />
          </View>
        </View>

        <Input testID="input-email" label="E-mail institucional" required value={email} onChangeText={(t) => { setEmail(t); if (isValidEmail(t)) clearError('email'); }} keyboardType="email-address" autoCapitalize="none" placeholder="ana.souza@universidade.edu.br" error={errors.email} />

        <View style={styles.twoCol}>
          <View style={styles.halfCol}>
            <Select label="Universidade" required options={UNIVERSIDADES} value={universidade} onChange={(v) => { setUniversidade(v); clearError('universidade'); }} placeholder="Selecione" error={errors.universidade} testID="select-universidade" />
          </View>
          <View style={styles.halfCol}>
            <Select label="Semestre atual" options={SEMESTRES} value={semestre} onChange={setSemestre} placeholder="Selecione" />
          </View>
        </View>

        <Input testID="input-senha" label="Senha" required value={password} onChangeText={(t) => { setPassword(t); if (isStrongPassword(t)) clearError('password'); }} secureTextEntry placeholder="Mínimo 8 caracteres" error={errors.password} />
        <View style={styles.strengthWrapper}><PasswordStrengthIndicator password={password} /></View>
        <View style={styles.termsWrapper}><Checkbox label="Li e aceito os Termos de Uso e a Política de Privacidade" checked={termos} onChange={setTermos} /></View>
        <Button title="Continuar" onPress={handleContinue} loading={isChecking} rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.neutral.white} />} />

        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate('Login')} accessibilityRole="link">
          <Text style={styles.footerText}>Já tem uma conta? <Text style={styles.footerLink}>Fazer login</Text></Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  flex1: { flex: 1 },

  header: {
    backgroundColor: colors.neutral.white, paddingHorizontal: spacing.horizontal.step,
    paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.neutral.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { ...typography.label, color: colors.text.primary },
  stepIndicator: { ...typography['body-sm'], color: colors.text.secondary },

  scrollContent: { padding: spacing.horizontal.step, paddingTop: 24, paddingBottom: 40 },
  badge: { ...typography['label-upper'], color: colors.text.secondary, marginBottom: 8 },
  heading: { ...typography.h1, color: colors.text.primary, fontSize: 24, lineHeight: 28.8 },
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 6, marginBottom: 24 },

  twoCol: { flexDirection: 'row', gap: 12 },
  halfCol: { flex: 1 },
  strengthWrapper: { marginTop: -14, marginBottom: 16 },
  termsWrapper: { marginBottom: 24 },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerText: { ...typography.body, color: colors.text.secondary },
  footerLink: { fontFamily: typography.button.fontFamily, color: colors.brand.navy },
});
