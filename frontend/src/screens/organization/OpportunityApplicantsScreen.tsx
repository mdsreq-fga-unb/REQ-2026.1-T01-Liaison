import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getOpportunityApplications, evaluateApplication, Application } from '../../services/evaluations';
import { OrgStackParamList } from '../../navigation/OrgStack';

type ApplicantsRouteProp = RouteProp<OrgStackParamList, 'OpportunityApplicants'>;

type TabKey = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<TabKey, string> = {
  pending: 'Aguardando',
  approved: 'Aprovados',
  rejected: 'Recusados',
};

const STATUS_COLORS: Record<TabKey, { color: string; bg: string }> = {
  pending:  { color: '#7a6020', bg: '#fef9ec' },
  approved: { color: '#1d7a4a', bg: '#edfaf3' },
  rejected: { color: '#9b1c1c', bg: '#fef2f2' },
};

export default function OpportunityApplicantsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<ApplicantsRouteProp>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const { opportunityId, opportunityTitle } = route.params;

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const fetchApplications = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await getOpportunityApplications(accessToken, opportunityId);
      setApplications(data);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, opportunityId]);

  useFocusEffect(useCallback(() => { fetchApplications(); }, [fetchApplications]));

  const handleEvaluate = async (
    applicationId: string,
    newStatus: 'approved' | 'rejected',
    confirmed = false
  ) => {
    if (!accessToken) return;
    try {
      const result = await evaluateApplication(accessToken, applicationId, newStatus, confirmed);
      if ((result as any)._httpStatus === 409 || result.requires_confirmation) {
        const message = result.detail ?? 'Deseja realmente alterar a decisão?';
        if (Platform.OS === 'web') {
          if (window.confirm(message)) {
            handleEvaluate(applicationId, newStatus, true);
          }
        } else {
          Alert.alert(
            'Confirmação necessária',
            message,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Confirmar', onPress: () => handleEvaluate(applicationId, newStatus, true) },
            ]
          );
        }
        return;
      }
      await fetchApplications();
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  const goToProfile = (userId: string) => {
    navigation.navigate('PublicStudentProfile', { userId });
  };

  const filtered = applications.filter(a => a.status === activeTab);

  const renderCard = ({ item }: { item: Application }) => {
    const isPending = item.status === 'pending';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity onPress={() => goToProfile(item.student.id)}>
            {item.student.avatar_url ? (
              <Image source={{ uri: item.student.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Ionicons name="person" size={22} color="#7a8299" />
              </View>
            )}
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.studentName}>{item.student.nome}</Text>
            <Text style={styles.studentInfo}>{item.student.curso} · {item.student.universidade}</Text>
            <Text style={styles.studentDate}>
              Inscrito em {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => goToProfile(item.student.id)}
          >
            <Ionicons name="chevron-forward" size={18} color="#d4813a" />
          </TouchableOpacity>
        </View>

        {isPending && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleEvaluate(item.id, 'approved')}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.approveButtonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleEvaluate(item.id, 'rejected')}
            >
              <Ionicons name="close" size={16} color="#9b1c1c" />
              <Text style={styles.rejectButtonText}>Recusar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isPending && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.reverseButton}
              onPress={() => handleEvaluate(item.id, item.status === 'approved' ? 'rejected' : 'approved')}
            >
              <Ionicons name="refresh-outline" size={14} color="#3a4560" />
              <Text style={styles.reverseButtonText}>
                {item.status === 'approved' ? 'Mover para Recusados' : 'Mover para Aprovados'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const tabs: TabKey[] = ['pending', 'approved', 'rejected'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Candidatos</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{opportunityTitle}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {STATUS_LABELS[tab]} ({applications.filter(a => a.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
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
            activeTab === 'approved' && filtered.length > 0 ? (
              <TouchableOpacity
                style={styles.attendanceButton}
                onPress={() => navigation.navigate('OpportunityAttendance', { opportunityId, opportunityTitle })}
              >
                <Ionicons name="checkbox-outline" size={16} color="white" />
                <Text style={styles.attendanceButtonText}>Registrar Frequência</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhum candidato nesta categoria.</Text>
            </View>
          }
        />
      )}
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd8ce',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: '#d4813a' },
  tabText: { fontSize: 13, color: '#7a8299', fontWeight: '500' },
  activeTabText: { color: '#1a2744', fontWeight: 'bold' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd8ce',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0eee9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButton: { padding: 4 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: '#1a2744' },
  studentInfo: { fontSize: 13, color: '#3a4560', marginTop: 2 },
  studentDate: { fontSize: 12, color: '#7a8299', marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1d7a4a',
    borderRadius: 20,
    height: 36,
  },
  approveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#9b1c1c',
    borderRadius: 20,
    height: 36,
  },
  rejectButtonText: { color: '#9b1c1c', fontWeight: 'bold', fontSize: 14 },
  reverseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ddd8ce',
    borderRadius: 20,
    height: 36,
  },
  reverseButtonText: { color: '#3a4560', fontSize: 13 },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1d7a4a',
    borderRadius: 24,
    height: 48,
    marginBottom: 4,
  },
  attendanceButtonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  emptyText: { color: '#7a8299', fontSize: 15 },
});
