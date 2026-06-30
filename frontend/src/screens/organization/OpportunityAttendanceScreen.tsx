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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import {
  getOpportunityApplications,
  completeApplication,
  Application,
  AttendanceStatus,
} from '../../services/evaluations';
import { getOpportunity } from '../../services/opportunities';
import { OrgStackParamList } from '../../navigation/OrgStack';

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
  const [expectedHours, setExpectedHours] = useState<number | null>(route.params.expectedHours ?? null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal de registro
  const [selected, setSelected] = useState<Application | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStatus>('present');
  const [hoursInput, setHoursInput] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const [data, opp] = await Promise.all([
        getOpportunityApplications(accessToken, opportunityId),
        expectedHours === null
          ? getOpportunity(opportunityId, accessToken).catch(() => null)
          : Promise.resolve(null),
      ]);
      setApplications(data.filter(a => a.status === 'approved' || a.status === 'completed'));
      if (opp && typeof opp.workload_value === 'number') setExpectedHours(opp.workload_value);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, opportunityId, expectedHours]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const openModal = (app: Application) => {
    setSelected(app);
    setAttendance('present');
    setHoursInput(expectedHours != null ? String(expectedHours) : '');
  };

  const selectAttendance = (att: AttendanceStatus) => {
    setAttendance(att);
    if (att === 'present') setHoursInput(expectedHours != null ? String(expectedHours) : hoursInput);
    else if (att === 'absent') setHoursInput('0');
  };

  const closeModal = () => {
    setSelected(null);
    setHoursInput('');
  };

  const handleConfirm = async () => {
    if (!accessToken || !selected) return;
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
    return (
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(item.student.nome)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.studentName}>{item.student.nome}</Text>
          <Text style={styles.studentInfo} numberOfLines={1}>
            {item.student.curso} · {item.student.universidade}
          </Text>
          {done && item.attendance !== 'absent' && (
            <Text style={[styles.doneInfo, { color: meta.color }]}>
              {item.hours_completed ?? 0}h registradas
            </Text>
          )}
        </View>
        {done ? (
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.registerButton} onPress={() => openModal(item)}>
            <Text style={styles.registerButtonText}>Registrar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const divergence =
    attendance === 'partial' && expectedHours != null && Number.isInteger(Number(hoursInput))
      ? expectedHours - Number(hoursInput)
      : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Frequência</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{opportunityTitle}</Text>
        </View>
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

      {/* List */}
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
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(selected.student.nome)}</Text>
                </View>
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
            <View style={styles.triRow}>
              {(['absent', 'partial', 'present'] as AttendanceStatus[]).map(att => {
                const m = ATT_META[att];
                const active = attendance === att;
                return (
                  <TouchableOpacity
                    key={att}
                    style={[styles.triButton, active && { backgroundColor: m.bg, borderColor: m.color }]}
                    onPress={() => selectAttendance(att)}
                  >
                    <Ionicons name={m.icon} size={14} color={active ? m.color : '#7a8299'} />
                    <Text style={[styles.triText, active && { color: m.color, fontWeight: 'bold' }]}>{m.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Horas — escondido quando ausente */}
            {attendance !== 'absent' && (
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

            {/* Alertas por estado */}
            {attendance === 'partial' && divergence !== 0 && (
              <View style={[styles.alert, { backgroundColor: '#fef9ec' }]}>
                <Ionicons name="warning-outline" size={16} color="#7a6020" />
                <Text style={[styles.alertText, { color: '#7a6020' }]}>
                  Divergência de {Math.abs(divergence)}h em relação à carga prevista ({expectedHours}h).
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

            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: ATT_META[attendance].color }, saving && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
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
  container: { flex: 1, backgroundColor: '#faf8f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  header: {
    backgroundColor: '#1a2744',
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd8ce',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1a2744' },
  statLabel: { fontSize: 12, color: '#7a8299', marginTop: 2 },
  searchContainer: { padding: 16 },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#3a4560' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd8ce',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a2744',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#1a2744' },
  studentInfo: { fontSize: 13, color: '#3a4560', marginTop: 2 },
  doneInfo: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  registerButton: {
    backgroundColor: '#d4813a',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 34,
    justifyContent: 'center',
  },
  registerButtonText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  emptyText: { color: '#7a8299', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a2744' },
  modalSubtitle: { fontSize: 13, color: '#7a8299', marginTop: 4 },
  modalStudent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd8ce',
  },
  fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#1a2744', marginTop: 16 },
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
    borderColor: '#ddd8ce',
    backgroundColor: 'white',
  },
  triText: { fontSize: 13, color: '#7a8299' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  hoursInput: {
    width: 80,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1a2744',
    textAlign: 'center',
  },
  hoursHint: { fontSize: 14, color: '#7a8299' },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  alertText: { flex: 1, fontSize: 13, lineHeight: 18 },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 24,
    height: 52,
    marginTop: 24,
  },
  confirmButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  cancelButton: { alignItems: 'center', justifyContent: 'center', height: 44, marginTop: 8 },
  cancelButtonText: { color: '#7a8299', fontSize: 15 },
});
