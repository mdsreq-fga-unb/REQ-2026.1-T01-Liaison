import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SvgProps } from 'react-native-svg';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import SaudeIcon from '../../../assets/step4_saude_icon.svg';
import EducacaoIcon from '../../../assets/step4_educacao_icon.svg';
import TecnologiaIcon from '../../../assets/step4_tecnologia_icon.svg';
import MeioAmbienteIcon from '../../../assets/step4_meio_ambiente_icon.svg';
import AssistenciaSocialIcon from '../../../assets/step4_assistencia_social_icon.svg';
import ArteCulturaIcon from '../../../assets/step4_arte_cultura_icon.svg';

import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const CATEGORIES: { id: string; label: string; icon: React.FC<SvgProps> }[] = [
  { id: 'saude', label: 'Saúde', icon: SaudeIcon },
  { id: 'educacao', label: 'Educação', icon: EducacaoIcon },
  { id: 'tecnologia', label: 'Tecnologia', icon: TecnologiaIcon },
  { id: 'meio_ambiente', label: 'Meio Ambiente', icon: MeioAmbienteIcon },
  { id: 'assistencia_social', label: 'Assistência Social', icon: AssistenciaSocialIcon },
  { id: 'arte_cultura', label: 'Arte & Cultura', icon: ArteCulturaIcon },
];

export interface Step4FormData {
  email?: string; password?: string; nome?: string;
  universidade?: string; curso?: string; matricula?: string;
  [key: string]: any;
}

export interface Step4InterestsProps {
  onFinish: (data: Step4FormData & { interesses: string[] }) => void;
  formData: Step4FormData;
  onBack?: (interests: string[]) => void;
  initialInterests?: string[];
  loading?: boolean;
}

export default function Step4Interests({ onFinish, formData, onBack, initialInterests, loading }: Step4InterestsProps) {
  const navigation = useNavigation<any>();
  const [selected, setSelected] = useState<string[]>(initialInterests ?? []);
  const count = selected.length;
  const maxCount = 3;

  function toggleCategory(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxCount) return prev;
      return [...prev, id];
    });
  }

  function handleFinish() { onFinish({ ...formData, interesses: selected }); }

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Header + Progress ═══ */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onBack ? onBack(selected) : navigation.goBack()} accessibilityRole="link" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={colors.text.primary} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Etapa 4 de 4</Text>
      </View>
      <ProgressBar currentStep={4} totalSteps={4} checkmarkIcon={<Ionicons name="checkmark" size={14} color={colors.neutral.white} />} />

      {/* ═══ SCROLLABLE: Content ═══ */}
      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={90}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.badge}>CADASTRO DE ESTUDANTE</Text>
        <Text style={styles.heading}>Suas áreas de interesse</Text>
        <Text style={styles.subtitle}>Escolha até 3 categorias para receber as oportunidades mais relevantes para você.</Text>

        <View style={styles.counterRow}>
          <Text style={styles.counterLabel}>Categorias selecionadas</Text>
          <Text style={styles.counterValue}><Text style={styles.counterNumber}>{count}</Text>{' / '}{maxCount}</Text>
        </View>

        {CATEGORIES.map((cat) => {
          const isSelected = selected.includes(cat.id);
          const IconComponent = cat.icon;
          return (
            <TouchableOpacity key={cat.id} testID="category-card"
              onPress={() => toggleCategory(cat.id)}
              style={[styles.card, isSelected && styles.cardSelected]}
              activeOpacity={0.7} accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.cardRow}>
                <View style={styles.iconBg}><IconComponent width={20} height={20} /></View>
                <View style={styles.cardTextContent}>
                  <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{cat.label}</Text>
                  <Text style={styles.cardDescription}>
                    {cat.id === 'saude' && 'Apoio a hospitais, campanhas e comunidades vulneráveis'}
                    {cat.id === 'educacao' && 'Tutoria, reforço escolar e alfabetização'}
                    {cat.id === 'tecnologia' && 'Inclusão digital e desenvolvimento de soluções sociais'}
                    {cat.id === 'meio_ambiente' && 'Conservação, sustentabilidade e projetos ecológicos'}
                    {cat.id === 'assistencia_social' && 'Apoio a famílias, abrigos e populações em situação de risco'}
                    {cat.id === 'arte_cultura' && 'Oficinas culturais, patrimônio e expressão artística comunitária'}
                  </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.buttonWrapper}>
          <Button title="Criar minha conta" onPress={handleFinish} loading={loading} rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.neutral.white} />} />
        </View>

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
  subtitle: { ...typography.body, color: colors.text.secondary, marginTop: 6, marginBottom: 20 },

  counterRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.accent.lightBg, borderWidth: 1, borderColor: colors.accent.subtleBorder,
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24,
  },
  counterLabel: { ...typography.body, color: colors.text.info },
  counterValue: { ...typography.body, color: colors.text.secondary },
  counterNumber: { fontFamily: typography.button.fontFamily, fontSize: 13, color: colors.brand.gold, fontWeight: '700' },

  card: {
    padding: 16, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white, marginBottom: 8,
  },
  cardSelected: {
    borderColor: colors.brand.navy,
    shadowColor: 'rgba(26,39,68,0.06)', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(26,39,68,0.04)',
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  cardTextContent: { flex: 1 },
  cardLabel: { ...typography.label, color: colors.text.primary, fontSize: 13 },
  cardLabelSelected: { color: colors.brand.navy },
  cardDescription: { ...typography['body-sm'], color: colors.text.secondary, fontSize: 11, marginTop: 2, lineHeight: 14 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.neutral.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  checkboxSelected: { backgroundColor: colors.brand.navy, borderColor: colors.brand.navy },
  checkboxMark: { color: colors.neutral.white, fontSize: 10, fontWeight: '700' },

  buttonWrapper: { marginTop: 24 },
  footer: { alignItems: 'center', paddingTop: 20 },
  footerText: { ...typography.body, color: colors.text.secondary },
  footerLink: { fontFamily: typography.button.fontFamily, color: colors.brand.navy },
});
