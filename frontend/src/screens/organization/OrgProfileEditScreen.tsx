import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useAuth } from '../../context/AuthContext';
import GalleryGrid from '../../components/profile/GalleryGrid';
import ImageViewer from '../../components/profile/ImageViewer';
import OrgHeader from '../../components/ui/OrgHeader';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  getOrgProfile,
  updateOrgProfile,
  uploadOrgLogo,
  uploadOrgBanner,
  uploadOrgGallery,
  deleteOrgGalleryPhoto,
  changeOrgPassword,
  OrgProfileData,
  OrgGalleryPhoto,
  UploadFile,
} from '../../services/api';
import { INTERESSE_OPTIONS } from '../../constants/interests';

function isAuthError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 401;
}

const AREA_EMOJIS: Record<string, string> = {
  saude: '🏥',
  educacao: '📚',
  tecnologia: '💻',
  meio_ambiente: '🌿',
  assistencia_social: '🤝',
  arte_cultura: '🎨',
};

export default function OrgProfileEditScreen() {
  const navigation = useNavigation<any>();
  const { accessToken, tryRefreshSession } = useAuth();

  const [profile, setProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [site, setSite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [mission, setMission] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [areasDeAtuacao, setAreasDeAtuacao] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<OrgGalleryPhoto[]>([]);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // ImageViewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getOrgProfile(accessToken);
      setProfile(data);
      setRazaoSocial(data.razao_social || '');
      setNomeFantasia(data.nome_fantasia || '');
      setNomeResponsavel(data.nome_responsavel || '');
      setEmail(data.email || '');
      setTelefone(data.telefone || '');
      setSite(data.site || '');
      setEndereco(data.endereco || '');
      setMission(data.mission || '');
      setFullDescription(data.full_description || '');
      setAreasDeAtuacao(data.areas_de_atuacao || []);
      setLogoUrl(data.logo_url);
      setBannerUrl(data.banner_url);
      setGallery(data.gallery || []);
    } catch (e) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            const freshData = await getOrgProfile(newToken);
            setProfile(freshData);
            return;
          } catch {}
        }
      }
      setErrorMessage('Não foi possível carregar o perfil.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, tryRefreshSession]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Area Toggle ──
  function toggleArea(areaId: string) {
    setAreasDeAtuacao((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]
    );
  }

  // ── Save Handler ──
  async function handleSave() {
    if (!accessToken) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);
    try {
      const payload: Partial<OrgProfileData> = {
        razao_social: razaoSocial,
        nome_fantasia: nomeFantasia,
        nome_responsavel: nomeResponsavel,
        telefone,
        mission,
        full_description: fullDescription,
        areas_de_atuacao: areasDeAtuacao,
        site,
        endereco,
      };
      const updated = await updateOrgProfile(accessToken, payload);
      setProfile(updated);
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (e: any) {
      if (e.data && typeof e.data === 'object') {
        const messages = Object.values(e.data).flat().join('\n');
        setErrorMessage(messages || 'Erro ao salvar perfil. Tente novamente.');
      } else {
        setErrorMessage('Erro ao salvar perfil. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  // ── Image Picker Handlers ──
  async function pickAndUploadLogo() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const file: UploadFile = {
        uri: asset.uri,
        name: asset.fileName || 'logo.jpg',
        type: asset.mimeType || 'image/jpeg',
      };
      setIsUploadingImage(true);
      const res = await uploadOrgLogo(accessToken!, file);
      setLogoUrl(res.logo_url);
      setSuccessMessage('Logo atualizada!');
    } catch (e: any) {
      setErrorMessage(e?.data?.detail || 'Erro ao fazer upload da logo.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function pickAndUploadBanner() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 5],
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const file: UploadFile = {
        uri: asset.uri,
        name: asset.fileName || 'banner.jpg',
        type: asset.mimeType || 'image/jpeg',
      };
      setIsUploadingImage(true);
      const res = await uploadOrgBanner(accessToken!, file);
      setBannerUrl(res.banner_url);
      setSuccessMessage('Banner atualizado!');
    } catch (e: any) {
      setErrorMessage(e?.data?.detail || 'Erro ao fazer upload do banner.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function pickAndUploadGallery() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const files: UploadFile[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || 'gallery.jpg',
        type: a.mimeType || 'image/jpeg',
      }));
      setIsUploadingImage(true);
      const newPhotos = await uploadOrgGallery(accessToken!, files);
      setGallery((prev) => [...prev, ...newPhotos]);
      setSuccessMessage('Fotos adicionadas à galeria!');
    } catch (e: any) {
      setErrorMessage(e?.data?.detail || 'Erro ao fazer upload.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleDeleteGalleryPhoto(photoId: string) {
    if (Platform.OS === 'web') {
      if (!window.confirm('Tem certeza que deseja remover esta foto?')) return;
      try {
        await deleteOrgGalleryPhoto(accessToken!, photoId);
        setGallery((prev) => prev.filter((p) => p.id !== photoId));
      } catch {
        setErrorMessage('Erro ao remover foto.');
      }
      return;
    }
    Alert.alert('Remover foto', 'Tem certeza que deseja remover esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOrgGalleryPhoto(accessToken!, photoId);
            setGallery((prev) => prev.filter((p) => p.id !== photoId));
          } catch {
            setErrorMessage('Erro ao remover foto.');
          }
        },
      },
    ]);
  }

  // ── Password Handler ──
  async function handleChangePassword() {
    setPasswordError('');
    setPasswordSuccess('');
    if (!newPassword) {
      setPasswordError('A nova senha é obrigatória.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    if (!accessToken) return;
    setIsSavingPassword(true);
    try {
      const result = await changeOrgPassword(accessToken, newPassword, confirmPassword);
      setPasswordSuccess(result.detail || 'Senha alterada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      if (e.data && typeof e.data === 'object') {
        const messages = Object.values(e.data).flat().join('\n');
        setPasswordError(messages || 'Erro ao alterar a senha. Tente novamente.');
      } else {
        setPasswordError('Erro ao alterar a senha. Tente novamente.');
      }
    } finally {
      setIsSavingPassword(false);
    }
  }

  function getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // ── Loading State ──
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.gold} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.root}>
      <OrgHeader
        eyebrow="Perfil da organização"
        title="Editar"
        accent="perfil"
        onBack={() => navigation.goBack()}
        backIcon="close"
        backTestID="org-edit-back-button"
        right={
          <TouchableOpacity
            testID="org-edit-save-button"
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        }
      />

      {/* ═══ SCROLLABLE: Edit Content ═══ */}
      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={90}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        {/* Success / Error Messages */}
        {successMessage ? (
          <View style={styles.successBanner} testID="org-edit-success-message">
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        {errorMessage ? (
          <View style={styles.errorBannerView} testID="org-edit-error-message">
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ═══ Banner Section ═══ */}
        <TouchableOpacity
          testID="org-edit-banner-section"
          style={styles.bannerContainer}
          onPress={pickAndUploadBanner}
          activeOpacity={0.8}
          disabled={isUploadingImage}
          accessibilityLabel="Alterar banner"
        >
          {bannerUrl ? (
            <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.bannerPlaceholder]} />
          )}
          <View style={styles.bannerOverlay}>
            <Ionicons name="camera" size={20} color={colors.neutral.white} />
            <Text style={styles.bannerOverlayText}>Alterar banner</Text>
          </View>

          {/* Logo (overlapping banner bottom, left-aligned) */}
          <TouchableOpacity
            testID="org-edit-logo-section"
            style={styles.logoOuter}
            onPress={(e) => {
              e.stopPropagation();
              pickAndUploadLogo();
            }}
            activeOpacity={0.8}
            disabled={isUploadingImage}
            accessibilityLabel="Alterar logo"
          >
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoInitial}>{getInitial(nomeFantasia || razaoSocial || '?')}</Text>
              </View>
            )}
            <View style={styles.logoCameraOverlay}>
              <Ionicons name="camera" size={14} color={colors.neutral.white} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Help text */}
        <Text style={styles.helpText}>
          Banner: 1200×400px recomendado · Logo: 512×512px · JPEG ou PNG · máx. 5MB
        </Text>

        {/* ═══ Dados Cadastrais ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <Ionicons name="business-outline" size={16} color={colors.brand.gold} />
            </View>
            <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
          </View>

          {/* Info box */}
          <View style={styles.infoBanner}>
            <Ionicons name="eye-outline" size={16} color="#1d7a4a" style={styles.infoBannerIcon} />
            <Text style={styles.infoBannerText}>
              Os campos marcados com <Text style={styles.infoBannerBold}>👁 Público</Text> são exibidos aos estudantes nas páginas de vagas.
            </Text>
          </View>

          {/* Razão Social */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Razão Social</Text>
              <Text style={styles.fieldRequired}>obrigatório</Text>
            </View>
            <TextInput
              testID="org-edit-razao-social-input"
              style={styles.input}
              value={razaoSocial}
              onChangeText={setRazaoSocial}
              placeholder="Razão social"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* Nome Fantasia */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nome Fantasia</Text>
              <Text style={styles.fieldPublic}>👁 Público</Text>
            </View>
            <TextInput
              testID="org-edit-nome-fantasia-input"
              style={[styles.input, styles.inputActive]}
              value={nomeFantasia}
              onChangeText={setNomeFantasia}
              placeholder="Nome fantasia"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* CNPJ (readonly) */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>CNPJ</Text>
              <Text style={styles.fieldRequired}>obrigatório</Text>
            </View>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{profile.cnpj}</Text>
            </View>
            <Text style={styles.helperText}>
              CNPJ não pode ser alterado. Entre em contato com o suporte se necessário.
            </Text>
          </View>

          {/* Nome do Responsável */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nome do Responsável</Text>
              <Text style={styles.fieldRequired}>obrigatório</Text>
            </View>
            <TextInput
              testID="org-edit-nome-responsavel-input"
              style={styles.input}
              value={nomeResponsavel}
              onChangeText={setNomeResponsavel}
              placeholder="Nome do responsável"
              placeholderTextColor={colors.text.secondary}
            />
          </View>

          {/* E-mail de contato */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>E-mail de contato</Text>
              <Text style={styles.fieldPublic}>👁 Público</Text>
            </View>
            <TextInput
              testID="org-edit-email-input"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="contato@organização.org"
              placeholderTextColor={colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Telefone */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Telefone</Text>
              <Text style={styles.fieldPublic}>👁 Público</Text>
            </View>
            <TextInput
              testID="org-edit-telefone-input"
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(XX) XXXXX-XXXX"
              placeholderTextColor={colors.text.secondary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Site */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Site</Text>
              <Text style={styles.fieldOptional}>opcional</Text>
            </View>
            <TextInput
              testID="org-edit-site-input"
              style={styles.input}
              value={site}
              onChangeText={setSite}
              placeholder="www.organizacao.org.br"
              placeholderTextColor={colors.text.secondary}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Endereço */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Endereço</Text>
              <Text style={styles.fieldOptional}>opcional</Text>
            </View>
            <TextInput
              testID="org-edit-endereco-input"
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Endereço completo"
              placeholderTextColor={colors.text.secondary}
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* ═══ Missão & Descrição ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <Ionicons name="heart-outline" size={16} color={colors.brand.gold} />
            </View>
            <Text style={styles.sectionTitle}>Missão & Descrição</Text>
          </View>

          {/* Missão resumida */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Missão resumida</Text>
              <Text style={styles.fieldPublic}>👁 Público</Text>
            </View>
            <TextInput
              testID="org-edit-mission-input"
              style={[styles.input, styles.textArea, styles.inputActive]}
              value={mission}
              onChangeText={(text) => {
                if (text.length <= 200) setMission(text);
              }}
              placeholder="Descreva a missão da sua organização..."
              placeholderTextColor={colors.text.secondary}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.charCounterRow}>
              <Text style={styles.helperText}>Aparece nos cards de vagas. Seja conciso e inspirador.</Text>
              <Text style={styles.charCounter}>{mission.length} / 200</Text>
            </View>
          </View>

          {/* Descrição completa */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Descrição completa</Text>
              <Text style={styles.fieldOptional}>opcional</Text>
            </View>
            <TextInput
              testID="org-edit-description-input"
              style={[styles.input, styles.textArea]}
              value={fullDescription}
              onChangeText={(text) => {
                if (text.length <= 1000) setFullDescription(text);
              }}
              placeholder="Descrição detalhada da organização..."
              placeholderTextColor={colors.text.secondary}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCounter}>{fullDescription.length} / 1000</Text>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {/* ═══ Áreas de Atuação ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <Ionicons name="grid-outline" size={16} color={colors.brand.gold} />
            </View>
            <Text style={styles.sectionTitle}>Áreas de Atuação</Text>
          </View>
          <View style={styles.chipsRow}>
            {INTERESSE_OPTIONS.map((opt) => {
              const isSelected = areasDeAtuacao.includes(opt.id);
              const emoji = AREA_EMOJIS[opt.id] || '';
              return (
                <TouchableOpacity
                  key={opt.id}
                  testID={`area-chip-${opt.id}`}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    !isSelected && styles.chipUnselected,
                  ]}
                  onPress={() => toggleArea(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                      !isSelected && styles.chipTextUnselected,
                    ]}
                  >
                    {emoji} {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperText}>
            Selecione todas as áreas que representam a missão da sua organização
          </Text>
        </View>

        <View style={styles.sectionDivider} />

        {/* ═══ Galeria de Fotos ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <Ionicons name="images-outline" size={16} color={colors.brand.gold} />
            </View>
            <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
          </View>
          <GalleryGrid
            photos={gallery}
            editable
            onDelete={handleDeleteGalleryPhoto}
            onAdd={pickAndUploadGallery}
            onPhotoPress={(url) => {
              setViewerUrl(url);
              setViewerVisible(true);
            }}
          />
        </View>

        <View style={styles.sectionDivider} />

        {/* ═══ Segurança ═══ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconSquare}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.brand.gold} />
            </View>
            <Text style={styles.sectionTitle}>Segurança</Text>
          </View>

          {/* Nova Senha */}
          <View style={styles.fieldWrapper}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nova senha</Text>
              <Text style={styles.fieldOptional}>opcional</Text>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                testID="org-edit-new-password-input"
                style={[styles.input, styles.passwordInput]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={colors.text.secondary}
              />
              <TouchableOpacity
                testID="org-edit-toggle-new-password"
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Confirmar nova senha</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                testID="org-edit-confirm-password-input"
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Repita a nova senha"
                placeholderTextColor={colors.text.secondary}
              />
              <TouchableOpacity
                testID="org-edit-toggle-confirm-password"
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password feedback */}
          {passwordSuccess ? (
            <Text style={styles.passwordSuccessText} testID="org-edit-password-success">{passwordSuccess}</Text>
          ) : null}
          {passwordError ? (
            <Text style={styles.passwordErrorText} testID="org-edit-password-error">{passwordError}</Text>
          ) : null}

          {/* Change Password Button */}
          <TouchableOpacity
            testID="org-edit-change-password-button"
            style={[styles.changePasswordButton, isSavingPassword && styles.changePasswordButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isSavingPassword}
            activeOpacity={0.8}
          >
            {isSavingPassword ? (
              <ActivityIndicator color={colors.neutral.white} />
            ) : (
              <Text style={styles.changePasswordButtonText}>Alterar senha</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </KeyboardAwareScrollView>

      {/* ═══ Image Viewer Modal ═══ */}
      <ImageViewer
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  flex1: { flex: 1 },

  // ── Loading ──
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 12,
  },

  // ── Header ──
  saveButton: {
    backgroundColor: colors.brand.gold,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.round,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.neutral.white,
  },

  // ── Success / Error Banners ──
  successBanner: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  successText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#1d7a4a',
  },
  errorBannerView: {
    backgroundColor: '#fce4ec',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 2,
  },
  errorBannerText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#ef4444',
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 60,
  },

  // ── Banner ──
  bannerContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: 140,
  },
  bannerPlaceholder: {
    backgroundColor: '#1a2744',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bannerOverlayText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.neutral.white,
  },

  // ── Logo ──
  logoOuter: {
    position: 'absolute',
    left: 16,
    bottom: -30,
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.neutral.white,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    color: colors.neutral.white,
  },
  logoCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Help Text ──
  helpText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 44,
    marginBottom: 4,
    marginHorizontal: 20,
    textAlign: 'center',
  },

  // ── Sections ──
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    marginBottom: 20,
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
  sectionDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginHorizontal: 20,
    marginVertical: 24,
  },

  // ── Info Banner ──
  infoBanner: {
    backgroundColor: 'rgba(29,122,74,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(29,122,74,0.2)',
    borderRadius: 6,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoBannerIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: '#1d7a4a',
    lineHeight: 18,
  },
  infoBannerBold: {
    fontFamily: typography.button.fontFamily,
    fontSize: 12,
  },

  // ── Field Wrapper ──
  fieldWrapper: {
    marginBottom: spacing.formGap,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.labelGap,
  },
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.text.info,
  },
  fieldRequired: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
  },
  fieldPublic: {
    fontFamily: typography.label.fontFamily,
    fontSize: 11,
    color: '#1d7a4a',
  },
  fieldOptional: {
    fontFamily: typography.body.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
  },

  // ── Input ──
  input: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    paddingHorizontal: 16,
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
  },
  inputActive: {
    borderColor: colors.brand.gold,
    shadowColor: colors.brand.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  inputDisabled: {
    backgroundColor: '#f5f3ef',
    justifyContent: 'center',
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    paddingHorizontal: 16,
  },
  disabledText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  helperText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  charCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  charCounter: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },

  // ── Chips ──
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: radius.round,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.accent.lightBg,
    borderColor: colors.brand.gold,
  },
  chipUnselected: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.border,
  },
  chipText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.brand.gold,
  },
  chipTextUnselected: {
    color: colors.text.secondary,
  },

  // ── Password ──
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  passwordSuccessText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#1d7a4a',
    marginTop: 8,
  },
  passwordErrorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: '#ef4444',
    marginTop: 8,
  },
  changePasswordButton: {
    marginTop: 16,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePasswordButtonDisabled: {
    opacity: 0.6,
  },
  changePasswordButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 15,
    color: colors.neutral.white,
  },

  // ── Bottom Spacer ──
  bottomSpacer: {
    height: 32,
  },
});
