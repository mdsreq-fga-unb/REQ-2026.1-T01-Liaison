import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { evaluateApplication, Application } from '../../services/evaluations';
import { getStudentPublicProfile, ProfileData } from '../../services/api';
import { getOpportunity } from '../../services/opportunities';
import { OrgStackParamList } from '../../navigation/OrgStack';
import ConfirmActionSheet, { ConfirmVariant } from '../../components/ui/ConfirmActionSheet';
import OrgHeader from '../../components/ui/OrgHeader';

type EvaluateRouteProp = RouteProp<OrgStackParamList, 'EvaluateCandidate'>;

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function daysWaiting(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export default function EvaluateCandidateScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EvaluateRouteProp>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const { opportunityId, opportunityTitle, applications } = route.params;

  const [index, setIndex] = useState(route.params.index ?? 0);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [note, setNote] = useState('');
  const [sheet, setSheet] = useState<ConfirmVariant | null>(null);
  const [saving, setSaving] = useState(false);

  const current = applications[index];

  // Requisitos da vaga (uma vez).
  useEffect(() => {
    getOpportunity(opportunityId, accessToken).then(setOpportunity).catch(() => setOpportunity(null));
  }, [opportunityId, accessToken]);

  // Perfil completo do candidato (a cada troca de candidato).
  const loadProfile = useCallback(async () => {
    if (!accessToken || !current) return;
    try {
      setLoadingProfile(true);
      setProfile(null);
      setNote('');
      const data = await getStudentPublicProfile(accessToken, current.student.id);
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [accessToken, current]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleEvaluate = async (newStatus: 'approved' | 'rejected', confirmed = false) => {
    if (!accessToken || !current) return;
    try {
      setSaving(true);
      const result = await evaluateApplication(
        accessToken,
        current.id,
        newStatus,
        confirmed,
        note.trim()
      );
      if ((result as any)._httpStatus === 409 || result.requires_confirmation) {
        // Candidato já avaliado — segue confirmando (raro nesta tela, mas seguro).
        const msg = result.detail ?? 'Deseja realmente alterar a decisão?';
        if (Platform.OS === 'web' ? window.confirm(msg) : true) {
          await handleEvaluate(newStatus, true);
        }
        return;
      }
      setSheet(null);
      // Avança para o próximo pendente ou volta se era o último.
      if (index < applications.length - 1) {
        setIndex(index + 1);
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!current) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Nenhum candidato para avaliar.</Text>
        </View>
      </View>
    );
  }

  const name = profile?.nome ?? current.student.nome;
  const curso = profile?.curso ?? current.student.curso;
  const universidade = profile?.universidade ?? current.student.universidade;
  const semestre = profile?.semestre_atual;
  const studentMeta = `${curso} · ${universidade}`;

  const requirements: string[] = opportunity?.requirements ?? [];
  const preferred: string[] = opportunity?.preferred_courses ?? [];
  const acceptsAny: boolean = opportunity?.accepts_any_course ?? false;
  const courseCompatible =
    acceptsAny ||
    preferred.some((c) => c.toLowerCase().trim() === (curso ?? '').toLowerCase().trim());

  return (
    <View style={styles.container}>
      <OrgHeader
        eyebrow="Avaliação de candidato"
        title="Avaliar"
        accent="candidato"
        subtitle={opportunityTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Candidato */}
        <View style={styles.section}>
          <View style={styles.candidateRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PublicStudentProfile', { userId: current.student.id })
              }
            >
              {current.student.avatar_url ? (
                <Image source={{ uri: current.student.avatar_url }} style={styles.avatarLg} />
              ) : (
                <View style={styles.avatarLg}>
                  <Text style={styles.avatarLgText}>{initials(name)}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.candidateName}>{name}</Text>
              <Text style={styles.candidateInfo}>
                {curso}
                {semestre ? ` · ${semestre}º semestre` : ''}
              </Text>
              <Text style={styles.candidateInfo}>{universidade}</Text>
            </View>
          </View>

          <View style={styles.statusLine}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>Aguardando avaliação</Text>
            </View>
            <Text style={styles.subtleText}>
              Inscrito em {new Date(current.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <View style={styles.waitingRow}>
            <Ionicons name="time-outline" size={13} color="#7a6020" />
            <Text style={styles.waitingText}>{daysWaiting(current.created_at)} dias aguardando</Text>
          </View>

          {/* Stats */}
          {profile && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats.total_hours_completed}h</Text>
                <Text style={styles.statLabel}>Extensão cumprida</Text>
              </View>
              <View style={[styles.statBox, styles.statDivider]}>
                <Text style={styles.statValue}>{profile.stats.total_events}</Text>
                <Text style={styles.statLabel}>Eventos anteriores</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.stats.total_hours_required}h</Text>
                <Text style={styles.statLabel}>Meta de extensão</Text>
              </View>
            </View>
          )}
        </View>

        {loadingProfile && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator color="#1a2744" />
          </View>
        )}

        {/* Dados Acadêmicos */}
        {profile && (
          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <Ionicons name="school-outline" size={16} color="#d4813a" />
              <Text style={styles.cardHeadingText}>Dados Acadêmicos</Text>
            </View>
            <Row label="Universidade" value={profile.universidade} />
            <Row label="Curso" value={profile.curso} />
            <Row label="Matrícula" value={profile.matricula} />
            <Row
              label="Semestre"
              value={
                (profile.semestre_atual ? `${profile.semestre_atual}º` : '—') +
                (profile.turno ? ` · ${profile.turno}` : '')
              }
            />
            <Row label="Previsão conclusão" value={profile.ano_conclusao ? String(profile.ano_conclusao) : '—'} />
          </View>
        )}

        {/* Áreas de Interesse */}
        {profile && profile.interesses.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <Ionicons name="heart-outline" size={16} color="#d4813a" />
              <Text style={styles.cardHeadingText}>Áreas de Interesse</Text>
            </View>
            <View style={styles.chipsRow}>
              {profile.interesses.map((it) => (
                <View key={it} style={styles.chip}>
                  <Text style={styles.chipText}>{it}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Requisitos da Vaga */}
        {requirements.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeading}>
              <Ionicons name="flag-outline" size={16} color="#d4813a" />
              <Text style={styles.cardHeadingText}>Requisitos da Vaga</Text>
            </View>
            <Text style={styles.subtleText}>Definidos pela organização para esta vaga:</Text>
            <View style={{ marginTop: 10, gap: 8 }}>
              {requirements.map((r, i) => (
                <View key={i} style={styles.reqItem}>
                  <View style={styles.reqDot} />
                  <Text style={styles.reqText}>{r}</Text>
                </View>
              ))}
            </View>
            {preferred.length > 0 && (
              <View style={styles.preferredBox}>
                <Text style={styles.preferredLabel}>CURSOS PREFERENCIAIS</Text>
                <Text style={styles.preferredValue}>{preferred.join(' · ')}</Text>
                {courseCompatible && (
                  <View style={styles.compatRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#1d7a4a" />
                    <Text style={styles.compatText}>Curso do candidato compatível</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Justificativa */}
        <View style={styles.card}>
          <Text style={styles.justLabel}>
            Justificativa <Text style={styles.justHint}>(opcional, visível para o estudante)</Text>
          </Text>
          <TextInput
            style={styles.textarea}
            value={note}
            onChangeText={setNote}
            placeholder="Ex: Seu perfil se encaixa perfeitamente com os requisitos..."
            placeholderTextColor="#a8aebd"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={styles.justFootnote}>
            A justificativa será enviada ao estudante junto com a notificação de aprovação ou recusa.
          </Text>
        </View>

        {/* Prev / Next */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            disabled={index === 0}
            onPress={() => setIndex(index - 1)}
          >
            <Ionicons name="chevron-back" size={14} color={index === 0 ? '#c8ccd6' : '#3a4560'} />
            <Text style={[styles.navBtnText, index === 0 && { color: '#c8ccd6' }]}>Anterior</Text>
          </TouchableOpacity>
          <Text style={styles.navCounter}>
            Candidato {index + 1} de {applications.length}
          </Text>
          <TouchableOpacity
            style={styles.navBtn}
            disabled={index >= applications.length - 1}
            onPress={() => setIndex(index + 1)}
          >
            <Text style={[styles.navBtnText, index >= applications.length - 1 && { color: '#c8ccd6' }]}>
              Próximo
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={index >= applications.length - 1 ? '#c8ccd6' : '#3a4560'}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => setSheet('reject')}>
          <Ionicons name="close" size={16} color="#9b1c1c" />
          <Text style={styles.rejectButtonText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveButton} onPress={() => setSheet('approve')}>
          <Ionicons name="checkmark" size={16} color="white" />
          <Text style={styles.approveButtonText}>Aprovar</Text>
        </TouchableOpacity>
      </View>

      <ConfirmActionSheet
        visible={sheet !== null}
        variant={sheet ?? 'approve'}
        studentName={name}
        studentMeta={`${studentMeta} · Inscrito em ${new Date(current.created_at).toLocaleDateString('pt-BR')}`}
        statusLabel="Aguardando"
        loading={saving}
        onConfirm={() => handleEvaluate(sheet === 'reject' ? 'rejected' : 'approved')}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fontFamilies.dmSansMedium, color: colors.text.secondary, fontSize: 14 },
  section: { backgroundColor: colors.neutral.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.neutral.border },
  candidateRow: { flexDirection: 'row', alignItems: 'center' },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLgText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 16 },
  candidateName: { fontFamily: fontFamilies.dmSansBold, fontSize: 16, color: colors.brand.navy },
  candidateInfo: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.info, marginTop: 2 },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.gold },
  statusBadgeText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11, color: '#7a6020' },
  subtleText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary },
  waitingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  waitingText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: '#7a6020' },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.neutral.border },
  statValue: { fontFamily: fontFamilies.playfairBold, fontSize: 20, color: colors.brand.navy },
  statLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 4 },
  card: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardHeadingText: { fontFamily: fontFamilies.dmSansBold, fontSize: 14, color: colors.brand.navy },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  dataLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary },
  dataValue: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.brand.navy, flexShrink: 1, textAlign: 'right' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: colors.accent.lightBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.brand.gold },
  reqItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reqDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.brand.gold, marginTop: 6 },
  reqText: { fontFamily: fontFamilies.dmSansRegular, flex: 1, fontSize: 13, color: colors.text.info, lineHeight: 18 },
  preferredBox: {
    backgroundColor: '#f6f4ef',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  preferredLabel: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 11, color: colors.text.secondary, letterSpacing: 0.5 },
  preferredValue: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.brand.navy, marginTop: 6, lineHeight: 19 },
  compatRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  compatText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: '#1d7a4a' },
  justLabel: { fontFamily: fontFamilies.dmSansBold, fontSize: 13, color: colors.brand.navy },
  justHint: { fontFamily: fontFamilies.dmSansRegular, color: colors.text.secondary, fontSize: 12 },
  textarea: {
    fontFamily: fontFamilies.dmSansRegular,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.brand.navy,
    minHeight: 84,
    marginTop: 10,
  },
  justFootnote: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 8, lineHeight: 17 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  navBtnText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.info },
  navCounter: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.brand.navy },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#9b1c1c',
    borderRadius: 999,
    height: 44,
  },
  rejectButtonText: { fontFamily: fontFamilies.dmSansBold, color: '#9b1c1c', fontSize: 13 },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    height: 44,
  },
  approveButtonText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 13 },
});
