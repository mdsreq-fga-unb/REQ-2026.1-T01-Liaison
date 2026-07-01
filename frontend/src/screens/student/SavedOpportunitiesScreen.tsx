import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import OpportunityCard from '../../components/ui/OpportunityCard';
import OrgHeader from '../../components/ui/OrgHeader';
import { useAuth } from '../../context/AuthContext';
import { getSavedOpportunities, unsaveOpportunity } from '../../services/opportunities';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

interface OpportunityData {
  id: string;
  title: string;
  organization: { id?: string; user_id?: string; razao_social: string };
  area: string;
  description: string;
  workload_value: number;
  workload_unit: string;
  vacancies: number;
  modality: string;
  location: string;
  start_date: string;
  start_time: string;
  status: string;
  featured: boolean;
  is_saved: boolean;
  applicants_count: number;
}

export default function SavedOpportunitiesScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const [items, setItems] = useState<OpportunityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await getSavedOpportunities(accessToken);
      setItems(data ?? []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRemove = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      // Otimista: tira o card da lista; restaura em caso de erro.
      const prev = items;
      setItems(curr => curr.filter(o => o.id !== id));
      try {
        await unsaveOpportunity(accessToken, id);
      } catch {
        setItems(prev);
      }
    },
    [accessToken, items]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  const countLabel =
    items.length === 1 ? '1 oportunidade salva' : `${items.length} oportunidades salvas`;

  const ListHeader = (
    <View style={styles.headerWrap}>
      <OrgHeader title="Minhas" accent="oportunidades salvas" subtitle={countLabel} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <OpportunityCard
              opportunity={item}
              isSaved={item.is_saved}
              onSave={() => handleRemove(item.id)}
              onPress={() => navigation.navigate('OpportunityDetail', { id: item.id })}
              onApply={() => navigation.navigate('OpportunityDetail', { id: item.id })}
              onOrgPress={
                item.organization.user_id
                  ? () => navigation.navigate('PublicOrgProfile', { orgId: item.organization.user_id })
                  : undefined
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View testID="empty-state" style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Nenhuma oportunidade salva ainda</Text>
            <TouchableOpacity
              testID="explore-button"
              style={styles.exploreBtn}
              onPress={() => navigation.navigate('Explorar')}
            >
              <Text style={styles.exploreBtnText}>Explorar vagas</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.bg,
  },
  listContent: {
    paddingBottom: 24,
  },
  headerWrap: {
    marginBottom: 16,
  },
  cardWrap: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
  exploreBtn: {
    marginTop: 16,
    backgroundColor: colors.brand.navy,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  exploreBtnText: {
    fontFamily: fontFamilies.dmSansSemiBold,
    color: '#fff',
    fontSize: 14,
  },
});
