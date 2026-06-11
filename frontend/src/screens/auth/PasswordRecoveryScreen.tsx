import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import RedefineLockIcon from '../../../assets/redefine_lock.svg';

export default function PasswordRecoveryScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation<any>();

  const handlePasswordRecovery = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira seu e-mail institucional.');
      return;
    }
    
    // Aqui entra a chamada para a API (Backend)
    // Exemplo: await api.post('/auth/password-reset/', { email });
    
    // Alerta baseado no Cenário 1 e Cenário 2 (Mesma mensagem sempre)
    Alert.alert(
      'Solicitação enviada',
      'Se o e-mail estiver cadastrado, você receberá um link de redefinição.'
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#64748b" />
          <Text style={styles.backButtonText}>Voltar para o login</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
                <RedefineLockIcon width={64} height={64} />
            </View>
          <Text style={styles.heroLabel}>Acesso à conta</Text>
          <Text style={styles.heroTitle}>Recuperar minha senha</Text>
          <Text style={styles.heroDescription}>
            Digite seu e-mail institucional e enviaremos uma nova senha para você.
          </Text>
          <View style={styles.decorCircleLarge} />
          <View style={styles.decorCircleSmall} />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.fieldLabel}>
            E-mail institucional <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.edu.br"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.helpText}>Use o mesmo e-mail cadastrado na plataforma.</Text>

          <Text style={styles.sectionTitle}>Como funciona</Text>

          <Step
            number="1"
            text="A equipe do Liaison enviará sua nova senha por e-mail em até três dias úteis."
          />
          <Step number="2" text="Acesse sua conta com a nova senha recebida" />
          <Step
            number="3"
            text="Pronto! Você já pode navegar normalmente e trocar sua senha para a que preferir."
          />

          <TouchableOpacity style={styles.sendButton} onPress={handlePasswordRecovery}>
            <Text style={styles.sendButtonText}>Solicitar Nova Senha</Text>
            <Feather name="send" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Lembrou sua senha?     </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente auxiliar para a lista numerada
const Step = ({ number, text }: { number: string; text: string }) => (
  <View style={styles.stepRow}>
    <View style={styles.stepDot}>
      <Text style={styles.stepNumber}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  backButtonText: {
    marginLeft: 8,
    color: '#64748b',
    fontWeight: '500',
    fontSize: 14,
  },
  heroSection: {
    backgroundColor: '#1A2744',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  heroLabel: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    fontFamily: 'DMSans_400Regular',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#FAF8F4',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  fieldLabel: {
    color: '#1a2744',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
  },
  requiredAsterisk: {
    color: '#D4813A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    color: '#7A8299',
    marginBottom: 8,
    fontSize: 14,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#1A2744',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 8,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1A2744',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A2744',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 20,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 8,
    fontFamily: 'DMSans_400Regular',

  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#7A8299',
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  footerLink: {
    color: '#1A2744',
    fontWeight: '700',
    fontSize: 13,
    textDecorationLine: 'underline',
    textDecorationColor: '#D4813A',
  },

  iconContainer: {
    marginBottom: 24,
  },

  decorCircleLarge: {
    position: 'absolute', left: 300, top: -40,
    width: 140, height: 140, borderRadius: 70, borderWidth: 1.5, borderColor: 'rgba(212,129,58,0.15)',
  },
  decorCircleSmall: {
    position: 'absolute', left: 251, top: 31.59,
    width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
});
