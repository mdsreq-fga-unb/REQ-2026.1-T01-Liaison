import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Select from '../../components/ui/Select';
import { colors } from '../../theme/colors';
import { radius, shadows, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadAvatar,
  uploadBanner,
  uploadGalleryPhotos,
  deleteGalleryPhoto,
  ProfileData,
  GalleryPhoto,
} from '../../services/api';
import { INTERESSE_OPTIONS } from '../../constants/interests';

function isAuthError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 401;
}

const TURNO_OPTIONS = [
  { value: 'matutino', label: 'Matutino' },
  { value: 'vespertino', label: 'Vespertino' },
  { value: 'noturno', label: 'Noturno' },
  { value: 'integral', label: 'Integral' },
];

const UNIVERSIDADE_OPTIONS = [
  { label: 'UnB', value: 'unb' },
  { label: 'Outra', value: 'outra' },
];

const currentYear = new Date().getFullYear();
const ANO_CONCLUSAO_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  label: String(currentYear + i),
  value: String(currentYear + i),
}));

const SEMESTRE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}º semestre`,
  value: String(i + 1),
}));

export default function StudentProfileEditScreen() {
  const navigation = useNavigation<any>();
  const { accessToken, tryRefreshSession } = useAuth();

  // Profile data state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [universidade, setUniversidade] = useState('');
  const [curso, setCurso] = useState('');
  const [matricula, setMatricula] = useState('');
  const [semestreAtual, setSemestreAtual] = useState('');
  const [turno, setTurno] = useState('');
  const [anoConclusao, setAnoConclusao] = useState('');
  const [horasExigidas, setHorasExigidas] = useState('');
  const [bio, setBio] = useState('');
  const [interesses, setInteresses] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);

  // Select-based fields (mapped values)
  const [universidadeValue, setUniversidadeValue] = useState('outra');
  const [semestreValue, setSemestreValue] = useState<string | null>(null);
  const [anoConclusaoValue, setAnoConclusaoValue] = useState<string | null>(null);
  const [turnoValue, setTurnoValue] = useState<string | null>(null);

  // ImageViewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      setErrorMessage('');
      const data = await getStudentProfile(accessToken);
      setProfile(data);
      // Populate form fields — split full name into firstName/lastName
      const nomeParts = (data.nome || '').trim().split(' ');
      setFirstName(nomeParts[0] || '');
      setLastName(nomeParts.slice(1).join(' '));
      setUniversidade(data.universidade || '');
      // Map universidade to select value
      const uniLower = (data.universidade || '').toLowerCase();
      setUniversidadeValue(uniLower.includes('unb') ? 'unb' : 'outra');
      setCurso(data.curso || '');
      setMatricula(data.matricula || '');
      setSemestreAtual(data.semestre_atual ? String(data.semestre_atual) : '');
      setSemestreValue(data.semestre_atual ? String(data.semestre_atual) : null);
      setTurno(data.turno || '');
      setTurnoValue(data.turno || null);
      setAnoConclusao(data.ano_conclusao ? String(data.ano_conclusao) : '');
      setAnoConclusaoValue(data.ano_conclusao ? String(data.ano_conclusao) : null);
      setHorasExigidas(data.horas_extensao_exigidas ? String(data.horas_extensao_exigidas) : '');
      setBio(data.bio || '');
      setInteresses(data.interesses || []);
      setAvatarUrl(data.avatar_url);
      setBannerUrl(data.banner_url);
      setGallery(data.gallery || []);
    } catch (e) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            const data = await getStudentProfile(newToken);
            setProfile(data);
            return;
          } catch {
            setErrorMessage('Não foi possível carregar o perfil. Tente novamente.');
          }
        }
        return;
      }
      setErrorMessage('Não foi possível carregar o perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, tryRefreshSession]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ── Image Picker Handlers ──

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0 && accessToken) {
      const asset = result.assets[0];
      try {
        const uploaded = await uploadAvatar(accessToken, {
          uri: asset.uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        });
        setAvatarUrl(uploaded.avatar_url);
      } catch {
        Alert.alert('Erro', 'Não foi possível fazer upload do avatar.');
      }
    }
  }

  async function pickBanner() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 5],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0 && accessToken) {
      const asset = result.assets[0];
      try {
        const uploaded = await uploadBanner(accessToken, {
          uri: asset.uri,
          name: 'banner.jpg',
          type: 'image/jpeg',
        });
        setBannerUrl(uploaded.banner_url);
      } catch {
        Alert.alert('Erro', 'Não foi possível fazer upload do banner.');
      }
    }
  }

  async function handleAddGalleryPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0 && accessToken) {
      try {
        const files = result.assets.map((a) => ({
          uri: a.uri,
          name: `gallery_${Date.now()}.jpg`,
          type: 'image/jpeg',
        }));
        const uploaded = await uploadGalleryPhotos(accessToken, files);
        setGallery((prev) => [...prev, ...uploaded]);
      } catch {
        Alert.alert('Erro', 'Não foi possível adicionar fotos à galeria.');
      }
    }
  }

  async function handleDeleteGalleryPhoto(photoId: string) {
    if (!accessToken) return;
    Alert.alert('Remover foto', 'Tem certeza que deseja remover esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGalleryPhoto(accessToken, photoId);
            setGallery((prev) => prev.filter((p) => p.id !== photoId));
          } catch {
            Alert.alert('Erro', 'Não foi possível remover a foto.');
          }
        },
      },
    ]);
  }

  // ── Interest Toggle ──

  function toggleInteresse(id: string) {
    setInteresses((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  // ── Save Handler ──

  async function handleSave() {
    if (!accessToken) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    // Validação client-side: semestre_atual e ano_conclusao sao obrigatorios
    // (mirror do backend — exibimos erro amigavel antes de enviar request)
    if (!semestreValue) {
      setErrorMessage('Selecione o semestre atual.');
      setIsSaving(false);
      return;
    }
    if (!anoConclusaoValue) {
      setErrorMessage('Selecione o ano de conclusão.');
      setIsSaving(false);
      return;
    }

    const payload: Partial<ProfileData> = {
      nome: [firstName, lastName].filter(Boolean).join(' '),
      universidade: universidadeValue === 'unb' ? 'Universidade de Brasília (UnB)' : universidade,
      curso,
      matricula,
      semestre_atual: Number(semestreValue),
      turno: turnoValue,
      ano_conclusao: Number(anoConclusaoValue),
      horas_extensao_exigidas: horasExigidas ? Number(horasExigidas) : null,
      bio,
      interesses,
    };

    try {
      await updateStudentProfile(accessToken, payload);
      setSuccessMessage('Perfil atualizado com sucesso!');
      // Refresh the full profile
      await loadProfile();
    } catch (e: any) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            await updateStudentProfile(newToken, payload);
            setSuccessMessage('Perfil atualizado com sucesso!');
            await loadProfile();
          } catch {
            setErrorMessage('Erro ao salvar o perfil. Tente novamente.');
          }
        }
        return;
      }
      if (e.data && typeof e.data === 'object') {
        const messages = Object.values(e.data).flat().join('\n');
        setErrorMessage(messages || 'Erro ao salvar o perfil. Tente novamente.');
      } else {
        setErrorMessage('Erro ao salvar o perfil. Tente novamente.');
      }
    } finally {
      setIsSaving(false);
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
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Navy Header ═══ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          testID="edit-back-button"
        >
          <Ionicons name="close" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity
          testID="edit-save-button"
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
      </View>

      {/* ═══ SCROLLABLE: Edit Content ═══ */}
      <KeyboardAwareScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={90}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
          {/* Success/Error Messages */}
          {successMessage ? (
            <View style={styles.successBanner} testID="edit-success-message">
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          ) : null}
          {errorMessage ? (
            <View style={styles.errorBannerView} testID="edit-error-message">
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* ═══ Banner Section ═══ */}
          <TouchableOpacity
            testID="edit-banner-section"
            style={styles.bannerContainer}
            onPress={pickBanner}
            activeOpacity={0.8}
            accessibilityLabel="Alterar banner"
          >
            {bannerUrl ? (
              <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
            ) : (
              <View style={[styles.bannerImage, styles.bannerPlaceholder]} />
            )}
            <View style={styles.bannerBadges}>
              <TouchableOpacity
                testID="edit-banner-camera"
                style={styles.bannerCameraBadge}
                onPress={pickBanner}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={14} color={colors.neutral.white} />
              </TouchableOpacity>
              {bannerUrl ? (
                <TouchableOpacity
                  testID="edit-banner-view"
                  style={styles.bannerViewBadge}
                  onPress={() => {
                    setViewerUrl(bannerUrl);
                    setViewerVisible(true);
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel="Ver banner"
                >
                  <Ionicons name="eye-outline" size={14} color={colors.neutral.white} />
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* ═══ Avatar Section ═══ */}
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              testID="edit-avatar-section"
              style={styles.avatarOuter}
              onPress={pickAvatar}
              activeOpacity={0.8}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{getInitial(firstName || '?')}</Text>
                </View>
              )}
              <View style={styles.avatarCameraOverlay}>
                <Ionicons name="camera" size={14} color={colors.neutral.white} />
              </View>
            </TouchableOpacity>
            {avatarUrl ? (
              <TouchableOpacity
                testID="edit-avatar-view"
                style={styles.avatarViewBadge}
                onPress={() => {
                  setViewerUrl(avatarUrl);
                  setViewerVisible(true);
                }}
                activeOpacity={0.7}
                accessibilityLabel="Ver foto de perfil"
              >
                <Ionicons name="eye-outline" size={14} color={colors.brand.gold} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Help text */}
          <Text style={styles.helpText}>
            Toque nas imagens para alterar · JPEG ou PNG · máx. 5MB
          </Text>

          {/* ═══ Dados Pessoais ═══ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconSquare}>
                <Ionicons name="person-outline" size={18} color={colors.brand.gold} />
              </View>
              <Text style={styles.sectionTitle}>Dados Pessoais</Text>
            </View>

            {/* Nome */}
            <Text style={styles.label}>
              Nome <Text style={styles.fieldLabelAsterisk}>*</Text>
            </Text>
            <TextInput
              testID="edit-nome-input"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Seu nome"
              placeholderTextColor={colors.text.secondary}
            />

            {/* Sobrenome */}
            <Text style={styles.label}>
              Sobrenome <Text style={styles.fieldLabelAsterisk}>*</Text>
            </Text>
            <TextInput
              testID="edit-sobrenome-input"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Seu sobrenome"
              placeholderTextColor={colors.text.secondary}
            />

            {/* Email (disabled) */}
            <Text style={styles.label}>E-mail</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.disabledText}>{profile?.email || ''}</Text>
            </View>
            <Text style={styles.helperText}>O e-mail não pode ser alterado</Text>

            {/* Biografia */}
            <Text style={styles.label}>Biografia</Text>
            <TextInput
              testID="edit-bio-input"
              style={[styles.input, styles.textArea]}
              value={bio}
              onChangeText={(text) => {
                if (text.length <= 500) setBio(text);
              }}
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor={colors.text.secondary}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCounter}>{bio.length} / 500</Text>
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* ═══ Perfil Acadêmico ═══ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconSquare}>
                <Ionicons name="school-outline" size={18} color={colors.brand.gold} />
              </View>
              <Text style={styles.sectionTitle}>Perfil Acadêmico</Text>
            </View>

            {/* Universidade */}
            <Select
              label="Universidade"
              options={UNIVERSIDADE_OPTIONS}
              value={universidadeValue}
              onChange={setUniversidadeValue}
              placeholder="Selecione a universidade"
              required
              testID="edit-universidade-select"
            />

            {/* Curso */}
            <Text style={styles.label}>
              Curso <Text style={styles.fieldLabelAsterisk}>*</Text>
            </Text>
            <TextInput
              testID="edit-curso-input"
              style={styles.input}
              value={curso}
              onChangeText={setCurso}
              placeholder="Ex: Engenharia de Software"
              placeholderTextColor={colors.text.secondary}
            />

            {/* Matrícula */}
            <Text style={styles.label}>
              Matrícula <Text style={styles.fieldLabelAsterisk}>*</Text>
            </Text>
            <TextInput
              testID="edit-matricula-input"
              style={styles.input}
              value={matricula}
              onChangeText={setMatricula}
              placeholder="Número de matrícula"
              placeholderTextColor={colors.text.secondary}
            />

            {/* Semestre */}
            <Select
              label="Semestre atual"
              required
              options={SEMESTRE_OPTIONS}
              value={semestreValue}
              onChange={setSemestreValue}
              placeholder="Selecione o semestre"
              testID="edit-semestre-select"
            />

            {/* Turno — usa componente padrao <Select> (mesma UI dos demais) */}
            <Select
              label="Turno"
              required
              options={TURNO_OPTIONS}
              value={turnoValue}
              onChange={setTurnoValue}
              placeholder="Selecione o turno"
              testID="edit-turno-select"
            />

            {/* Ano Conclusão */}
            <Select
              label="Ano de conclusão"
              required
              options={ANO_CONCLUSAO_OPTIONS}
              value={anoConclusaoValue}
              onChange={setAnoConclusaoValue}
              placeholder="Selecione o ano"
              testID="edit-ano-conclusao-select"
            />

            {/* Horas Exigidas */}
            <Text style={styles.label}>
              Horas de extensão exigidas <Text style={styles.fieldLabelAsterisk}>*</Text>
            </Text>
            <TextInput
              testID="edit-horas-exigidas-input"
              style={styles.input}
              value={horasExigidas}
              onChangeText={setHorasExigidas}
              placeholder="Ex: 200"
              placeholderTextColor={colors.text.secondary}
              keyboardType="numeric"
            />
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* ═══ Áreas de Interesse ═══ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconSquare}>
                <Ionicons name="heart-outline" size={18} color={colors.brand.gold} />
              </View>
              <Text style={styles.sectionTitle}>Áreas de Interesse</Text>
            </View>
            <Text style={styles.helpTextChips}>
              Selecione até 3 categorias ({interesses.length}/3)
            </Text>
            <View style={styles.interestsGrid}>
              {INTERESSE_OPTIONS.map((opt) => {
                const isSelected = interesses.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    testID={`interesse-chip-${opt.id}`}
                    style={[
                      styles.interestCard,
                      isSelected && styles.interestCardSelected,
                    ]}
                    onPress={() => toggleInteresse(opt.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.interestCheckBadge}>
                        <Ionicons name="checkmark" size={12} color={colors.neutral.white} />
                      </View>
                    )}
                    <Ionicons
                      name={opt.icon}
                      size={28}
                      color={isSelected ? colors.brand.gold : colors.text.secondary}
                      style={{ opacity: isSelected ? 1 : 0.45 }}
                    />
                    <Text
                      style={[
                        styles.interestCardLabel,
                        isSelected && styles.interestCardLabelSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* ═══ Galeria de Fotos ═══ */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconSquare}>
                <Ionicons name="images-outline" size={18} color={colors.brand.gold} />
              </View>
              <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
            </View>
            <GalleryGrid
              photos={gallery}
              editable
              onDelete={handleDeleteGalleryPhoto}
              onAdd={handleAddGalleryPhotos}
              onPhotoPress={(url) => {
                setViewerUrl(url);
                setViewerVisible(true);
              }}
            />
          </View>

          {/* Section Divider */}
          <View style={styles.sectionDivider} />

          {/* ═══ Segurança ═══ */}
          <View style={styles.section}>
            <PasswordChangeSection />
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
  header: {
    backgroundColor: colors.brand.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: colors.neutral.white,
  },
  saveButton: {
    backgroundColor: colors.brand.gold,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.round,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.neutral.white,
  },

  // ── Success / Error ──
  successBanner: {
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  successText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.success,
  },
  errorBannerView: {
    backgroundColor: '#fce4ec',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
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
    backgroundColor: '#2a3754',
  },
  bannerCameraBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerViewBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  bannerBadges: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },

  // ── Avatar ──
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -44,
  },
  avatarOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.neutral.white,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 36,
    color: colors.neutral.white,
  },
  avatarCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarViewBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    borderWidth: 1.5,
    borderColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  // ── Help Text ──
  helpText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },

  // ── Sections ──
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
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
  sectionDivider: {
    height: 1,
    backgroundColor: colors.neutral.border,
    marginHorizontal: 20,
    marginVertical: 24,
  },

  // ── Label & Input ──
  label: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.text.info,
    marginBottom: spacing.labelGap,
  },
  fieldLabelAsterisk: {
    color: colors.brand.gold,
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
  },
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
    marginBottom: spacing.formGap,
  },
  inputDisabled: {
    backgroundColor: '#f5f3ef',
    justifyContent: 'center',
  },
  disabledText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
  },
  helperText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  charCounter: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },

  // ── Select / Dropdown (legacy custom — ainda referenciado por outros elementos) ──
  selectWrapper: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    marginBottom: spacing.formGap,
  },
  selectText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  selectPlaceholder: {
    color: colors.text.secondary,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: colors.neutral.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.accent.lightBg,
  },
  dropdownItemText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
  },
  dropdownItemTextSelected: {
    color: colors.brand.gold,
    fontFamily: typography.button.fontFamily,
  },

  // ── Interest Cards ──
  helpTextChips: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestCard: {
    width: '47%',
    backgroundColor: colors.neutral.bg,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  interestCardSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.gold,
  },
  interestCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  interestCardLabel: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  interestCardLabelSelected: {
    color: colors.neutral.white,
    fontFamily: typography.button.fontFamily,
  },

  // ── Bottom Spacer ──
  bottomSpacer: {
    height: 32,
  },
});
