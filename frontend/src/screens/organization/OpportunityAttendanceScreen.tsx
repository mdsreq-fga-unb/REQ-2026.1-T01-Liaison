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
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import {
  getOpportunityApplications,
  completeApplication,
  Application,
  AttendanceStatus,
} from '../../services/evaluations';
import { getOpportunity } from '../../services/opportunities';
import { OrgStackParamList } from '../../navigation/OrgStack';
import { areaLabel, AREA_ICONS } from '../../constants/areas';
import OrgHeader from '../../components/ui/OrgHeader';

type AttendanceRouteProp = RouteProp<OrgStackParamList, 'OpportunityAttendance'>;

const ATT_META: Record<AttendanceStatus | 'pending', { label: string; color: string; bg: string; icon: any }> = {
  present: { label: 'Presente', color: '#1d7a4a', bg: '#edfaf3', icon: 'checkmark-circle' },
  partial: { label: 'Parcial', color: '#7a6020', bg: '#fef9ec', icon: 'time' },
  absent:  { label: 'Ausente', color: '#9b1c1c', bg: '#fef2f2', icon: 'close-circle' },
  pending: { label: 'Pendente', color: '#7a8299', bg: '#f0f0f0', icon: 'ellipse-outline' },
};

const CONFIRM_LABEL: Record<AttendanceStatus, string> = {
  present: 'Confirmar Presença',
  partial: 'Confirmar Frequência Parcial',
  absent: 'Confirmar Ausência',
};

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function OpportunityAttendanceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<AttendanceRouteProp>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const { opportunityId, opportunityTitle } = route.params;

  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [expectedHours, setExpectedHours] = useState<number | null>(route.params.expectedHours ?? null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal de registro — frequência começa sem seleção (escolha obrigatória/segurança).
  const [selected, setSelected] = useState<Application | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(null);
  const [hoursInput, setHoursInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const [data, opp] = await Promise.all([
        getOpportunityApplications(accessToken, opportunityId),
        getOpportunity(opportunityId, accessToken).catch(() => null),
      ]);
      setApplications(data.filter(a => a.status === 'approved' || a.status === 'completed'));
      if (opp) {
        setOpportunity(opp);
        if (typeof opp.workload_value === 'number') setExpectedHours(opp.workload_value);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, opportunityId]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const goToProfile = (userId: string) => navigation.navigate('PublicStudentProfile', { userId });

  const openModal = (app: Application) => {
    // Registro é imutável (RNF08) → só candidaturas ainda não concluídas abrem o modal.
    if (app.status === 'completed') return;
    setSelected(app);
    setAttendance(null);
    setHoursInput(expectedHours != null ? String(expectedHours) : '');
  };

  const selectAttendance = (att: AttendanceStatus) => {
    setAttendance(att);
    if (att === 'present') setHoursInput(expectedHours != null ? String(expectedHours) : hoursInput);
    else if (att === 'absent') setHoursInput('0');
  };

  const closeModal = () => {
    setSelected(null);
    setAttendance(null);
    setHoursInput('');
  };

  const handleConfirm = async () => {
    if (!accessToken || !selected || attendance === null) return;
    const hours = attendance === 'absent' ? 0 : Number(hoursInput);
    if (attendance !== 'absent' && (!Number.isInteger(hours) || hours < 0)) {
      Alert.alert('Atenção', 'Informe a carga horária cumprida (horas inteiras ≥ 0).');
      return;
    }
    try {
      setSaving(true);
      await completeApplication(accessToken, selected.id, attendance, hours);
      closeModal();
      await fetchData();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setSaving(false);
    }
  };

  const registered = applications.filter(a => a.status === 'completed').length;
  const pending = applications.filter(a => a.status === 'approved').length;

  const filtered = applications.filter(a =>
    a.student.nome.toLowerCase().includes(search.toLowerCase())
  );

  const renderCard = ({ item }: { item: Application }) => {
    const done = item.status === 'completed';
    const meta = done ? ATT_META[item.attendance ?? 'present'] : ATT_META.pending;
    const inner = (
      <>
        <TouchableOpacity onPress={() => goToProfile(item.student.id)}>
          {item.student.avatar_url ? (
            <Image source={{ uri: item.student.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(item.student.nome)}</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.studentName}>{item.student.nome}</Text>
          <Text style={styles.studentInfo} numberOfLines={1}>
            {item.student.curso} · {item.student.universidade}
          </Text>
          {done && item.attendance !== 'absent' && (
            <Text style={[styles.doneInfo, { color: meta.color }]}>
              {item.hours_completed ?? 0}h registradas · certificado emitido
            </Text>
          )}
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {/* Concluído = imutável → sem chevron (não abre modal). */}
          {!done && <Ionicons name="chevron-forward" size={16} color="#c8ccd6" />}
        </View>
      </>
    );
    // Registro definitivo: card concluído não é clicável.
    if (done) {
      return <View style={[styles.card, styles.cardDone]}>{inner}</View>;
    }
    return (
      <TouchableOpacity style={styles.card} onPress={() => openModal(item)} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  };

  const divergence =
    attendance === 'partial' && expectedHours != null && Number.isInteger(Number(hoursInput))
      ? expectedHours - Number(hoursInput)
      : 0;

  return (
    <View style={styles.container}>
      <OrgHeader
        eyebrow="Registro de frequência"
        title="Estudantes"
        accent="aprovados"
        onBack={() => navigation.goBack()}
      />

      {/* List — summary/banner/stats/search rolam junto (seção de candidatos era pequena demais) */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a2744" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {/* Vaga summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  {opportunity?.area && (
                    <View style={styles.areaTag}>
                      <Ionicons name={(AREA_ICONS[opportunity.area] ?? 'pricetag-outline') as any} size={12} color="#d4813a" />
                      <Text style={styles.areaText}>{areaLabel(opportunity.area)}</Text>
                    </View>
                  )}
                  {opportunity?.status === 'closed' && (
                    <View style={styles.closedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#1a2744" />
                      <Text style={styles.closedTagText}>Encerrada</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.summaryTitle}>{opportunityTitle}</Text>
                <View style={styles.summaryMetaRow}>
                  {expectedHours != null && (
                    <View style={styles.summaryMetaItem}>
                      <Ionicons name="time-outline" size={12} color="#7a8299" />
                      <Text style={styles.summaryMetaText}>{expectedHours}h previstas</Text>
                    </View>
                  )}
                  <View style={styles.summaryMetaItem}>
                    <Ionicons name="people-outline" size={12} color="#7a8299" />
                    <Text style={styles.summaryMetaText}>{applications.length} aprovados</Text>
                  </View>
                </View>
              </View>

              {/* Banner Registrar Frequência */}
              <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                  <Ionicons name="checkbox-outline" size={18} color="white" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.bannerTitle}>Registrar Frequência</Text>
                  <Text style={styles.bannerSubtitle}>
                    {registered} de {applications.length} estudantes registrados
                  </Text>
                </View>
                {pending > 0 && (
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>{pending} pendentes</Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{applications.length}</Text>
                  <Text style={styles.statLabel}>Aprovados</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#1d7a4a' }]}>{registered}</Text>
                  <Text style={styles.statLabel}>Registrados</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: '#d4813a' }]}>{pending}</Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </View>
              </View>

              {/* Search */}
              <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                  <Ionicons name="search" size={16} color="#7a8299" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar aprovado..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#7a8299"
                  />
                </View>
              </View>

              <Text style={styles.listLabel}>Estudantes aprovados · {applications.length}</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhum estudante aprovado nesta vaga.</Text>
            </View>
          }
        />
      )}

      {/* Modal registrar frequência */}
      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>Registrar Frequência</Text>
            <Text style={styles.modalSubtitle}>
              {opportunityTitle}{expectedHours != null ? ` · ${expectedHours}h previstas` : ''}
            </Text>

            {selected && (
              <View style={styles.modalStudent}>
                <TouchableOpacity onPress={() => goToProfile(selected.student.id)}>
                  {selected.student.avatar_url ? (
                    <Image source={{ uri: selected.student.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{initials(selected.student.nome)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.studentName}>{selected.student.nome}</Text>
                  <Text style={styles.studentInfo}>
                    {selected.student.curso} · {selected.student.universidade}
                  </Text>
                </View>
              </View>
            )}

            {/* Tri-state */}
            <Text style={styles.fieldLabel}>Frequência</Text>
            <Text style={styles.fieldHint}>Selecione a frequência do estudante nesta atividade.</Text>
            <View style={styles.triRow}>
              {(['absent', 'partial', 'present'] as AttendanceStatus[]).map(att => {
                const m = ATT_META[att];
                const active = attendance === att;
                return (
                  <TouchableOpacity
                    key={att}
                    style={[styles.triButton, active && { backgroundColor: m.bg, borderColor: m.color, borderWidth: 2 }]}
                    onPress={() => selectAttendance(att)}
                  >
                    <Ionicons name={m.icon} size={14} color={active ? m.color : '#7a8299'} />
                    <Text style={[styles.triText, active && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Horas — só após escolher presente/parcial */}
            {attendance != null && attendance !== 'absent' && (
              <>
                <Text style={styles.fieldLabel}>Horas cumpridas</Text>
                <View style={styles.hoursRow}>
                  <TextInput
                    style={styles.hoursInput}
                    value={hoursInput}
                    onChangeText={setHoursInput}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor="#7a8299"
                  />
                  <Text style={styles.hoursHint}>
                    h{expectedHours != null ? ` / ${expectedHours}h prev.` : ''}
                  </Text>
                </View>
              </>
            )}

            {/* Consequência da seleção */}
            {attendance === 'partial' && divergence !== 0 && (
              <View style={[styles.alert, { backgroundColor: '#fef9ec' }]}>
                <Ionicons name="warning-outline" size={16} color="#7a6020" />
                <Text style={[styles.alertText, { color: '#7a6020' }]}>
                  Divergência de {Math.abs(divergence)}h em relação à carga prevista ({expectedHours}h).
                </Text>
              </View>
            )}
            {(attendance === 'present' || attendance === 'partial') && (
              <View style={[styles.alert, { backgroundColor: '#edfaf3' }]}>
                <Ionicons name="ribbon-outline" size={16} color="#1d7a4a" />
                <Text style={[styles.alertText, { color: '#1d7a4a' }]}>
                  O certificado será emitido com {Number(hoursInput) || 0}h e ficará disponível ao estudante.
                </Text>
              </View>
            )}
            {attendance === 'absent' && (
              <View style={[styles.alert, { backgroundColor: '#fef2f2' }]}>
                <Ionicons name="alert-circle-outline" size={16} color="#9b1c1c" />
                <Text style={[styles.alertText, { color: '#9b1c1c' }]}>
                  Estudante marcado como ausente não receberá certificado.
                </Text>
              </View>
            )}

            {/* Aviso de irreversibilidade — sempre que houver seleção */}
            {attendance != null && (
              <View style={styles.finalWarning}>
                <Ionicons name="lock-closed-outline" size={15} color="#7a6020" />
                <Text style={styles.finalWarningText}>
                  Atenção: o registro de frequência é definitivo e não poderá ser alterado depois de confirmado.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                { backgroundColor: attendance ? ATT_META[attendance].color : '#c8ccd6' },
                (saving || attendance === null) && { opacity: 0.6 },
              ]}
              onPress={handleConfirm}
              disabled={saving || attendance === null}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : attendance === null ? (
                <Text style={styles.confirmButtonText}>Selecione a frequência</Text>
              ) : (
                <>
                  <Ionicons name={ATT_META[attendance].icon} size={18} color="white" />
                  <Text style={styles.confirmButtonText}>{CONFIRM_LABEL[attendance]}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal} disabled={saving}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  summaryCard: {
    backgroundColor: colors.neutral.white,
    margin: 16,
    marginBottom: 0,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accent.lightBg,
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.3)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  areaText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11, color: colors.brand.gold },
  closedTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  closedTagText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11, color: colors.brand.navy },
  summaryTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 15, color: colors.brand.navy, marginTop: 8 },
  summaryMetaRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  summaryMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryMetaText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand.navy,
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 14 },
  bannerSubtitle: { fontFamily: fontFamilies.dmSansMedium, color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  bannerBadge: { backgroundColor: colors.brand.gold, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  bannerBadgeText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 11 },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  listLabel: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 11, color: colors.text.secondary, marginHorizontal: 16, marginBottom: 4 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    marginHorizontal: 16,
    borderRadius: 14,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontFamily: fontFamilies.playfairBold, fontSize: 22, color: colors.brand.navy },
  statLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  searchContainer: { padding: 16 },
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardDone: { backgroundColor: '#f7f5f0', borderColor: colors.neutral.border },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 14 },
  studentName: { fontFamily: fontFamilies.dmSansBold, fontSize: 14, color: colors.brand.navy },
  studentInfo: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.info, marginTop: 2 },
  doneInfo: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, marginTop: 2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11 },
  registerButton: {
    backgroundColor: colors.brand.gold,
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 34,
    justifyContent: 'center',
  },
  registerButtonText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 13 },
  emptyText: { fontFamily: fontFamilies.dmSansMedium, color: colors.text.secondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 16, color: colors.brand.navy },
  modalSubtitle: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  modalStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  fieldLabel: { fontFamily: fontFamilies.dmSansBold, fontSize: 13, color: colors.brand.navy, marginTop: 16 },
  fieldHint: { fontFamily: fontFamilies.dmSansRegular, fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  finalWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fdf6e8',
    borderWidth: 1,
    borderColor: '#e6d4a8',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  finalWarningText: { fontFamily: fontFamilies.dmSansMedium, flex: 1, fontSize: 12, color: '#7a6020', lineHeight: 17 },
  triRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  triButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  triText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.secondary },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  hoursInput: {
    fontFamily: fontFamilies.dmSansBold,
    width: 80,
    height: 44,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.brand.navy,
    textAlign: 'center',
  },
  hoursHint: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.secondary },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  alertText: { fontFamily: fontFamilies.dmSansMedium, flex: 1, fontSize: 13, lineHeight: 18 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    height: 44,
    marginTop: 24,
  },
  confirmButtonText: { fontFamily: fontFamilies.dmSansBold, color: 'white', fontSize: 13 },
  cancelButton: { alignItems: 'center', justifyContent: 'center', height: 44, marginTop: 8 },
  cancelButtonText: { fontFamily: fontFamilies.dmSansMedium, color: colors.text.secondary, fontSize: 14 },
});
