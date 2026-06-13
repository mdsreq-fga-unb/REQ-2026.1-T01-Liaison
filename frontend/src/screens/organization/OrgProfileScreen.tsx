import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import GalleryPreview from '../../components/profile/GalleryPreview';
import ImageViewer from '../../components/profile/ImageViewer';
import { colors } from '../../theme/colors';
import { radius, shadows, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  getOrgProfile,
  OrgProfileData,
} from '../../services/api';

function isAuthError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 401;
}

export default function OrgProfileScreen() {
  const navigation = useNavigation<any>();
  const { accessToken, tryRefreshSession, logout } = useAuth();

  const [profile, setProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      setErrorMessage('');
      const data = await getOrgProfile(accessToken);
      setProfile(data);
    } catch (e) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            const data = await getOrgProfile(newToken);
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
      setRefreshing(false);
    }
  }, [accessToken, tryRefreshSession]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleRefresh() {
    setRefreshing(true);
    loadProfile();
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

  // ── Error State ──
  if (errorMessage && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="information-circle" size={48} color={colors.text.secondary} />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Navy Header ═══ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          testID="org-profile-back-button"
        >
          <Ionicons name="arrow-back" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil Institucional</Text>
        <TouchableOpacity
          testID="org-profile-edit-button"
          style={styles.editButton}
          onPress={() => navigation.navigate('OrgProfileEdit')}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* ═══ SCROLLABLE: Profile Content ═══ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Banner */}
        <TouchableOpacity
          style={styles.bannerContainer}
          onPress={() => {
            if (profile.banner_url) {
              setViewerUrl(profile.banner_url);
              setViewerVisible(true);
            }
          }}
          activeOpacity={profile.banner_url ? 0.8 : 1}
          disabled={!profile.banner_url}
          accessibilityLabel="Ver banner"
        >
          {profile.banner_url ? (
            <Image source={{ uri: profile.banner_url }} style={styles.bannerImage} />
          ) : (
            <View style={[styles.bannerImage, styles.bannerPlaceholder]} />
          )}
        </TouchableOpacity>

        {/* Logo (overlapping banner) */}
        <View style={styles.logoWrapper}>
          <TouchableOpacity
            style={styles.logoOuter}
            onPress={() => {
              if (profile.logo_url) {
                setViewerUrl(profile.logo_url);
                setViewerVisible(true);
              }
            }}
            activeOpacity={profile.logo_url ? 0.8 : 1}
            disabled={!profile.logo_url}
            accessibilityLabel="Ver logo"
          >
            {profile.logo_url ? (
              <Image source={{ uri: profile.logo_url }} style={styles.logoImage} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoInitial}>{getInitial(profile.nome_fantasia || profile.razao_social)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ═══ White Card: Profile Info ═══ */}
        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.orgName}>{profile.nome_fantasia || profile.razao_social}</Text>
          {profile.nome_fantasia && (
            <Text style={styles.razaoSocial}>{profile.razao_social}</Text>
          )}

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🏢</Text>
            <Text style={styles.badgeText}>Organização</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.stats.total_events}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.stats.total_volunteers}</Text>
              <Text style={styles.statLabel}>Voluntários</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.stats.rating}</Text>
              <Text style={styles.statLabel}>Avaliação</Text>
            </View>
          </View>

          {/* Mission */}
          {profile.mission ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Missão</Text>
              <Text style={styles.sectionText}>{profile.mission}</Text>
            </View>
          ) : null}

          {/* Áreas de Atuação */}
          {profile.areas_de_atuacao && profile.areas_de_atuacao.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Áreas de Atuação</Text>
              <View style={styles.tagsRow}>
                {profile.areas_de_atuacao.map((area) => (
                  <View key={area} style={styles.tag}>
                    <Text style={styles.tagText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            {profile.telefone ? (
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>{profile.telefone}</Text>
              </View>
            ) : null}
            {profile.email ? (
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
            ) : null}
            {profile.site ? (
              <View style={styles.contactRow}>
                <Ionicons name="globe-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>{profile.site}</Text>
              </View>
            ) : null}
            {profile.endereco ? (
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.contactText}>{profile.endereco}</Text>
              </View>
            ) : null}
          </View>

          {/* Gallery */}
          {profile.gallery && profile.gallery.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Galeria</Text>
              <GalleryPreview
                photos={profile.gallery.map((p) => ({ uri: p.image_url, id: p.id }))}
                onPhotoPress={(uri) => {
                  setViewerUrl(uri);
                  setViewerVisible(true);
                }}
              />
            </View>
          )}

          {/* CNPJ (read-only info) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CNPJ</Text>
            <Text style={styles.sectionText}>{profile.cnpj}</Text>
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: colors.neutral.bg, padding: spacing.lg,
  },
  loadingText: {
    ...typography.body, color: colors.text.secondary, marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body, color: colors.text.secondary,
    textAlign: 'center', marginTop: spacing.md,
  },
  retryButton: {
    marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
    backgroundColor: colors.brand.navy, borderRadius: radius.md,
  },
  retryButtonText: { ...typography.button, color: colors.neutral.white },
  header: {
    backgroundColor: colors.brand.navy, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackButton: { padding: 4 },
  headerTitle: {
    ...typography.h3, color: colors.neutral.white, flex: 1, textAlign: 'center',
  },
  editButton: { paddingHorizontal: 12, paddingVertical: 6 },
  editButtonText: { ...typography.button, color: colors.brand.gold },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  bannerContainer: { height: 180 },
  bannerImage: { width: '100%', height: '100%' },
  bannerPlaceholder: { backgroundColor: '#e0d5c8' },
  logoWrapper: { alignItems: 'center', marginTop: -60 },
  logoOuter: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 4,
    borderColor: colors.neutral.white, overflow: 'hidden',
    backgroundColor: colors.neutral.white, ...shadows.sm,
  },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: {
    width: '100%', height: '100%', backgroundColor: colors.brand.gold,
    justifyContent: 'center', alignItems: 'center',
  },
  logoInitial: { ...typography.h2, color: colors.neutral.white },
  card: {
    marginHorizontal: 16, marginTop: 20, backgroundColor: colors.neutral.white,
    borderRadius: radius.lg, padding: 20, ...shadows.sm,
  },
  orgName: { ...typography.h2, color: colors.text.primary, textAlign: 'center' },
  razaoSocial: {
    ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: 4,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, gap: 6,
  },
  badgeEmoji: { fontSize: 16 },
  badgeText: { ...typography.caption, color: colors.text.secondary },
  statsRow: {
    flexDirection: 'row', marginTop: 20, paddingVertical: 16,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { ...typography.h3, color: colors.brand.navy },
  statLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#f0f0f0' },
  section: { marginTop: 20 },
  sectionTitle: {
    ...typography.subtitle, color: colors.text.primary, marginBottom: 8,
  },
  sectionText: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radius.full,
  },
  tagText: { ...typography.caption, color: colors.text.primary },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
  },
  contactText: { ...typography.body, color: colors.text.secondary },
});
