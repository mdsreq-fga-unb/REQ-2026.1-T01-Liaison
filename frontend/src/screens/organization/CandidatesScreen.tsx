import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { getMyOpportunities } from '../../services/opportunities';
import { AREA_LABELS, AREA_ICONS } from '../../constants/areas';
import OrgHeader from '../../components/ui/OrgHeader';

interface OrgOpportunity {
  id: string;
  title: string;
  area: string;
  status: string;
  vacancies: number;
  workload_value: number;
  updated_at: string;
  applicants_count: number;
  applicants_pending: number | null;
  applicants_approved: number | null;
  applicants_rejected: number | null;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'Atualizado agora há pouco';
  if (h < 24) return `Atualizado há ${h}h`;
  const d = Math.floor(h / 24);
  return `Atualizado há ${d}d`;
}

export default function CandidatesScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const [opportunities, setOpportunities] = useState<OrgOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data: OrgOpportunity[] = await getMyOpportunities(accessToken);
      // Só vagas que têm candidatos.
      setOpportunities(data.filter((o) => (o.applicants_count ?? 0) > 0));
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const totals = opportunities.reduce(
    (acc, o) => {
      acc.pending += o.applicants_pending ?? 0;
      acc.approved += o.applicants_approved ?? 0;
      acc.rejected += o.applicants_rejected ?? 0;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0 }
  );

  const renderCard = ({ item }: { item: OrgOpportunity }) => {
    const pending = item.applicants_pending ?? 0;
    const approved = item.applicants_approved ?? 0;
    const rejected = item.applicants_rejected ?? 0;
    const closed = item.status === 'closed';
    const nearFull = item.status === 'active' && item.vacancies > 0 && approved >= item.vacancies * 0.8;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.areaTag}>
            <Ionicons name={(AREA_ICONS[item.area] ?? 'pricetag-outline') as any} size={13} color="#d4813a" />
            <Text style={styles.areaText}>{AREA_LABELS[item.area] ?? item.area}</Text>
          </View>
          <View style={styles.statusTags}>
            {closed ? (
              <View style={[styles.statusTag, { backgroundColor: 'rgba(26,39,68,0.1)' }]}>
                <Text style={[styles.statusTagText, { color: '#1a2744' }]}>Encerrada</Text>
              </View>
            ) : (
              <View style={[styles.statusTag, { backgroundColor: 'rgba(29,122,74,0.1)' }]}>
                <View style={styles.greenDot} />
                <Text style={[styles.statusTagText, { color: '#1d7a4a' }]}>Ativa</Text>
              </View>
            )}
            {nearFull && (
              <View style={[styles.statusTag, { backgroundColor: '#fef3e9' }]}>
                <Text style={[styles.statusTagText, { color: '#d4813a' }]}>Quase cheio</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>

        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: '#fef9ec' }]}>
            <Text style={[styles.chipNum, { color: '#7a6020' }]}>{pending}</Text>
            <Text style={[styles.chipLabel, { color: '#7a6020' }]}>Aguardando</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#edfaf3' }]}>
            <Text style={[styles.chipNum, { color: '#1d7a4a' }]}>{approved}</Text>
            <Text style={[styles.chipLabel, { color: '#1d7a4a' }]}>Aprovados</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: '#fef2f2' }]}>
            <Text style={[styles.chipNum, { color: '#9b1c1c' }]}>{rejected}</Text>
            <Text style={[styles.chipLabel, { color: '#9b1c1c' }]}>Recusados</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('OpportunityApplicants', {
              opportunityId: item.id,
              opportunityTitle: item.title,
            })
          }
        >
          <Text style={styles.primaryBtnText}>Avaliar Candidatos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() =>
            navigation.navigate('OpportunityAttendance', {
              opportunityId: item.id,
              opportunityTitle: item.title,
              expectedHours: item.workload_value,
            })
          }
        >
          <Text style={styles.secondaryBtnText}>Candidatos Aprovados</Text>
        </TouchableOpacity>

        <Text style={styles.updatedText}>
          {closed ? `Encerrada · ${approved} aprovados` : relativeTime(item.updated_at)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <OrgHeader
        eyebrow="Gestão de candidaturas"
        title="Seus"
        accent="candidatos"
        onBell={() => navigation.navigate('Notifications')}
      />

      {/* Resumo */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <View style={styles.summaryNumRow}>
            <View style={[styles.summaryDot, { backgroundColor: '#d4813a' }]} />
            <Text style={styles.summaryNum}>{totals.pending}</Text>
          </View>
          <Text style={styles.summaryLabel}>Aguardando</Text>
        </View>
        <View style={[styles.summaryBox, styles.summaryDivider]}>
          <View style={styles.summaryNumRow}>
            <View style={[styles.summaryDot, { backgroundColor: '#1d7a4a' }]} />
            <Text style={styles.summaryNum}>{totals.approved}</Text>
          </View>
          <Text style={styles.summaryLabel}>Aprovados</Text>
        </View>
        <View style={styles.summaryBox}>
          <View style={styles.summaryNumRow}>
            <View style={[styles.summaryDot, { backgroundColor: '#9b1c1c' }]} />
            <Text style={styles.summaryNum}>{totals.rejected}</Text>
          </View>
          <Text style={styles.summaryLabel}>Recusados</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a2744" />
        </View>
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.listLabelRow}>
              <Ionicons name="briefcase-outline" size={14} color="#7a8299" />
              <Text style={styles.listLabel}>VAGAS COM CANDIDATOS</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Nenhuma vaga com candidatos ainda.</Text>
            </View>
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 14, color: colors.text.secondary },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  summaryBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.neutral.border },
  summaryNumRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryNum: { fontFamily: fontFamilies.playfairBold, fontSize: 22, color: colors.brand.navy },
  summaryLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12, color: colors.text.secondary, marginTop: 4 },
  list: { padding: 16, paddingBottom: 24, gap: 16 },
  listLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  listLabel: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 11, color: colors.text.secondary, letterSpacing: 0.8 },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
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
  statusTags: { flexDirection: 'row', gap: 6 },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusTagText: { fontFamily: fontFamilies.dmSansBold, fontSize: 11 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1d7a4a' },
  cardTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 15,
    lineHeight: 19.5,
    color: colors.brand.navy,
    marginBottom: 10,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  chipNum: { fontFamily: fontFamilies.dmSansBold, fontSize: 13 },
  chipLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 12 },
  primaryBtn: {
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  primaryBtnText: { fontFamily: fontFamilies.dmSansBold, color: colors.neutral.white, fontSize: 13 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 999,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryBtnText: { fontFamily: fontFamilies.dmSansBold, color: colors.brand.navy, fontSize: 13 },
  updatedText: { fontFamily: fontFamilies.dmSansMedium, fontSize: 11, color: colors.text.secondary, marginTop: 12 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  navText: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  navTextActive: {
    fontFamily: fontFamilies.dmSansBold,
    color: colors.brand.gold,
  },
});
