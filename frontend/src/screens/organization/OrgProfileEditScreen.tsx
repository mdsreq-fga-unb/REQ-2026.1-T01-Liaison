import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import PasswordChangeSection from '../../components/profile/PasswordChangeSection';
import { colors } from '../../theme/colors';
import { radius, shadows, spacing } from '../../theme/spacing';
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

const AREA_LABELS: Record<string, string> = {};
INTERESSE_OPTIONS.forEach((opt) => { AREA_LABELS[opt.id] = opt.label; });

export default function OrgProfileEditScreen() {
  const navigation = useNavigation<any>();
  const { accessToken, tryRefreshSession } = useAuth();

  const [profile, setProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [mission, setMission] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [site, setSite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [areasDeAtuacao, setAreasDeAtuacao] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<OrgGalleryPhoto[]>([]);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getOrgProfile(accessToken);
      setProfile(data);
      setNomeFantasia(data.nome_fantasia || '');
      setRazaoSocial(data.razao_social || '');
      setTelefone(data.telefone || '');
      setNomeResponsavel(data.nome_responsavel || '');
      setMission(data.mission || '');
      setFullDescription(data.full_description || '');
      setSite(data.site || '');
      setEndereco(data.endereco || '');
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

  useEffect(() => { loadProfile(); }, [loadProfile]);

  function toggleArea(areaId: string) {
    setAreasDeAtuacao((prev) =>
      prev.includes(areaId) ? prev.filter((a) => a !== areaId) : [...prev, areaId]
    );
  }

  async function handleSave() {
    if (!accessToken) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);
    try {
      const payload: Partial<OrgProfileData> = {
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        telefone,
        nome_responsavel: nomeResponsavel,
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
      setErrorMessage(e?.data?.detail || 'Erro ao salvar perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  async function pickAndUploadLogo() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const file: UploadFile = {
        uri: asset.uri, name: asset.fileName || 'logo.jpg',
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const file: UploadFile = {
        uri: asset.uri, name: asset.fileName || 'banner.jpg',
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
        allowsMultipleSelection: true,
      });
      if (result.canceled || !result.assets?.length) return;
      const files: UploadFile[] = result.assets.map((a) => ({
        uri: a.uri, name: a.fileName || 'gallery.jpg',
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

  async function handleDeletePhoto(photoId: string) {
    Alert.alert('Remover foto', 'Tem certeza que deseja remover esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          testID="org-edit-back-button"
        >
          <Ionicons name="arrow-back" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
          testID="org-edit-save-button"
        >
          <Text style={styles.saveButtonText}>{isSaving ? '...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Messages */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}
        {successMessage ? (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>{successMessage}</Text>
          </View>
        ) : null}

        {/* Logo Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickAndUploadLogo} disabled={isUploadingImage}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
                <Text style={styles.uploadHint}>Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.sectionLabel}>Logo da Organização</Text>
        </View>

        {/* Banner Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickAndUploadBanner} disabled={isUploadingImage}>
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.bannerPreview} />
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
                <Text style={styles.uploadHint}>Banner</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.sectionLabel}>Banner</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Nome Fantasia</Text>
          <TextInput style={styles.input} value={nomeFantasia} onChangeText={setNomeFantasia} placeholder="Nome fantasia" placeholderTextColor={colors.text.secondary} />

          <Text style={styles.fieldLabel}>Razão Social</Text>
          <TextInput style={styles.input} value={razaoSocial} onChangeText={setRazaoSocial} placeholder="Razão social" placeholderTextColor={colors.text.secondary} />

          <Text style={styles.fieldLabel}>CNPJ</Text>
          <TextInput style={[styles.input, styles.inputReadonly]} value={profile.cnpj} editable={false} placeholderTextColor={colors.text.secondary} />

          <Text style={styles.fieldLabel}>Telefone</Text>
          <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(XX) XXXXX-XXXX" placeholderTextColor={colors.text.secondary} keyboardType="phone-pad" />

          <Text style={styles.fieldLabel}>Nome do Responsável</Text>
          <TextInput style={styles.input} value={nomeResponsavel} onChangeText={setNomeResponsavel} placeholder="Nome do responsável" placeholderTextColor={colors.text.secondary} />

          <Text style={styles.fieldLabel}>Missão</Text>
          <TextInput style={[styles.input, styles.textArea]} value={mission} onChangeText={setMission} placeholder="Missão da organização (máx. 300 caracteres)" placeholderTextColor={colors.text.secondary} multiline maxLength={300} />

          <Text style={styles.fieldLabel}>Descrição Completa</Text>
          <TextInput style={[styles.input, styles.textArea]} value={fullDescription} onChangeText={setFullDescription} placeholder="Descrição detalhada (máx. 2000 caracteres)" placeholderTextColor={colors.text.secondary} multiline maxLength={2000} />

          <Text style={styles.fieldLabel}>Site</Text>
          <TextInput style={styles.input} value={site} onChangeText={setSite} placeholder="https://..." placeholderTextColor={colors.text.secondary} keyboardType="url" autoCapitalize="none" />

          <Text style={styles.fieldLabel}>Endereço</Text>
          <TextInput style={[styles.input, styles.textArea]} value={endereco} onChangeText={setEndereco} placeholder="Endereço completo" placeholderTextColor={colors.text.secondary} multiline maxLength={300} />

          {/* Áreas de Atuação */}
          <Text style={styles.fieldLabel}>Áreas de Atuação</Text>
          <View style={styles.areasRow}>
            {INTERESSE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.areaChip,
                  areasDeAtuacao.includes(opt.id) && styles.areaChipSelected,
                ]}
                onPress={() => toggleArea(opt.id)}
                testID={`area-${opt.id}`}
              >
                <Text style={[
                  styles.areaChipText,
                  areasDeAtuacao.includes(opt.id) && styles.areaChipTextSelected,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.formCard}>
          <Text style={styles.sectionLabel}>Galeria</Text>
          <TouchableOpacity
            style={styles.addGalleryButton}
            onPress={pickAndUploadGallery}
            disabled={isUploadingImage}
            testID="add-gallery-button"
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.brand.navy} />
            <Text style={styles.addGalleryText}>Adicionar Fotos</Text>
          </TouchableOpacity>
          {gallery.length > 0 && (
            <GalleryGrid
              photos={gallery.map((p) => ({ uri: p.image_url, id: p.id }))}
              onPhotoPress={(uri) => { setViewerUrl(uri); setViewerVisible(true); }}
              onDeletePhoto={handleDeletePhoto}
            />
          )}
        </View>

        {/* Change Password */}
        <View style={styles.formCard}>
          <PasswordChangeSection
            onChangePassword={async (newPw, confirmPw) => {
              await changeOrgPassword(accessToken!, newPw, confirmPw);
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.neutral.bg },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.neutral.bg,
  },
  loadingText: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm },
  header: {
    backgroundColor: colors.brand.navy, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: { padding: 4 },
  headerTitle: { ...typography.h3, color: colors.neutral.white, flex: 1, textAlign: 'center' },
  saveButton: { paddingHorizontal: 12, paddingVertical: 6 },
  saveButtonText: { ...typography.button, color: colors.brand.gold },
  scrollContent: { paddingBottom: 40 },
  errorBanner: {
    backgroundColor: '#d32f2f', marginHorizontal: 16, marginTop: 16,
    padding: 12, borderRadius: radius.md,
  },
  errorBannerText: { color: colors.neutral.white, ...typography.body },
  successBanner: {
    backgroundColor: '#2e7d32', marginHorizontal: 16, marginTop: 16,
    padding: 12, borderRadius: radius.md,
  },
  successBannerText: { color: colors.neutral.white, ...typography.body },
  imageSection: { alignItems: 'center', marginTop: 20 },
  logoPreview: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee' },
  logoPlaceholder: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
  },
  bannerPreview: { width: 320, height: 120, borderRadius: radius.md, backgroundColor: '#eee' },
  bannerPlaceholder: {
    width: 320, height: 120, borderRadius: radius.md, backgroundColor: '#eee',
    justifyContent: 'center', alignItems: 'center',
  },
  uploadHint: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  sectionLabel: {
    ...typography.subtitle, color: colors.text.primary, marginTop: 8, marginBottom: 4,
  },
  formCard: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: colors.neutral.white,
    borderRadius: radius.lg, padding: 20, ...shadows.sm,
  },
  fieldLabel: {
    ...typography.caption, color: colors.text.primary, marginTop: 16, marginBottom: 6,
  },
  input: {
    borderWidth: 1, borderColor: colors.neutral.border, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 10, ...typography.body, color: colors.text.primary,
    backgroundColor: colors.neutral.white,
  },
  inputReadonly: { backgroundColor: '#f5f5f5', color: colors.text.secondary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  areasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  areaChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: 'transparent',
  },
  areaChipSelected: { backgroundColor: colors.brand.navy, borderColor: colors.brand.navy },
  areaChipText: { ...typography.caption, color: colors.text.secondary },
  areaChipTextSelected: { color: colors.neutral.white },
  addGalleryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, justifyContent: 'center',
  },
  addGalleryText: { ...typography.button, color: colors.brand.navy },
});
