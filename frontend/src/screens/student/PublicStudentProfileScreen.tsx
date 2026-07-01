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
import { getStudentPublicProfile, ProfileData } from '../../services/api';

function isAuthError(e: unknown): e is { status: number } {
  return typeof e === 'object' && e !== null && 'status' in e && (e as any).status === 401;
}

export default function PublicStudentProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params ?? {};
  const { accessToken, tryRefreshSession } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const loadProfile = useCallback(async () => {
    if (!accessToken || !userId) return;
    try {
      setErrorMessage('');
      const data = await getStudentPublicProfile(accessToken, userId);
      setProfile(data);
    } catch (e) {
      if (isAuthError(e)) {
        const newToken = await tryRefreshSession();
        if (newToken) {
          try {
            const data = await getStudentPublicProfile(newToken, userId);
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
  }, [accessToken, userId, tryRefreshSession]);

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

  function formatTurno(turno: string | null): string {
    const map: Record<string, string> = {
      matutino: 'Matutino',
      vespertino: 'Vespertino',
      noturno: 'Noturno',
      integral: 'Integral',
    };
    return turno ? map[turno] || turno : '';
  }

  function formatSemestre(semestre: number | null): string {
    if (!semestre) return '';
    return `${semestre}º semestre`;
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

  const progressFraction = profile.stats.total_hours_required > 0
    ? Math.min(profile.stats.total_hours_completed / profile.stats.total_hours_required, 1)
    : 0;

  return (
    <View style={styles.root}>
      <OrgHeader
        eyebrow="Perfil do estudante"
        title="Perfil"
        onBack={() => navigation.goBack()}
        backTestID="public-profile-back-button"
      />

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

        {/* Avatar (overlapping banner) */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={styles.avatarOuter}
            onPress={() => {
              if (profile.avatar_url) {
                setViewerUrl(profile.avatar_url);
                setViewerVisible(true);
              }
            }}
            activeOpacity={profile.avatar_url ? 0.8 : 1}
            disabled={!profile.avatar_url}
            accessibilityLabel="Ver foto de perfil"
          >
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{getInitial(profile.nome)}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Share Button (top-right area) */}
        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={colors.brand.gold} />
        </TouchableOpacity>

        {/* ═══ White Card: Profile Info ═══ */}
        <View style={styles.card}>
          {/* Name */}
          <Text style={styles.name}>{profile.nome}</Text>

          {/* Course Info */}
          <Text style={styles.courseInfo}>
            {profile.curso} · {profile.universidade}
            {profile.semestre_atual ? ` · ${formatSemestre(profile.semestre_atual)}` : ''}
          </Text>

          {/* Badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>🎓</Text>
            <Text style={styles.badgeText}>Estudante</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Horas de extensão</Text>
              <Text style={styles.progressValue}>
                {profile.stats.total_hours_completed}h / {profile.stats.total_hours_required}h
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${progressFraction * 100}%` }]}
              />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.stats.total_hours_completed}h</Text>
              <Text style={styles.statLabel}>Horas de Extensão</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.stats.total_events}</Text>
              <Text style={styles.statLabel}>Eventos</Text>
            </View>
          </View>
        </View>

        {/* ═══ Biografia ═══ */}
        {profile.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Biografia</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        ) : null}

        {/* ═══ Áreas de Interesse ═══ */}
        {profile.interesses && profile.interesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Áreas de Interesse</Text>
            <View style={styles.chipsRow}>
              {profile.interesses.map((interesse) => (
                <View key={interesse} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {interesse.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ═══ Dados Acadêmicos ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Acadêmicos</Text>
          <View style={styles.academicRows}>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>Universidade</Text>
              <Text style={styles.academicValue}>{profile.universidade}</Text>
            </View>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>Curso</Text>
              <Text style={styles.academicValue}>{profile.curso}</Text>
            </View>
            <View style={styles.academicRow}>
              <Text style={styles.academicLabel}>Matrícula</Text>
              <Text style={styles.academicValue}>{profile.matricula}</Text>
            </View>
            {profile.semestre_atual && (
              <View style={styles.academicRow}>
                <Text style={styles.academicLabel}>Semestre</Text>
                <Text style={styles.academicValue}>{formatSemestre(profile.semestre_atual)}</Text>
              </View>
            )}
            {profile.turno && (
              <View style={styles.academicRow}>
                <Text style={styles.academicLabel}>Turno</Text>
                <Text style={styles.academicValue}>{formatTurno(profile.turno)}</Text>
              </View>
            )}
            {profile.ano_conclusao && (
              <View style={[styles.academicRow, styles.academicRowLast]}>
                <Text style={styles.academicLabel}>Ano conclusão</Text>
                <Text style={styles.academicValue}>{profile.ano_conclusao}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ═══ Galeria de Fotos ═══ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
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

        {/* ═══ Eventos Participados ═══ */}
        {profile.events && profile.events.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Eventos Participados</Text>
            {profile.events.map((event, index) => (
              <View key={index} style={styles.eventCard}>
                <View style={styles.eventThumbnail} />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventCategory}>
                    {event.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventMeta}>
                    {event.organization} · {event.date}
                  </Text>
                  <View style={styles.eventBadges}>
                    <View style={styles.eventStatusBadge}>
                      <Text style={styles.eventStatusText}>
                        {event.status === 'concluído' ? 'Concluído' : 'Em andamento'}
                      </Text>
                    </View>
                    <View style={styles.eventHoursBadge}>
                      <Text style={styles.eventHoursText}>{event.hours}h</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

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

  // ── Loading ──
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
    height: 168,
  },
  bannerImage: {
    width: '100%',
    height: 168,
  },
  bannerPlaceholder: {
    backgroundColor: '#2a3754',
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

  // ── Share Button ──
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // ── Card ──
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: 20,
    ...shadows.card,
  },
  name: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 22,
    color: colors.text.primary,
    textAlign: 'center',
  },
  courseInfo: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.accent.lightBg,
    borderWidth: 1,
    borderColor: colors.brand.gold,
    borderRadius: radius.round,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
  },
  badgeEmoji: {
    fontSize: 11,
    marginRight: 4,
  },
  badgeText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
  },

  // ── Progress ──
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
  },
  progressValue: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.text.primary,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.brand.gold,
    borderRadius: 3,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
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
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
  },
  bioText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.info,
    lineHeight: 22,
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
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: typography.label.fontFamily,
    fontSize: 13,
    color: colors.brand.gold,
  },

  // ── Academic ──
  academicRows: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    ...shadows.card,
  },
  academicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  academicRowLast: {
    borderBottomWidth: 0,
  },
  academicLabel: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
  },
  academicValue: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.text.primary,
  },

  // ── Events ──
  eventCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    ...shadows.card,
  },
  eventThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: colors.accent.lightBg,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventCategory: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
    marginBottom: 2,
  },
  eventTitle: {
    fontFamily: typography.button.fontFamily,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  eventMeta: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 12,
    color: colors.text.secondary,
  },
  eventBadges: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  eventStatusBadge: {
    backgroundColor: colors.accent.lightBg,
    borderRadius: radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.accent.subtleBorder,
  },
  eventStatusText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 10,
    color: colors.brand.gold,
  },
  eventHoursBadge: {
    backgroundColor: '#e8f5e9',
    borderRadius: radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  eventHoursText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 10,
    color: colors.success,
  },

  bottomSpacer: {
    height: 32,
  },
});
