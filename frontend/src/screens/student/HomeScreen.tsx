import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import HoursProgressBar from '../../components/ui/HoursProgressBar';
import SearchBar from '../../components/ui/SearchBar';
import CategoryPill from '../../components/ui/CategoryPill';
import OpportunityCard from '../../components/ui/OpportunityCard';
import {
  getDashboard,
  getOpportunities,
  getCategories,
  saveOpportunity,
  unsaveOpportunity,
  OpportunityParams,
} from '../../services/opportunities';

interface DashboardData {
  nome: string;
  horas_acumuladas: number;
  horas_exigidas: number;
  progresso_percentual: number;
  inscricoes_ativas: number;
  vagas_salvas: number;
  saudacao: string;
}

interface CategoryData {
  area: string;
  label: string;
  count: number;
}

interface OpportunityData {
  id: string;
  title: string;
  organization: { id?: string; razao_social: string };
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

export default function StudentHomeScreen() {
  const { accessToken, logout } = useAuth();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = useCallback(async (params: OpportunityParams = {}) => {
    if (!accessToken) return;
    try {
      const [dashData, catsData, oppsData] = await Promise.all([
        getDashboard(accessToken),
        getCategories(accessToken),
        getOpportunities(accessToken, params),
      ]);
      setDashboard(dashData);
      setCategories(catsData);
      setOpportunities(oppsData.results ?? []);
    } catch (err) {
      // handle error silently
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      const params: OpportunityParams = {};
      if (text) params.search = text;
      if (selectedArea !== 'all') params.area = selectedArea;
      getOpportunities(accessToken!, params)
        .then(data => setOpportunities(data.results ?? []))
        .catch(() => {});
    }, 300);
  };

  const handleCategoryPress = (area: string) => {
    setSelectedArea(area);
    const params: OpportunityParams = {};
    if (searchText) params.search = searchText;
    if (area !== 'all') params.area = area;
    getOpportunities(accessToken!, params)
      .then(data => setOpportunities(data.results ?? []))
      .catch(() => {});
  };

  const handleSave = async (opp: OpportunityData) => {
    if (!accessToken) return;
    try {
      if (opp.is_saved) {
        await unsaveOpportunity(accessToken, opp.id);
      } else {
        await saveOpportunity(accessToken, opp.id);
      }
      // Toggle is_saved in local state
      setOpportunities(prev =>
        prev.map(o => o.id === opp.id ? { ...o, is_saved: !o.is_saved } : o)
      );
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAll({ search: searchText, area: selectedArea !== 'all' ? selectedArea : undefined });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          {dashboard && (
            <>
              <Text style={styles.greeting}>{dashboard.saudacao}</Text>
              <Text style={styles.studentName}>{dashboard.nome}</Text>
            </>
          )}
        </View>
        <TouchableOpacity testID="logout-button" onPress={() => logout()} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Hours Progress */}
      {dashboard && (
        <HoursProgressBar
          filled={dashboard.horas_acumuladas}
          total={dashboard.horas_exigidas}
          percentage={dashboard.progresso_percentual}
        />
      )}

      {/* Search */}
      <SearchBar
        onChangeText={handleSearchChange}
        value={searchText}
        placeholder="Buscar vagas..."
      />

      {/* Category Pills */}
      {categories.length > 0 && (
        <FlatList
          horizontal
          data={categories}
          keyExtractor={item => item.area}
          renderItem={({ item }) => (
            <CategoryPill
              label={item.label}
              count={item.count}
              isSelected={selectedArea === item.area}
              onPress={() => handleCategoryPress(item.area)}
            />
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />
      )}

      {/* Opportunities List or Empty State */}
      <FlatList
        data={opportunities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <OpportunityCard
            opportunity={item}
            isSaved={item.is_saved}
            onSave={() => handleSave(item)}
            onPress={() => {}}
          />
        )}
        ListEmptyComponent={
          <View testID="empty-state" style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Nenhuma vaga encontrada</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  logoutBtn: {
    padding: 4,
  },
  categoriesList: {
    marginVertical: 12,
  },
  list: {
    flex: 1,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },
});
