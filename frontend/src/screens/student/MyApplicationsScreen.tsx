import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../services/applications';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { radius } from '../../theme/spacing';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando avaliação',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  cancelled: 'Cancelada',
};

interface ApplicationItem {
  id: string;
  opportunity: { id: string; title: string; status: string };
  status: string;
  created_at: string;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = value.slice(0, 10).split('-');
  return d.length === 3 ? `${d[2]}/${d[1]}/${d[0]}` : value;
}

export default function MyApplicationsScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getMyApplications(accessToken);
      setItems(data ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity testID="back-button" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.brand.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Candidaturas</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OpportunityDetail', { id: item.opportunity.id })}
          >
            <Text style={styles.cardTitle}>{item.opportunity.title}</Text>
            <View style={styles.cardMeta}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {STATUS_LABELS[item.status] ?? item.status}
                </Text>
              </View>
              <Text style={styles.date}>Candidatura em {formatDate(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View testID="empty-state" style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Você ainda não se candidatou a nenhuma vaga</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.bg,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: colors.neutral.white, borderBottomWidth: 1, borderBottomColor: colors.neutral.border,
  },
  headerTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 18, color: colors.text.primary },
  list: { padding: 20, gap: 12, flexGrow: 1 },
  card: {
    backgroundColor: colors.neutral.white, borderRadius: radius.md, padding: 16,
    borderWidth: 1, borderColor: colors.neutral.border, gap: 8,
  },
  cardTitle: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 15, color: colors.text.primary },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  statusBadge: {
    backgroundColor: colors.accent.lightBg, borderRadius: radius.round,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  statusText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 11, color: colors.brand.gold },
  date: { fontFamily: fontFamilies.dmSansRegular, fontSize: 12, color: colors.text.secondary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 14, color: colors.text.secondary, textAlign: 'center' },
});
