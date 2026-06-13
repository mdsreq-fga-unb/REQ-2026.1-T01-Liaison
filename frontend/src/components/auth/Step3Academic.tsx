import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Button from '../ui/Button';
import Input from '../ui/Input';
import ProgressBar from '../ui/ProgressBar';
import Select from '../ui/Select';
import { ApiError, checkMatricula } from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { extractFieldErrors } from '../../utils/errors';

export interface Step3Data {
  curso?: string; turno?: string | null; ano_conclusao?: number | null;
  horas_extensao_exigidas?: number | null; matricula?: string;
}

export interface Step3AcademicProps {
  onContinue: (data: Step3Data) => void;
  initialData?: Partial<Step3Data>;
  initialErrors?: Record<string, string>;
  onBack?: () => void;
}

const TURNOS = [
  { label: 'Matutino', value: 'matutino' }, { label: 'Vespertino', value: 'vespertino' },
  { label: 'Noturno', value: 'noturno' }, { label: 'Integral', value: 'integral' },
];
const currentYear = new Date().getFullYear();
const ANO_CONCLUSAO = Array.from({ length: 10 }, (_, i) => ({ label: String(currentYear + i), value: String(currentYear + i) }));

export default function Step3Academic({ onContinue, initialData = {}, initialErrors, onBack }: Step3AcademicProps) {
  const navigation = useNavigation<any>();
  const [curso, setCurso] = useState(initialData.curso ?? '');
  const [turno, setTurno] = useState<string | null>(initialData.turno ?? null);
  const [anoConclusao, setAnoConclusao] = useState<string | null>(initialData.ano_conclusao ? String(initialData.ano_conclusao) : null);
  const [horas, setHoras] = useState(initialData.horas_extensao_exigidas ? String(initialData.horas_extensao_exigidas) : '');
  const [matricula, setMatricula] = useState(initialData.matricula ?? '');
  const [localErrors, setLocalErrors] = useState<Record<string, string>>(initialErrors ?? {});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const errors: Record<string, string> = { ...serverErrors, ...localErrors };
  const [isChecking, setIsChecking] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!curso.trim()) newErrors.curso = 'Curso é obrigatório';
    if (!matricula.trim()) newErrors.matricula = 'Matrícula é obrigatória';
    if (!turno) newErrors.turno = 'Turno é obrigatório';
    if (!anoConclusao) newErrors.anoConclusao = 'Ano de conclusão é obrigatório';
    if (!horas.trim()) newErrors.horas = 'Horas de extensão exigidas é obrigatório';
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

    // Verifica unicidade da matrícula SEMPRE que estiver preenchida,
    // independente de outros campos terem erros locais.
    let serverValid = true;
    if (matricula.trim()) {
      setIsChecking(true);
      try {
        await checkMatricula(matricula.trim());
        setServerErrors((prev) => {
          const next = { ...prev };
          delete next.matricula;
          return next;
        });
      } catch (error) {
        serverValid = false;
        const fieldErrors = extractFieldErrors(error);
        setServerErrors((prev) => ({
          ...prev,
          ...(Object.keys(fieldErrors).length > 0
            ? fieldErrors
            : { matricula: 'Erro ao verificar matrícula. Tente novamente.' }),
        }));
      } finally {
        setIsChecking(false);
      }
    }

    if (!localValid || !serverValid) return;

    onContinue({ curso: curso.trim(), turno: turno ?? undefined, ano_conclusao: anoConclusao ? Number(anoConclusao) : null, horas_extensao_exigidas: horas ? Number(horas) : null, matricula: matricula.trim() });
  }

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Header + Progress ═══ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack ? onBack() : navigation.goBack()} accessibilityRole="link" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etapa 3 de 4</Text>
      </View>
      <ProgressBar currentStep={3} totalSteps={4} checkmarkIcon={<Ionicons name="checkmark" size={14} color={colors.neutral.white} />} />

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
        <Text style={styles.heading}>Sua vida acadêmica</Text>
        <Text style={styles.subtitle}>Informações sobre sua graduação para personalizar as oportunidades.</Text>

        <Input testID="input-curso" label="Curso" required value={curso} onChangeText={(t) => { setCurso(t); if (t.trim()) clearError('curso'); }} placeholder="Ex: Engenharia de Software" error={errors.curso} />

        <View style={styles.twoCol}>
          <View style={styles.halfCol}><Select testID="select-turno" label="Turno" required options={TURNOS} value={turno} onChange={(v) => { setTurno(v); clearError('turno'); }} placeholder="Selecione" error={errors.turno} /></View>
          <View style={styles.halfCol}><Select label="Ano de conclusão" required options={ANO_CONCLUSAO} value={anoConclusao} onChange={(v) => { setAnoConclusao(v); clearError('anoConclusao'); }} placeholder="Selecione" error={errors.anoConclusao} testID="select-ano-conclusao" /></View>
        </View>

        <Input testID="input-horas" label="Horas de extensão exigidas" required value={horas} onChangeText={(t) => { setHoras(t); if (t.trim()) clearError('horas'); }} keyboardType="numeric" placeholder="Ex: 360" error={errors.horas} />

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.brand.gold} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>Suas horas de voluntariado serão registradas automaticamente após cada atividade. O certificado digital gerado é aceito pela maioria das universidades brasileiras.</Text>
          </View>
        </View>

        <Input testID="input-matricula" label="Matrícula" required value={matricula} onChangeText={(t) => { setMatricula(t); if (t.trim()) clearError('matricula'); }} placeholder="Ex: 20231234567" error={errors.matricula} />

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

  infoBox: {
    flexDirection: 'row', backgroundColor: colors.accent.lightBg, borderRadius: 12,
    padding: 16, marginBottom: spacing.formGap, borderWidth: 1, borderColor: colors.accent.subtleBorder,
    gap: 12, alignItems: 'flex-start',
  },
  infoTextContainer: { flex: 1 },
  infoText: { ...typography['body-sm'], color: colors.text.info, lineHeight: 19.5, fontSize: 13 },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerText: { ...typography.body, color: colors.text.secondary },
  footerLink: { fontFamily: typography.button.fontFamily, color: colors.brand.navy },
});
