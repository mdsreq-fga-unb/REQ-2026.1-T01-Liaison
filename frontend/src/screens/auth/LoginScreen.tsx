import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import LogoIcon from '../../../assets/login_logo_icon.svg';
import StudentTabIcon from '../../../assets/login_student_tab_icon.svg';
import OrgTabIcon from '../../../assets/login_org_tab_icon.svg';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { handleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [activeTab, setActiveTab] = useState<'estudante' | 'organizacao'>('estudante');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleEntrar() {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await handleLogin(email, senha);
      // On success, navigation happens automatically via RootNavigator
      // (isAuthenticated becomes true → role-based stack renders)
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 401) {
          setErrorMessage('E-mail ou senha inválidos');
        } else {
          setErrorMessage('Erro de conexão');
        }
      } else if (e instanceof TypeError || (e as Error).message?.includes('Network')) {
        setErrorMessage('Erro de conexão');
      } else {
        setErrorMessage('Erro ao realizar login. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop} edges={['top']} />

      {/* ═══ FIXED: Header only ═══ */}
      <View style={styles.headerBar}>
        <View style={styles.logoIconBg}>
          <LogoIcon width={20} height={20} />
        </View>
        <View style={styles.logoTextBlock}>
          <Text style={styles.logoTitle}>Liaison</Text>
          <Text style={styles.logoTagline}>Plataforma de Voluntariado</Text>
        </View>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>

      {/* ═══ SCROLLABLE: Hero + Stats + Form (moves with keyboard) ═══ */}
      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={90}
      >
        {/* ── Hero Section (navy, h=212) ── */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Para estudantes universitários</Text>
          <Text style={styles.heroTitle}>
            Conecte seu{' '}
            <Text style={styles.heroTitleAccent}>aprendizado</Text>{' '}
            ao mundo real
          </Text>
          <Text style={styles.heroDesc}>
            Descubra oportunidades de voluntariado e cumpra suas horas de extensão — tudo em um só lugar.
          </Text>
          <View style={styles.heroDecorCircle} />
        </View>

        {/* ── Stats Bar ── */}
        <View testID="stats-bar" style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>340+</Text>
            <Text style={styles.statLabel}>Oportunidades</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>82</Text>
            <Text style={styles.statLabel}>Organizações</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8k</Text>
            <Text style={styles.statLabel}>Estudantes</Text>
          </View>
        </View>

        {/* ── Form Section (cream bg) ── */}
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>Entrar na plataforma</Text>
          <Text style={styles.sectionSubtitle}>Acesse sua conta para continuar.</Text>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            testID="tab-estudante"
            style={[styles.tab, activeTab === 'estudante' && styles.tabActive]}
            onPress={() => setActiveTab('estudante')}
            activeOpacity={0.7}
          >
            <View style={styles.tabInner}>
              <StudentTabIcon width={15} height={15} />
              <Text style={[styles.tabText, activeTab === 'estudante' && styles.tabTextActive]}>Estudante</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-organizacao"
            style={[styles.tab, activeTab === 'organizacao' && styles.tabActive]}
            onPress={() => setActiveTab('organizacao')}
            activeOpacity={0.7}
          >
            <View style={styles.tabInner}>
              <OrgTabIcon width={15} height={15} />
              <Text style={[styles.tabText, activeTab === 'organizacao' && styles.tabTextActive]}>Organização</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Email */}
        <Text style={styles.fieldLabel}>
          E-mail institucional <Text style={styles.fieldLabelAsterisk}>*</Text>
        </Text>
        <Input
          label="" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          placeholder="seu@email.edu.br" placeholderTextColor={colors.text.secondary}
          testID="input-email" hideLabel style={styles.inputNoMargin}
        />

        {/* Password */}
        <Text style={styles.fieldLabel}>
          Senha <Text style={styles.fieldLabelAsterisk}>*</Text>
        </Text>
        <View style={styles.passwordRow}>
          <Input
            testID="input-senha" label="" value={senha} onChangeText={setSenha}
            secureTextEntry={!showPassword} placeholder="Sua senha"
            placeholderTextColor={colors.text.secondary} hideLabel
            style={styles.inputNoMargin}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <Ionicons name="eye" size={18} color={colors.text.secondary} />
            ) : (
              <Ionicons name="eye-off" size={18} color={colors.text.secondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Options row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxRow} activeOpacity={0.7}
            onPress={() => setLembrar(!lembrar)}
            accessibilityRole="checkbox" accessibilityState={{ checked: lembrar }}
          >
            <View style={[styles.checkboxBox, lembrar && styles.checkboxBoxChecked]}>
              {lembrar && <Text style={styles.checkboxCheck}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Lembrar de mim</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="link">
            <Text style={styles.forgotLink}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <View testID="login-error" style={styles.errorBanner}>
            <Ionicons name="information-circle" size={16} color={colors.neutral.white} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <Button
          title="Entrar"
          onPress={handleEntrar}
          loading={isSubmitting}
          testID="button-entrar"
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.registerRow}>
          <Text style={styles.registerText}>Ainda não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityRole="link">
            <Text style={styles.registerLinkText}>Criar conta gratuita</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNotice}>
          <Ionicons name="lock-closed" size={13} color={colors.text.secondary} />
          <Text style={styles.securityText}>Seus dados estão protegidos com criptografia</Text>
        </View>
        </View>{/* end mainContent */}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  safeTop: { backgroundColor: colors.brand.navy },
  flex1: { flex: 1, backgroundColor: colors.neutral.bg },
  scrollContent: { flexGrow: 1 },

  /* ═══ FIXED HEADER ═══ */

  headerBar: {
    backgroundColor: colors.brand.navy, height: 93.6,
    justifyContent: 'center', overflow: 'hidden', position: 'relative', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)'
  },
  logoIconBg: {
    position: 'absolute', left: 24, top: 30.8,
    width: 36, height: 36, borderRadius: 8, backgroundColor: colors.brand.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  logoTextBlock: { position: 'absolute', left: 72, top: 24 },
  logoTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, lineHeight: 32, color: colors.neutral.white,
  },
  logoTagline: {
    fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17.6, letterSpacing: 0.88,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
  },
  decorCircleLarge: {
    position: 'absolute', left: 300, top: -40,
    width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: 'rgba(212,129,58,0.15)',
  },
  decorCircleSmall: {
    position: 'absolute', left: 251, top: 31.59,
    width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },

  hero: {
    backgroundColor: colors.brand.navy, height: 212, paddingHorizontal: 24,
    justifyContent: 'center', overflow: 'hidden', position: 'relative',
  },
  heroLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20.8, letterSpacing: 1.56,
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
  },
  heroTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 28.8, color: colors.neutral.white, marginTop: 8,
  },
  heroTitleAccent: {
    fontFamily: 'PlayfairDisplay_700Bold_Italic', fontSize: 24, lineHeight: 28.8, color: '#f0b070',
  },
  heroDesc: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20.8, color: 'rgba(255,255,255,0.55)', marginTop: 8,
  },
  heroDecorCircle: {
    position: 'absolute', left: -60, bottom: -60,
    width: 180, height: 180, borderRadius: 400, borderWidth: 1.5, borderColor: 'rgba(212,129,58,0.12)',
  },

  statsBar: {
    backgroundColor: colors.brand.navy, flexDirection: 'row',
    paddingTop: 21, paddingBottom: 24, paddingHorizontal: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: { flex: 1, gap: 2 },
  statNumber: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, lineHeight: 20, color: colors.neutral.white },
  statLabel: {
    fontFamily: 'DMSans_400Regular', fontSize: 10, lineHeight: 16, letterSpacing: 0.6,
    textTransform: 'uppercase', color: colors.text.light,
  },

  /* ═══ FORM ═══ */
  mainContent: {
    backgroundColor: colors.neutral.bg,
    paddingTop: 24, paddingHorizontal: 24, paddingBottom: 40,
  },
  sectionTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, lineHeight: 38.4, color: colors.text.primary },
  sectionSubtitle: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20.8, color: colors.text.secondary,
    marginTop: 2, marginBottom: 20,
  },

  tabBar: {
    flexDirection: 'row', backgroundColor: '#e8e0d0', borderRadius: 12, padding: 3,
    marginBottom: 20, height: 47,
  },
  tab: { flex: 1, borderRadius: 8, justifyContent: 'center' },
  tabActive: {
    backgroundColor: colors.neutral.white,
    shadowColor: 'rgba(26,39,68,0.08)', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 1.5, elevation: 2,
  },
  tabInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tabText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: colors.text.secondary },
  tabTextActive: { color: colors.brand.navy },

  fieldLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20.8, color: colors.text.primary,
    marginBottom: 8, marginTop: 20,
  },
  fieldLabelAsterisk: { color: colors.brand.gold },
  inputNoMargin: { marginBottom: 0 },
  passwordRow: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 16, top: 14,
    width: 26, height: 26, alignItems: 'center', justifyContent: 'center',
  },

  optionsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkboxBox: {
    width: 16, height: 16, borderWidth: 1, borderColor: colors.neutral.border,
    borderRadius: 3, backgroundColor: colors.neutral.white, alignItems: 'center', justifyContent: 'center',
  },
  checkboxBoxChecked: { backgroundColor: colors.brand.navy, borderColor: colors.brand.navy },
  checkboxCheck: { color: colors.neutral.white, fontSize: 10, fontWeight: '700' },
  checkboxLabel: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20.8, color: colors.text.secondary },
  forgotLink: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20.8, color: colors.text.primary },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.neutral.border },
  dividerText: {
    fontFamily: 'DMSans_500Medium', fontSize: 11, lineHeight: 17.6, letterSpacing: 0.88,
    textTransform: 'uppercase', color: colors.text.secondary, marginHorizontal: 16,
  },

  registerRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginBottom: 24,
  },
  registerText: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20.8, color: colors.text.secondary },
  registerLinkText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 13, lineHeight: 20.8, color: colors.brand.navy,
    borderBottomWidth: 1.5, borderBottomColor: colors.brand.gold, paddingBottom: 1.5,
  },

  securityNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  securityText: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 17.6, color: colors.text.secondary },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    lineHeight: 20.8,
    color: colors.neutral.white,
  },
});
