import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import RedefineLockIcon from '../../../assets/redefine_lock.svg';
// Importação do Pop-up (ajuste o caminho se necessário)
import CustomPopup from '../../components/ui/CostumPopup'; 

export default function NewPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- NOVOS ESTADOS PARA O POP-UP ---
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Captura os parâmetros mágicos que o React Navigation extraiu do link do e-mail
  const { uid, token } = route.params || {};

  // Função auxiliar para chamar o pop-up mais facilmente
  const showPopup = (title: string, message: string, type: 'success' | 'error') => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupVisible(true);
  };

  const handleResetPassword = async () => {
    // 1. Validações de Frontend usando o pop-up
    if (!password || !confirmPassword) {
      showPopup('Erro', 'Por favor, preencha os dois campos.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showPopup('Erro', 'As senhas não coincidem. Tente novamente.', 'error');
      return;
    }
    if (password.length < 8) {
      showPopup('Erro', 'A nova senha deve ter no mínimo 8 caracteres.', 'error');
      return;
    }
    if (!uid || !token) {
      showPopup('Erro', 'Link inválido ou expirado. Solicite a recuperação novamente.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const apiUrl = `${baseUrl}/users/password-reset-confirm/`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          uidb64: uid, 
          token: token, 
          new_password: password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Cenário 3: Sucesso
        showPopup(
          'Sucesso!', 
          'Sua senha foi redefinida com sucesso. Você já pode acessar sua conta.', 
          'success'
        );
      } else {
        // Cenário 4 e 5: Trata erros do backend (Token expirado ou senha igual à antiga)
        showPopup('Erro', data.error || 'Ocorreu um erro ao redefinir a senha.', 'error');
      }

    } catch (error) {
      console.error('Erro de conexão:', error);
      showPopup(
        'Erro de conexão',
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Função para fechar o pop-up
  const handleClosePopup = () => {
    setPopupVisible(false);
    // Se for o pop-up de sucesso, redireciona para o login ao clicar em OK
    if (popupType === 'success') {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <Feather name="arrow-left" size={20} color="#64748b" />
          <Text style={styles.backButtonText}>Voltar para o login</Text>
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <RedefineLockIcon width={64} height={64} />
          </View>
          <Text style={styles.heroLabel}>Segurança</Text>
          <Text style={styles.heroTitle}>Criar nova senha</Text>
          <Text style={styles.heroDescription}>
            Sua nova senha deve ser diferente da senha usada anteriormente e ter no mínimo 8 caracteres.
          </Text>
          <View style={styles.decorCircleLarge} />
          <View style={styles.decorCircleSmall} />
        </View>

        <View style={styles.contentSection}>
          
          {/* Campo: Nova Senha */}
          <Text style={styles.fieldLabel}>
            Nova senha <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo de 8 caracteres"
            placeholderTextColor="#94a3b8"
            secureTextEntry={true} // Esconde a senha
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          {/* Campo: Confirmar Senha */}
          <Text style={styles.fieldLabel}>
            Confirmar nova senha <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Repita a nova senha"
            placeholderTextColor="#94a3b8"
            secureTextEntry={true}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Text style={styles.helpText}>Certifique-se de que ambas as senhas estão iguais.</Text>

          <TouchableOpacity 
            style={[styles.sendButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.sendButtonText}>Salvar Nova Senha</Text>
                <Feather name="check" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Renderização do Pop-up Customizado */}
      <CustomPopup 
        visible={popupVisible}
        title={popupTitle}
        message={popupMessage}
        type={popupType}
        onClose={handleClosePopup}
      />
    </SafeAreaView>
  );
}

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
    overflow: 'hidden',
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
    paddingTop: 32,
    paddingBottom: 32,
  },
  fieldLabel: {
    color: '#1a2744',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
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
    color: '#1A2744',
    marginBottom: 16, 
    fontSize: 14,
  },
  helpText: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 32,
  },
  sendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A2744',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 8,
    fontFamily: 'DMSans_400Regular',
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