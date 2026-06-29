import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../context/AuthContext';
import ImageViewer from '../../components/profile/ImageViewer';
import { createApplication } from '../../services/applications';
import {
  getOpportunity,
  saveOpportunity,
  unsaveOpportunity,
} from '../../services/opportunities';
import { API_BASE_URL } from '../../config/api';
import { categoryColor, colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { radius } from '../../theme/spacing';

const AREA_LABELS: Record<string, string> = {
  educacao: 'Educação',
  saude: 'Saúde',
  tecnologia: 'Tecnologia',
  meio_ambiente: 'Meio Ambiente',
  assistencia_social: 'Assistência Social',
  arte_cultura: 'Arte & Cultura',
  esporte: 'Esporte',
};

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  remoto: 'Remoto',
  hibrido: 'Híbrido',
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: 'ATIVA', color: colors.success },
  paused: { label: 'PAUSADA', color: colors.brand.gold },
  closed: { label: 'ENCERRADA', color: colors.text.secondary },
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface Organization {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  logo?: string | null;
  mission?: string;
  areas_de_atuacao?: string[];
}

interface OpportunityDetail {
  id: string;
  title: string;
  organization: Organization;
  area: string;
  description: string;
  workload_value: number;
  workload_unit: string;
  vacancies: number;
  modality: string;
  location: string;
  start_date: string;
  start_time: string;
  end_date: string | null;
  is_recurring: boolean;
  session_duration: string | null;
  schedule: ScheduleItem[];
  requirements: string[];
  accepts_any_course: boolean;
  preferred_courses: string[];
  status: string;
  featured: boolean;
  photos: { id: number; image: string }[];
  is_saved: boolean;
  applicants_count: number;
  already_applied: boolean;
}

function shortDate(value?: string | null): string {
  const p = value?.split('-');
  if (p?.length === 3) return `${parseInt(p[2], 10)} ${MONTHS[parseInt(p[1], 10) - 1]}`;
  return '';
}

function fullDate(value?: string | null): string {
  const p = value?.split('-');
  if (p?.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
  return '';
}

function sessionLabel(duration?: string | null): string {
  // DRF DurationField → "HH:MM:SS" (ou "D HH:MM:SS")
  if (!duration) return '';
  const m = duration.match(/(\d+):(\d{2}):(\d{2})$/);
  if (!m) return '';
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h && min) return `${h}h${min}/sessão`;
  if (h) return `${h}h/sessão`;
  if (min) return `${min}min/sessão`;
  return '';
}

interface ScheduleItem { id?: string; date?: string; description?: string }

function scheduleDesc(item: ScheduleItem | string): string {
  if (typeof item === 'string') return item;
  return item?.description ?? '';
}

export default function OpportunityDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params ?? {};
  const { accessToken, user, isAuthenticated } = useAuth();

  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getOpportunity(id, accessToken);
      setOpportunity(data);
      setIsSaved(data.is_saved);
      setApplied(data.already_applied);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!accessToken || !opportunity) return;
    const next = !isSaved;
    setIsSaved(next);
    try {
      if (next) await saveOpportunity(accessToken, opportunity.id);
      else await unsaveOpportunity(accessToken, opportunity.id);
    } catch {
      setIsSaved(!next);
    }
  };

  const handleShare = async () => {
    if (!opportunity) return;
    const url = `${API_BASE_URL}/opportunities/${opportunity.id}/`;
    try {
      await Share.share({
        message: `Confira esta oportunidade de voluntariado: ${opportunity.title}\n${url}`,
        url,
      });
    } catch {
      // cancelado
    }
  };

  const handleConfirmApply = async () => {
    if (!accessToken || !opportunity) return;
    setSubmitting(true);
    setApplyError('');
    try {
      await createApplication(accessToken, opportunity.id);
      setApplied(true);
      setConfirmVisible(false);
    } catch (e: any) {
      setApplyError(e?.message || 'Falha ao enviar candidatura');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  if (notFound || !opportunity) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.text.secondary} />
        <Text style={styles.notFoundText}>Vaga não encontrada</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accent = categoryColor(opportunity.area);
  const isOpen = opportunity.status === 'active';
  const isStudent = isAuthenticated && user?.role === 'estudante';
  const statusMeta = STATUS_META[opportunity.status] ?? STATUS_META.active;
  const remaining = Math.max(0, opportunity.vacancies - opportunity.applicants_count);
  const filledRatio = opportunity.vacancies > 0
    ? Math.min(1, opportunity.applicants_count / opportunity.vacancies)
    : 0;
  const orgName = opportunity.organization.nome_fantasia || opportunity.organization.razao_social;
  const period = opportunity.start_date
    ? `${shortDate(opportunity.start_date)}${opportunity.end_date ? ` — ${shortDate(opportunity.end_date)}` : ''}`
    : '';
  const sessLabel = sessionLabel(opportunity.session_duration);
  const courses = [
    ...(opportunity.accepts_any_course ? ['Qualquer curso'] : []),
    ...(opportunity.preferred_courses ?? []),
  ];

  // Cronograma = marcos definidos pela org no schedule ({date, description}).
  const timeline: { icon: any; label: string; text: string }[] = (opportunity.schedule ?? [])
    .filter((s) => s?.description || s?.date)
    .map((s, i, arr) => ({
      icon: i === 0 ? 'flag-outline' : i === arr.length - 1 ? 'checkmark-done-outline' : 'ellipse-outline',
      label: s.date ? fullDate(s.date) : `Etapa ${i + 1}`,
      text: scheduleDesc(s),
    }));
  if (timeline.length > 0) {
    timeline.push({
      icon: 'ribbon-outline',
      label: 'Ao concluir',
      text: 'Certificado digital de extensão emitido',
    });
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity testID="back-button" style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.brand.navy} />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity testID="share-button" style={styles.circleBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={18} color={colors.brand.navy} />
          </TouchableOpacity>
          {isStudent && (
            <TouchableOpacity testID="save-button" style={styles.circleBtn} onPress={handleSave}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={18}
                color={isSaved ? colors.brand.gold : colors.brand.navy}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero card */}
        <LinearGradient
          colors={[colors.header.gradientFrom, colors.header.gradientTo]}
          style={styles.hero}
        >
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: accent }]}>
              <Text style={styles.badgeText}>
                {(AREA_LABELS[opportunity.area] ?? opportunity.area).toUpperCase()}
              </Text>
            </View>
            {opportunity.featured && (
              <View style={[styles.badge, { backgroundColor: colors.brand.gold }]}>
                <Text style={styles.badgeText}>EM DESTAQUE</Text>
              </View>
            )}
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
              <Text style={styles.statusBadgeText}>{statusMeta.label}</Text>
            </View>
          </View>

          <Text style={styles.title}>{opportunity.title}</Text>

          <View style={styles.heroOrgRow}>
            {opportunity.organization.logo ? (
              <Image source={{ uri: opportunity.organization.logo }} style={styles.heroOrgLogo} />
            ) : (
              <View style={[styles.heroOrgLogo, styles.heroOrgLogoFallback]}>
                <Text style={styles.heroOrgInitial}>{orgName.charAt(0)}</Text>
              </View>
            )}
            <Text style={styles.heroOrgName}>{orgName}</Text>
          </View>

          <View style={styles.heroDivider} />

          {/* Info grid */}
          <View style={styles.infoGrid}>
            <InfoCard icon="time-outline" value={`${opportunity.workload_value}${opportunity.workload_unit}`} label="Carga horária" />
            {!!sessLabel && <InfoCard icon="hourglass-outline" value={sessLabel} label="Duração por encontro" />}
            {!!period && <InfoCard icon="calendar-outline" value={period} label="Período" />}
            {!!opportunity.start_time && (
              <InfoCard icon="time-outline" value={opportunity.start_time.slice(0, 5)} label="Horário de início" />
            )}
            <InfoCard
              icon="location-outline"
              value={MODALITY_LABELS[opportunity.modality] ?? opportunity.modality}
              label={opportunity.location || 'Local a definir'}
              full
            />
          </View>

          {/* Vacancies bar */}
          <View style={styles.vacRow}>
            <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.7)" />
            <View style={{ flex: 1 }}>
              <View style={styles.vacHeader}>
                <Text style={styles.vacFilled}>{opportunity.applicants_count} vagas preenchidas</Text>
                <Text style={styles.vacRemaining}>de {opportunity.vacancies} · {remaining} restantes</Text>
              </View>
              <View style={styles.vacTrack}>
                <View style={[styles.vacFill, { width: `${filledRatio * 100}%` }]} />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Fotos */}
        {opportunity.photos?.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Fotos da Atividade</Text>
              {opportunity.photos.length > 1 && (
                <View style={styles.swipeHint}>
                  <Ionicons name="swap-horizontal" size={14} color={colors.text.secondary} />
                  <Text style={styles.swipeHintText}>arraste para ver mais</Text>
                </View>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
              {opportunity.photos.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  testID={`photo-${p.id}`}
                  activeOpacity={0.9}
                  onPress={() => { setViewerUrl(p.image); setViewerVisible(true); }}
                >
                  <Image source={{ uri: p.image }} style={styles.photo} />
                  <View style={styles.expandBadge}>
                    <Ionicons name="expand-outline" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Sobre */}
        <Card title="Sobre a oportunidade">
          {opportunity.description
            ? opportunity.description.split('\n').filter(Boolean).map((para, i) => (
                <Text key={i} style={styles.paragraph}>{para}</Text>
              ))
            : <Text style={styles.paragraph}>Sem descrição.</Text>}
        </Card>

        {/* Requisitos */}
        {opportunity.requirements?.length > 0 && (
          <Card title="O que você precisa">
            {opportunity.requirements.map((r, i) => (
              <View key={i} style={styles.checkRow}>
                <Ionicons name="checkmark-circle" size={18} color={accent} />
                <Text style={styles.checkText}>{r}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Local & Horário */}
        <Card title="Local & Horário">
          {!!opportunity.location && (
            <DetailRow icon="location-outline" label="ENDEREÇO" value={opportunity.location} />
          )}
          {!!opportunity.start_time && (
            <DetailRow
              icon="time-outline"
              label="HORÁRIO DE INÍCIO"
              value={`${opportunity.start_time.slice(0, 5)}${sessLabel ? ` · ${sessLabel}` : ''}`}
            />
          )}
          {!!period && (
            <DetailRow
              icon="calendar-outline"
              label="PERÍODO"
              value={`${fullDate(opportunity.start_date)}${opportunity.end_date ? ` — ${fullDate(opportunity.end_date)}` : ''}`}
            />
          )}
          <DetailRow
            icon="navigate-outline"
            label="MODALIDADE"
            value={MODALITY_LABELS[opportunity.modality] ?? opportunity.modality}
          />
        </Card>

        {/* Público-alvo */}
        {courses.length > 0 && (
          <Card title="Público-alvo">
            <Text style={styles.cardSubtle}>Cursos preferenciais para esta vaga:</Text>
            <View style={styles.pillWrap}>
              {courses.map((c, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText}>{c}</Text>
                </View>
              ))}
            </View>
            {opportunity.accepts_any_course && (
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  <Text style={styles.tipStrong}>Dica: </Text>
                  Mesmo que seu curso não esteja listado, você pode se candidatar! A organização avalia cada candidatura individualmente.
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Cronograma (derivado de datas/sessões) */}
        {timeline.length > 1 && (
          <Card title="Cronograma">
            {timeline.map((step, i) => (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot}>
                    <Ionicons name={step.icon} size={15} color={colors.brand.gold} />
                  </View>
                  {i < timeline.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineLabel}>{step.label.toUpperCase()}</Text>
                  <Text style={styles.timelineText}>{step.text}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Organização */}
        <Card title="Organização">
          <View style={styles.orgCardRow}>
            {opportunity.organization.logo ? (
              <Image source={{ uri: opportunity.organization.logo }} style={styles.orgLogoLg} />
            ) : (
              <View style={[styles.orgLogoLg, styles.heroOrgLogoFallback]}>
                <Text style={styles.heroOrgInitial}>{orgName.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.orgNameLg}>{orgName}</Text>
              <Text style={styles.orgMetaLg}>{opportunity.organization.razao_social}</Text>
            </View>
          </View>
          {!!opportunity.organization.mission && (
            <Text style={styles.orgMission}>{opportunity.organization.mission}</Text>
          )}
        </Card>

        {/* Certificado de extensão (informativo) */}
        <LinearGradient
          colors={[colors.header.gradientFrom, colors.header.gradientTo]}
          style={styles.certCard}
        >
          <View style={styles.certIcon}>
            <Ionicons name="ribbon-outline" size={20} color={colors.brand.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>Certificado de Extensão Digital</Text>
            <Text style={styles.certText}>
              Ao completar a atividade, você recebe automaticamente um certificado rastreável
              com UUID único — válido para horas de extensão universitária.
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>

      <ImageViewer
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfoRow}>
          <Text style={styles.footerRemaining}>
            <Text style={styles.footerRemainingStrong}>{remaining} vagas</Text> restantes
          </Text>
          {!!opportunity.start_date && (
            <Text style={styles.footerDate}>Início {fullDate(opportunity.start_date)}</Text>
          )}
        </View>

        {!isOpen ? (
          <Text testID="closed-notice" style={styles.closedNotice}>
            Esta vaga não está mais aceitando candidaturas
          </Text>
        ) : applied ? (
          <View testID="applied-button" style={styles.ctaApplied}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.ctaAppliedText}>Candidatura enviada</Text>
          </View>
        ) : isStudent ? (
          <TouchableOpacity testID="apply-button" style={styles.cta} onPress={() => setConfirmVisible(true)}>
            <Text style={styles.ctaText}>Candidatar-me a esta vaga  →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="login-cta"
            style={[styles.cta, styles.ctaGold]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.ctaText}>Entrar para me candidatar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirm bottom sheet */}
      <Modal visible={confirmVisible} transparent animationType="slide" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Confirmar candidatura</Text>
            <Text style={styles.sheetSubtitle}>
              Revise antes de enviar. Você poderá cancelar enquanto estiver aguardando avaliação.
            </Text>

            <View style={styles.sheetOppCard}>
              {opportunity.organization.logo ? (
                <Image source={{ uri: opportunity.organization.logo }} style={styles.sheetLogo} />
              ) : (
                <View style={[styles.sheetLogo, styles.heroOrgLogoFallback]}>
                  <Text style={styles.heroOrgInitial}>{orgName.charAt(0)}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetOppTitle} numberOfLines={1}>{opportunity.title}</Text>
                <Text style={styles.sheetOppMeta} numberOfLines={1}>
                  {orgName}{opportunity.location ? ` · ${opportunity.location}` : ''}
                </Text>
              </View>
            </View>

            {!!applyError && <Text testID="apply-error" style={styles.sheetError}>{applyError}</Text>}

            <View style={styles.sheetActions}>
              <TouchableOpacity
                testID="cancel-apply"
                style={[styles.sheetBtn, styles.sheetBtnGhost]}
                onPress={() => setConfirmVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.sheetBtnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirm-apply"
                style={[styles.sheetBtn, styles.sheetBtnPrimary]}
                onPress={handleConfirmApply}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.ctaText}>Confirmar candidatura</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoCard({ icon, value, label, full }: { icon: any; value: string; label: string; full?: boolean }) {
  return (
    <View style={[styles.infoCard, full && styles.infoCardFull]}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.7)" style={{ marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
    </View>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.cardTitleRule} />
      {children}
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={colors.brand.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutral.bg, gap: 12, padding: 24,
  },
  notFoundText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 16, color: colors.text.secondary },
  backLink: { marginTop: 8 },
  backLinkText: { fontFamily: fontFamilies.dmSansSemiBold, color: colors.brand.navy, fontSize: 14 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.neutral.bg,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 15, color: colors.brand.navy },
  topRight: { flexDirection: 'row', gap: 10 },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral.white,
    borderWidth: 1, borderColor: colors.neutral.border,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingBottom: 24 },

  hero: {
    marginHorizontal: 16, borderRadius: radius.lg, padding: 18, gap: 14, overflow: 'hidden',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: radius.round, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 10, letterSpacing: 0.5, color: '#fff' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.round,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusBadgeText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 10, letterSpacing: 0.5, color: '#fff' },
  title: { fontFamily: fontFamilies.playfairBold, fontSize: 23, color: '#fff', lineHeight: 30 },
  heroOrgRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroOrgLogo: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)' },
  heroOrgLogoFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.category.educacao },
  heroOrgInitial: { fontFamily: fontFamilies.playfairBold, color: '#fff', fontSize: 14 },
  heroOrgName: { fontFamily: fontFamilies.dmSansMedium, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md, padding: 12, width: '47.5%',
  },
  infoCardFull: { width: '100%' },
  infoValue: { fontFamily: fontFamilies.dmSansBold, fontSize: 14, color: '#fff' },
  infoLabel: { fontFamily: fontFamilies.dmSansRegular, fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  vacRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: radius.md, padding: 12,
  },
  vacHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  vacFilled: { fontFamily: fontFamilies.dmSansBold, fontSize: 13, color: '#fff' },
  vacRemaining: { fontFamily: fontFamilies.dmSansRegular, fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  vacTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.round, overflow: 'hidden' },
  vacFill: { height: 5, backgroundColor: colors.brand.gold, borderRadius: radius.round },

  section: { paddingHorizontal: 16, marginTop: 22 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeaderTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 18, color: colors.text.primary },
  swipeHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  swipeHintText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 11, color: colors.text.secondary },
  photoRow: { gap: 12, paddingRight: 16 },
  photo: { width: 240, height: 165, borderRadius: radius.md, backgroundColor: colors.neutral.border },
  expandBadge: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },

  card: {
    marginHorizontal: 16, marginTop: 16, backgroundColor: colors.neutral.white,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.neutral.border, padding: 18,
  },
  cardTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 18, color: colors.text.primary },
  cardTitleRule: { height: 1, backgroundColor: colors.neutral.border, marginTop: 10, marginBottom: 14 },
  cardSubtle: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.secondary, marginBottom: 12 },
  paragraph: { fontFamily: fontFamilies.dmSansRegular, fontSize: 14, color: colors.text.info, lineHeight: 22, marginBottom: 10 },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  checkText: { flex: 1, fontFamily: fontFamilies.dmSansRegular, fontSize: 14, color: colors.text.info, lineHeight: 21 },

  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  detailIcon: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent.lightBg,
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: {
    fontFamily: fontFamilies.dmSansSemiBold, fontSize: 10, letterSpacing: 0.6,
    color: colors.brand.gold, marginBottom: 3,
  },
  detailValue: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 14, color: colors.text.primary, lineHeight: 20 },

  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: colors.neutral.bg, borderWidth: 1, borderColor: colors.neutral.border,
    borderRadius: radius.round, paddingHorizontal: 14, paddingVertical: 8,
  },
  pillText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.primary },
  tipBox: {
    marginTop: 14, backgroundColor: colors.accent.lightBg, borderLeftWidth: 3, borderLeftColor: colors.brand.gold,
    borderRadius: radius.sm, padding: 12,
  },
  tipText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.info, lineHeight: 19 },
  tipStrong: { fontFamily: fontFamilies.dmSansBold, color: colors.text.primary },

  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 32 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.brand.gold,
    backgroundColor: colors.accent.lightBg, alignItems: 'center', justifyContent: 'center',
  },
  timelineConnector: { flex: 1, width: 2, backgroundColor: colors.neutral.border, marginVertical: 2 },
  timelineBody: { flex: 1, paddingBottom: 18 },
  timelineLabel: {
    fontFamily: fontFamilies.dmSansSemiBold, fontSize: 10, letterSpacing: 0.6,
    color: colors.brand.gold, marginBottom: 3,
  },
  timelineText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 14, color: colors.text.primary, lineHeight: 20 },
  orgCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orgLogoLg: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.neutral.border },
  orgNameLg: { fontFamily: fontFamilies.dmSansBold, fontSize: 16, color: colors.text.primary },
  orgMetaLg: { fontFamily: fontFamilies.dmSansRegular, fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  orgMission: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.info, lineHeight: 20, marginTop: 14 },

  certCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg, padding: 18, overflow: 'hidden',
  },
  certIcon: {
    width: 40, height: 40, borderRadius: radius.sm, backgroundColor: 'rgba(212,129,58,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  certTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 15, color: '#fff', marginBottom: 6 },
  certText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 19 },

  footer: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: colors.neutral.border, backgroundColor: colors.neutral.white,
  },
  footerInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  footerRemaining: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.secondary },
  footerRemainingStrong: { fontFamily: fontFamilies.playfairBold, fontSize: 16, color: colors.text.primary },
  footerDate: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary },
  closedNotice: {
    textAlign: 'center', fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 14, color: colors.text.secondary, paddingVertical: 14,
    backgroundColor: colors.neutral.bg, borderRadius: radius.sm,
  },
  cta: {
    backgroundColor: colors.brand.navy, borderRadius: radius.sm,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center',
  },
  ctaGold: { backgroundColor: colors.brand.gold },
  ctaText: { fontFamily: fontFamilies.dmSansSemiBold, color: '#fff', fontSize: 15 },
  ctaApplied: {
    flexDirection: 'row', gap: 8, backgroundColor: '#eaf6ef',
    borderWidth: 1, borderColor: colors.success, borderRadius: radius.sm,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
  },
  ctaAppliedText: { fontFamily: fontFamilies.dmSansSemiBold, color: colors.success, fontSize: 15 },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: 20, paddingBottom: 32, gap: 14,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: colors.neutral.border, alignSelf: 'center',
  },
  sheetTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 20, color: colors.text.primary },
  sheetSubtitle: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  sheetOppCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.neutral.bg, borderRadius: radius.md, padding: 12,
  },
  sheetLogo: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.neutral.border },
  sheetOppTitle: { fontFamily: fontFamilies.dmSansBold, fontSize: 14, color: colors.text.primary },
  sheetOppMeta: { fontFamily: fontFamilies.dmSansRegular, fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  sheetError: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.category.assistencia_social },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  sheetBtn: { flex: 1, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  sheetBtnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.neutral.border },
  sheetBtnGhostText: { fontFamily: fontFamilies.dmSansSemiBold, color: colors.text.primary, fontSize: 15 },
  sheetBtnPrimary: { backgroundColor: colors.brand.navy },
});
