import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdvancedFiltersModal, { AdvancedFilters } from '../../components/ui/AdvancedFiltersModal';
import CategoryPill from '../../components/ui/CategoryPill';
import CircularProgress from '../../components/ui/CircularProgress';
import HoursProgressBar from '../../components/ui/HoursProgressBar';
import OpportunityCard from '../../components/ui/OpportunityCard';
import SearchBar from '../../components/ui/SearchBar';
import NotificationBell from '../../components/NotificationBell';
import StatCard from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  getCategories,
  getDashboard,
  getOpportunities,
  OpportunityParams,
  saveOpportunity,
  unsaveOpportunity,
} from '../../services/opportunities';
import { categoryColor, colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  all: 'grid-outline',
  educacao: 'school-outline',
  saude: 'medkit-outline',
  tecnologia: 'hardware-chip-outline',
  meio_ambiente: 'leaf-outline',
  assistencia_social: 'people-outline',
  arte_cultura: 'color-palette-outline',
  esporte: 'football-outline',
};

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

export default function StudentHomeScreen() {
  const { accessToken } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [advanced, setAdvanced] = useState<AdvancedFilters>({ location: '', workload_max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildParams = useCallback(
    (overrides: Partial<{ search: string; area: string; adv: AdvancedFilters }> = {}): OpportunityParams => {
      const search = overrides.search ?? searchText;
      const area = overrides.area ?? selectedArea;
      const adv = overrides.adv ?? advanced;
      const params: OpportunityParams = {};
      if (search) params.search = search;
      if (area && area !== 'all') params.area = area;
      if (adv.location) params.location = adv.location;
      if (adv.workload_max) params.workload_max = adv.workload_max;
      return params;
    },
    [searchText, selectedArea, advanced]
  );

  const applyOpportunities = useCallback((data: any) => {
    setOpportunities(data?.results ?? []);
    setResultsCount(data?.count ?? data?.results?.length ?? 0);
  }, []);

  const fetchAll = useCallback(
    async (params: OpportunityParams = {}) => {
      if (!accessToken) return;
      try {
        const [dashData, catsData, oppsData] = await Promise.all([
          getDashboard(accessToken),
          getCategories(accessToken),
          getOpportunities(accessToken, params),
        ]);
        setDashboard(dashData);
        setCategories(catsData);
        applyOpportunities(oppsData);
      } catch {
        // handle error silently
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken, applyOpportunities]
  );

  // Refetch ao focar (volta do detalhe após candidatar → atualiza vagas/contadores).
  useFocusEffect(
    useCallback(() => {
      fetchAll(buildParams());
    }, [fetchAll, buildParams])
  );

  const refetch = useCallback(
    (params: OpportunityParams) => {
      if (!accessToken) return;
      getOpportunities(accessToken, params).then(applyOpportunities).catch(() => {});
    },
    [accessToken, applyOpportunities]
  );

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refetch(buildParams({ search: text }));
    }, 300);
  };

  const handleCategoryPress = (area: string) => {
    setSelectedArea(area);
    refetch(buildParams({ area }));
  };

  const handleApplyFilters = (filters: AdvancedFilters) => {
    setAdvanced(filters);
    setShowFilters(false);
    refetch(buildParams({ adv: filters }));
  };

  const handleClearFilters = () => {
    setSearchText('');
    setSelectedArea('all');
    setAdvanced({ location: '', workload_max: '' });
    refetch({});
  };

  const handleSave = async (opp: OpportunityData) => {
    if (!accessToken) return;
    try {
      if (opp.is_saved) {
        await unsaveOpportunity(accessToken, opp.id);
      } else {
        await saveOpportunity(accessToken, opp.id);
      }
      setOpportunities(prev =>
        prev.map(o => (o.id === opp.id ? { ...o, is_saved: !o.is_saved } : o))
      );
    } catch {
      // ignore
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAll(buildParams());
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  const hoursLeft = dashboard
    ? Math.max(0, dashboard.horas_exigidas - dashboard.horas_acumuladas)
    : 0;
  const initial = dashboard?.nome?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  const ListHeader = (
    <View>
      {/* Navy gradient header */}
      <LinearGradient
        colors={[colors.header.gradientFrom, colors.header.gradientTo]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Decorative rings */}
        <View pointerEvents="none" style={styles.ringTopRight} />
        <View pointerEvents="none" style={styles.ringBottomLeft} />

        <View style={styles.headerTop}>
          <TouchableOpacity
            testID="header-avatar"
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Perfil')}
          >
            <LinearGradient
              colors={['#d4813a', '#f0b070']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID="my-applications-button"
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('MyApplications')}
            >
              <Ionicons name="document-text-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <NotificationBell
              containerStyle={styles.headerIconBtn}
              iconSize={18}
              iconColor="#fff"
              onNavigate={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>

        {/* Greeting */}
        {dashboard && (
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{dashboard.saudacao}</Text>
            <Text style={styles.greeting}>, </Text>
            <Text style={styles.greeting}>{dashboard.nome}</Text>
            <Text style={styles.greeting}> 👋</Text>
          </View>
        )}

        <Text style={styles.headline}>
          Descubra <Text style={styles.headlineAccent}>oportunidades</Text> que fazem a diferença
        </Text>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <StatCard value={`${dashboard?.horas_acumuladas ?? 0}h`} label="acumuladas" icon="time-outline" />
          <StatCard value={dashboard?.inscricoes_ativas ?? 0} label="inscrições ativas" icon="document-text-outline" />
          <StatCard value={dashboard?.vagas_salvas ?? 0} label="salvas" icon="bookmark-outline" />
        </View>

        {/* Goal ring */}
        {dashboard && (
          <View style={styles.goalRow}>
            <CircularProgress percentage={dashboard.progresso_percentual} />
            <View style={styles.goalText}>
              <Text style={styles.goalTitle}>Meta de extensão</Text>
              <Text style={styles.goalSubtitle}>
                Faltam <Text style={styles.goalSubtitleStrong}>{hoursLeft}h</Text> para {dashboard.horas_exigidas}h
              </Text>
              <HoursProgressBar
                variant="header"
                filled={dashboard.horas_acumuladas}
                total={dashboard.horas_exigidas}
                percentage={dashboard.progresso_percentual}
              />
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Search + filter */}
      <View style={styles.searchWrap}>
        <SearchBar
          onChangeText={handleSearchChange}
          value={searchText}
          placeholder="Buscar por tema, ONG, local..."
          onFilterPress={() => setShowFilters(true)}
        />
      </View>

      {/* Category pills */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        >
          {categories.map(item => (
            <CategoryPill
              key={item.area}
              label={item.label}
              count={item.count}
              isSelected={selectedArea === item.area}
              onPress={() => handleCategoryPress(item.area)}
              color={item.area === 'all' ? undefined : categoryColor(item.area)}
              icon={CATEGORY_ICONS[item.area] ?? 'pricetag-outline'}
            />
          ))}
        </ScrollView>
      )}

      {/* Section title + count */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Para você</Text>
        <Text style={styles.sectionCount}>{resultsCount} oportunidades</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={opportunities}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <OpportunityCard
              opportunity={item}
              isSaved={item.is_saved}
              onSave={() => handleSave(item)}
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
            <Ionicons name="search-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Nenhuma vaga encontrada</Text>
            <TouchableOpacity
              testID="clear-filters-button"
              style={styles.clearBtn}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearBtnText}>Limpar filtros</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <AdvancedFiltersModal
        visible={showFilters}
        onApply={handleApplyFilters}
        onClose={() => setShowFilters(false)}
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
  cardWrap: {
    paddingHorizontal: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  ringTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(212,129,58,0.12)',
  },
  ringBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.gold,
    borderWidth: 2,
    borderColor: colors.brand.navy,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.playfairBold,
    color: colors.brand.navy,
    fontSize: 15,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  greeting: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    letterSpacing: 0.88,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  headline: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 20,
    color: '#fff',
    marginTop: 6,
    lineHeight: 26,
  },
  headlineAccent: {
    fontFamily: fontFamilies.playfairBoldItalic,
    color: '#f0b070',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  goalText: {
    flex: 1,
    gap: 4,
  },
  goalTitle: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 13,
    color: '#fff',
  },
  goalSubtitle: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
  },
  goalSubtitleStrong: {
    fontFamily: fontFamilies.dmSansBold,
    color: '#f0b070',
  },
  searchWrap: {
    paddingHorizontal: 20,
    marginTop: -28,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  sectionCount: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    color: colors.text.secondary,
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
  clearBtn: {
    marginTop: 16,
    backgroundColor: colors.brand.navy,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  clearBtnText: {
    fontFamily: fontFamilies.dmSansSemiBold,
    color: '#fff',
    fontSize: 14,
  },
});
