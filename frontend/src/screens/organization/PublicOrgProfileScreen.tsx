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
import { useNavigation, useRoute } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import GalleryPreview from '../../components/profile/GalleryPreview';
import ImageViewer from '../../components/profile/ImageViewer';
import OrgHeader from '../../components/ui/OrgHeader';
import { colors } from '../../theme/colors';
import { radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getOrgPublicProfile, OrgProfileData } from '../../services/api';
import { INTERESSE_OPTIONS } from '../../constants/interests';

function isAuthError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 401;
}

const AREA_LABELS: Record<string, string> = {};
INTERESSE_OPTIONS.forEach((opt) => { AREA_LABELS[opt.id] = opt.label; });

export default function PublicOrgProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { orgId } = route.params ?? {};
  const { accessToken, tryRefreshSession } = useAuth();

  const [profile, setProfile] = useState<OrgProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const loadProfile = useCallback(async () => {
    if (!accessToken || !orgId) return;
    try {
      setErrorMessage('');
      const data = await getOrgPublicProfile(accessToken, orgId);
      setProfile(data);
    } catch (e) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            const data = await getOrgPublicProfile(newToken, orgId);
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
  }, [accessToken, orgId, tryRefreshSession]);

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
        <Text style={styles.errorBanner}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) return null;

  const displayName = profile.nome_fantasia || profile.razao_social;

  return (
    <View style={styles.root}>
      <OrgHeader
        eyebrow="Perfil da organização"
        title="Perfil"
        onBack={() => navigation.goBack()}
        backTestID="public-org-profile-back-button"
      />

      {/* ═══ SCROLLABLE: Profile Content ═══ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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

        {/* ═══ Profile Info Block (white, full-width) ═══ */}
        <View style={styles.profileBlock}>
          {/* Logo (overlapping banner, left-aligned) */}
          <View style={styles.logoRow}>
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
                  <Text style={styles.logoInitial}>{getInitial(displayName)}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={16} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.orgName}>{displayName}</Text>

          {/* Category / Razão Social subtitle */}
          {profile.nome_fantasia && profile.razao_social ? (
            <Text style={styles.orgCategory}>{profile.razao_social}</Text>
          ) : null}

          {/* Badges: Verified + Location */}
          <View style={styles.badgesRow}>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificada</Text>
            </View>
            {profile.endereco ? (
              <View style={styles.locationBadge}>
                <Text style={styles.locationText}>📍 {profile.endereco}</Text>
              </View>
            ) : null}
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
        </View>

        {/* ═══ Missão ═══ */}
        {(profile.mission || profile.full_description) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Missão</Text>
            {profile.mission ? (
              <View style={styles.missionBox}>
                <Text style={styles.missionBoxLabel}>NOSSA MISSÃO</Text>
                <Text style={styles.missionBoxText}>{`"${profile.mission}"`}</Text>
              </View>
            ) : null}
            {profile.full_description ? (
              <Text style={styles.descriptionText}>{profile.full_description}</Text>
            ) : null}
          </View>
        ) : null}

        {/* ═══ Áreas de Atuação ═══ */}
        {profile.areas_de_atuacao && profile.areas_de_atuacao.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Áreas de Atuação</Text>
            <View style={styles.chipsRow}>
              {profile.areas_de_atuacao.map((area) => (
                <View key={area} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {AREA_LABELS[area] || area.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ═══ Dados Institucionais ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Institucionais</Text>
          <View style={styles.infoRows}>
            {profile.razao_social ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Razão Social</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{profile.razao_social}</Text>
              </View>
            ) : null}
            {profile.nome_responsavel ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Responsável</Text>
                <Text style={styles.infoValue}>{profile.nome_responsavel}</Text>
              </View>
            ) : null}
            {profile.endereco ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Localização</Text>
                <Text style={styles.infoValue}>{profile.endereco}</Text>
              </View>
            ) : null}
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, styles.infoValueGreen]}>✓ Aprovada pela Liaison</Text>
            </View>
          </View>
        </View>

        {/* ═══ Contato ═══ */}
        {(profile.email || profile.telefone || profile.site) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contato</Text>
            <View style={styles.contactCards}>
              {profile.email ? (
                <View style={styles.contactCard}>
                  <View style={[styles.contactIconBox, { backgroundColor: colors.brand.navy }]}>
                    <Ionicons name="mail-outline" size={16} color={colors.neutral.white} />
                  </View>
                  <View style={styles.contactCardText}>
                    <Text style={styles.contactCardLabel}>E-MAIL</Text>
                    <Text style={styles.contactCardValue}>{profile.email}</Text>
                  </View>
                </View>
              ) : null}
              {profile.telefone ? (
                <View style={styles.contactCard}>
                  <View style={[styles.contactIconBox, { backgroundColor: colors.brand.navy }]}>
                    <Ionicons name="call-outline" size={16} color={colors.neutral.white} />
                  </View>
                  <View style={styles.contactCardText}>
                    <Text style={styles.contactCardLabel}>TELEFONE</Text>
                    <Text style={styles.contactCardValue}>{profile.telefone}</Text>
                  </View>
                </View>
              ) : null}
              {profile.site ? (
                <View style={styles.contactCard}>
                  <View style={[styles.contactIconBox, { backgroundColor: colors.brand.gold }]}>
                    <Ionicons name="globe-outline" size={16} color={colors.neutral.white} />
                  </View>
                  <View style={styles.contactCardText}>
                    <Text style={styles.contactCardLabel}>SITE</Text>
                    <Text style={[styles.contactCardValue, styles.contactCardLink]}>{profile.site}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* ═══ Galeria ═══ */}
        {profile.gallery && profile.gallery.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Álbum de Eventos</Text>
              <Text style={styles.sectionSubtext}>{profile.gallery.length} fotos</Text>
            </View>
            <GalleryPreview
              photos={profile.gallery}
              onPhotoPress={(photo) => {
                if (photo.image_url) {
                  setViewerUrl(photo.image_url);
                  setViewerVisible(true);
                }
              }}
            />
          </View>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

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

  // ── Loading / Error ──
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: 12,
  },
  errorBanner: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.brand.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.sm,
  },
  retryButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 15,
    color: colors.neutral.white,
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Banner ──
  bannerContainer: {
    width: '100%',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: 180,
  },
  bannerPlaceholder: {
    backgroundColor: '#1a2744',
  },

  // ── Profile Block ──
  profileBlock: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: -44,
    marginBottom: 8,
  },
  logoOuter: {
    width: 88,
    height: 88,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.neutral.white,
    overflow: 'hidden',
    ...shadows.card,
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
    fontFamily: typography.h1.fontFamily,
    fontSize: 28,
    color: colors.neutral.white,
    letterSpacing: 1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 52,
  },

  // ── Name / Category ──
  orgName: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 21,
    color: colors.text.primary,
    marginBottom: 4,
  },
  orgCategory: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 12,
  },

  // ── Badges ──
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(29,122,74,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(29,122,74,0.2)',
    borderRadius: radius.round,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  verifiedText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 11,
    color: '#1d7a4a',
  },
  locationBadge: {
    backgroundColor: 'rgba(26,39,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(26,39,68,0.15)',
    borderRadius: radius.round,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  locationText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 11,
    color: colors.brand.navy,
  },

  // ── CTA Row ──
  ctaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: colors.brand.navy,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 14,
    color: colors.neutral.white,
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.neutral.border,
  },

  // ── Sections ──
  section: {
    marginTop: 2,
    backgroundColor: colors.neutral.white,
    padding: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  sectionSubtext: {
    fontFamily: typography.body.fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
  },

  // ── Mission ──
  missionBox: {
    backgroundColor: '#fdf5ec',
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.2)',
    borderRadius: 10,
    padding: 17,
    marginBottom: 16,
  },
  missionBoxLabel: {
    fontFamily: typography.button.fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  missionBoxText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#3a4560',
    lineHeight: 22,
  },
  descriptionText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: '#3a4560',
    lineHeight: 23,
  },

  // ── Chips ──
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.accent.lightBg,
    borderWidth: 1,
    borderColor: colors.brand.gold,
    borderRadius: radius.round,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  chipText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.brand.gold,
  },

  // ── Dados Institucionais ──
  infoRows: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    flexShrink: 0,
  },
  infoValue: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  infoValueGreen: {
    color: '#1d7a4a',
  },

  // ── Contact Cards ──
  contactCards: {
    gap: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: colors.neutral.bg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
  },
  contactIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contactCardText: {
    flex: 1,
  },
  contactCardLabel: {
    fontFamily: typography.button.fontFamily,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  contactCardValue: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.text.primary,
  },
  contactCardLink: {
    color: colors.brand.gold,
  },

  // ── Bottom Spacer ──
  bottomSpacer: {
    height: 32,
  },
});
