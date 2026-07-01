import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { getOpportunityApplications, evaluateApplication, Application } from '../../services/evaluations';
import { getOpportunity } from '../../services/opportunities';
import { OrgStackParamList } from '../../navigation/OrgStack';
import ConfirmActionSheet from '../../components/ui/ConfirmActionSheet';
import OrgHeader from '../../components/ui/OrgHeader';
import { areaLabel, AREA_ICONS } from '../../constants/areas';

type ApplicantsRouteProp = RouteProp<OrgStackParamList, 'OpportunityApplicants'>;

type TabKey = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<TabKey, string> = {
  pending: 'Aguardando',
  approved: 'Aprovados',
  rejected: 'Recusados',
};

const STATUS_META: Record<TabKey, { color: string; bg: string; label: string }> = {
  pending: { color: '#7a6020', bg: '#fef9ec', label: 'Aguardando' },
  approved: { color: '#1d7a4a', bg: '#edfaf3', label: 'Aprovado' },
  rejected: { color: '#9b1c1c', bg: '#fef2f2', label: 'Recusado' },
};

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function fmtShort(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function daysWaiting(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
}

export default function OpportunityApplicantsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ApplicantsRouteProp>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const { opportunityId, opportunityTitle } = route.params;

  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [search, setSearch] = useState('');
  const [revertTarget, setRevertTarget] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const [data, opp] = await Promise.all([
        getOpportunityApplications(accessToken, opportunityId),
        getOpportunity(opportunityId, accessToken).catch(() => null),
      ]);
      setApplications(data);
      if (opp) setOpportunity(opp);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, opportunityId]);

  useFocusEffect(useCallback(() => { fetchApplications(); }, [fetchApplications]));

  const confirmRevert = async () => {
    if (!accessToken || !revertTarget) return;
    const newStatus = revertTarget.status === 'approved' ? 'rejected' : 'approved';
    try {
      setSaving(true);
      await evaluateApplication(accessToken, revertTarget.id, newStatus, true);
      setRevertTarget(null);
      await fetchApplications();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  const goToProfile = (userId: string) => navigation.navigate('PublicStudentProfile', { userId });

  const countOf = (tab: TabKey) => applications.filter((a) => a.status === tab).length;
  const approvedCount = countOf('approved');
  const totalCandidates = applications.length;
  const vacancies = opportunity?.vacancies;

  const pendingList = applications.filter((a) => a.status === 'pending');

  const filtered = applications.filter(
    (a) =>
      a.status === activeTab &&
      a.student.nome.toLowerCase().includes(search.toLowerCase().trim())
  );

  const renderCard = ({ item }: { item: Application }) => {
    const tab = item.status as TabKey;
    const meta = STATUS_META[tab] ?? STATUS_META.pending;
    const isPending = item.status === 'pending';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => goToProfile(item.student.id)}>
            {item.student.avatar_url ? (
              <Image source={{ uri: item.student.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials(item.student.nome)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.studentName}>{item.student.nome}</Text>
            <Text style={styles.studentInfo} numberOfLines={1}>
              {item.student.curso} · {item.student.universidade}
            </Text>
            <Text style={styles.studentDate}>Inscrito em {fmtDate(item.created_at)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.badge, { backgroundColor: meta.bg }]}>
              <View style={[styles.badgeDot, { backgroundColor: meta.color }]} />
              <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            {isPending && daysWaiting(item.created_at) >= 3 && (
              <Text style={styles.waitingText}>{daysWaiting(item.created_at)} dias aguardando</Text>
            )}
            {item.status === 'approved' && (
              <Text style={styles.subMeta}>Aprovado em {fmtShort(item.updated_at ?? item.created_at)}</Text>
            )}
            {item.status === 'rejected' && (
              <Text style={styles.subMeta}>Recusado em {fmtShort(item.updated_at ?? item.created_at)}</Text>
            )}
          </View>
        </View>

        {item.status === 'rejected' && !!item.evaluation_note && (
          <View style={styles.noteBox}>
            <Ionicons name="chatbox-ellipses-outline" size={14} color="#7a8299" />
            <Text style={styles.noteText} numberOfLines={2}>
              Justificativa: {item.evaluation_note}
            </Text>
          </View>
        )}

        {isPending ? (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() =>
              navigation.navigate('EvaluateCandidate', {
                opportunityId,
                opportunityTitle,
                applications: pendingList,
                index: Math.max(0, pendingList.findIndex((a) => a.id === item.id)),
              })
            }
          >
            <Text style={styles.evaluateButtonText}>Avaliar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.reevaluateButton} onPress={() => setRevertTarget(item)}>
            <Ionicons name="refresh-outline" size={14} color="#3a4560" />
            <Text style={styles.reevaluateButtonText}>Reavaliar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const tabs: TabKey[] = ['pending', 'approved', 'rejected'];

  return (
    <View style={styles.container}>
      <OrgHeader
        eyebrow="Avaliação de candidatos"
        title="Avaliar"
        accent="candidatos"
        onBack={() => navigation.goBack()}
      />

      {/* Content — summary/tabs/search rolam junto com a lista (seção de candidatos era pequena demais) */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a2744" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {/* Vaga summary */}
              <View style={styles.summary}>
                {opportunity?.area && (
                  <View style={styles.areaTag}>
                    <Ionicons name={(AREA_ICONS[opportunity.area] ?? 'pricetag-outline') as any} size={12} color="#d4813a" />
                    <Text style={styles.areaText}>{areaLabel(opportunity.area)}</Text>
                  </View>
                )}
                <Text style={styles.summaryTitle}>{opportunityTitle}</Text>
                <Text style={styles.summaryMeta}>
                  {totalCandidates} candidatos · {approvedCount} aprovados
                  {vacancies != null ? ` de ${vacancies} vagas` : ''}
                </Text>
              </View>

              {/* Tabs */}
              <View style={styles.tabsRow}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                      {STATUS_LABELS[tab]} · {countOf(tab)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                  <Ionicons name="search" size={16} color="#7a8299" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar candidato…"
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#7a8299"
                  />
                </View>
              </View>

              {activeTab === 'approved' && filtered.length > 0 && (
                <TouchableOpacity
                  style={styles.attendanceButton}
                  onPress={() =>
                    navigation.navigate('OpportunityAttendance', {
                      opportunityId,
                      opportunityTitle,
                      expectedHours: opportunity?.workload_value,
                    })
                  }
                >
                  <Ionicons name="checkbox-outline" size={16} color="white" />
                  <Text style={styles.attendanceButtonText}>Registrar Frequência</Text>
                </TouchableOpacity>
              )}
            </>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhum candidato nesta categoria.</Text>
            </View>
          }
        />
      )}

      <ConfirmActionSheet
        visible={revertTarget !== null}
        variant="revert"
        studentName={revertTarget?.student.nome ?? ''}
        studentMeta={
          revertTarget
            ? `${revertTarget.student.curso} · ${revertTarget.student.universidade}`
            : ''
        }
        statusLabel={revertTarget ? STATUS_META[revertTarget.status as TabKey]?.label : undefined}
        loading={saving}
        onConfirm={confirmRevert}
        onClose={() => setRevertTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  summary: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.accent.lightBg,
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  areaText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11, color: colors.brand.gold },
  summaryTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 15, color: colors.brand.navy, marginTop: 8 },
  summaryMeta: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  tabsRow: { flexDirection: 'row', backgroundColor: colors.neutral.white, borderBottomWidth: 1, borderBottomColor: colors.neutral.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.brand.gold },
  tabText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.secondary },
  activeTabText: { fontFamily: fontFamilies.dmSansBold, color: colors.brand.navy },
  searchContainer: { paddingHorizontal: 16, paddingTop: 12 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { fontFamily: fontFamilies.dmSansRegular, flex: 1, fontSize: 14, color: colors.text.info },
  list: { paddingBottom: 24, gap: 12 },
  card: { backgroundColor: colors.neutral.white, borderRadius: 16, padding: 16, marginHorizontal: 16, borderWidth: 1, borderColor: colors.neutral.border },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 14 },
  studentName: { fontFamily: fontFamilies.dmSansBold, fontSize: 14, color: colors.brand.navy },
  studentInfo: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.info, marginTop: 2 },
  studentDate: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11 },
  waitingText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: '#7a6020', marginTop: 6 },
  subMeta: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 6 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f6f4ef',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noteText: { fontFamily: fontFamilies.dmSansRegular, flex: 1, fontSize: 12, color: '#5a6275', fontStyle: 'italic', lineHeight: 17 },
  evaluateButton: {
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  evaluateButtonText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 13 },
  reevaluateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 999,
    height: 36,
  },
  reevaluateButtonText: { fontFamily: fontFamilies.dmSansBold, color: colors.text.info, fontSize: 13 },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d7a4a',
    borderRadius: 999,
    height: 36,
    marginHorizontal: 16,
    marginTop: 12,
  },
  attendanceButtonText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 13 },
  emptyText: { fontFamily: fontFamilies.dmSansMedium, color: colors.text.secondary, fontSize: 14 },
});
