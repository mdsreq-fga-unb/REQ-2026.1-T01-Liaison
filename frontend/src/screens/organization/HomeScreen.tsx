import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, fontFamilies } from '../../theme/typography';
import { getMyOpportunities, publishOpportunity, closeOpportunity, reopenOpportunity, deleteOpportunity } from '../../services/opportunities';

interface OpportunityData {
  id: string;
  title: string;
  area?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  workload_value?: number;
  workload_unit?: string;
  modality?: string;
  vacancies?: number;
  applicants_count?: number;
}

type FilterTab = 'all' | 'active' | 'draft' | 'closed';

export default function OrgHomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      if (accessToken) {
        const data = await getMyOpportunities(accessToken);
        setOpportunities(Array.isArray(data) ? data : (data?.results ?? []));
      }
    } catch (err: any) {
      setError('Erro ao carregar vagas');
      console.warn('API Opportunities Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      if (accessToken) {
        await publishOpportunity(accessToken, id);
        Alert.alert('Sucesso', 'Sua vaga foi publicada com sucesso!');
        fetchOpportunities();
      }
    } catch (err: any) {
      Alert.alert('Atenção', err.message);
    }
  };

  const handleClose = async (id: string) => {
    try {
      if (accessToken) {
        await closeOpportunity(accessToken, id);
        Alert.alert('Sucesso', 'A vaga foi encerrada.');
        fetchOpportunities();
      }
    } catch (err: any) {
      Alert.alert('Atenção', err.message);
    }
  };

  const handleReopen = async (id: string) => {
    try {
      if (accessToken) {
        await reopenOpportunity(accessToken, id);
        Alert.alert('Sucesso', 'Sua vaga foi reaberta!');
        fetchOpportunities();
      }
    } catch (err: any) {
      Alert.alert('Atenção', err.message);
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Excluir Rascunho',
      'Tem certeza que deseja excluir este rascunho permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              if (accessToken) {
                await deleteOpportunity(accessToken, id);
                Alert.alert('Sucesso', 'Rascunho excluído.');
                fetchOpportunities();
              }
            } catch (err: any) {
              Alert.alert('Erro', err.message);
            }
          }
        }
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchOpportunities();
    }, [accessToken])
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { color: '#1d7a4a', bg: 'rgba(29,122,74,0.08)', text: '● Ativa' };
      case 'draft': return { color: '#7a8299', bg: 'rgba(122,130,153,0.1)', text: '◎ Rascunho' };
      case 'closed': return { color: colors.brand.navy, bg: 'rgba(26,39,68,0.12)', text: '✓ Encerrada' };
      default: return { color: '#7a8299', bg: '#f0f0f0', text: status };
    }
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return '📋';
    const cat = category.toLowerCase();
    if (cat.includes('edu')) return '📚';
    if (cat.includes('saúd') || cat.includes('saud')) return '🏥';
    if (cat.includes('tec')) return '💻';
    if (cat.includes('social')) return '🤝';
    if (cat.includes('arte') || cat.includes('cultu')) return '🎨';
    if (cat.includes('esporte')) return '⚽';
    if (cat.includes('ambiente')) return '🌿';
    return '📋';
  };

  const getModalityLabel = (modality?: string) => {
    if (!modality) return '📍 Presencial';
    const m = modality.toLowerCase();
    if (m.includes('remot') || m.includes('online')) return '🔗 Remoto';
    if (m.includes('híbrid') || m.includes('hibrid') || m.includes('misto')) return '🔀 Híbrido';
    return '📍 Presencial';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesTab = activeTab === 'all' || opp.status === activeTab;
    const titleMatch = opp.title ? opp.title.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return matchesTab && titleMatch;
  });

  const formatCardDate = (start?: string, end?: string) => {
    if (!start && !end) return 'Data a definir';
    const formatDate = (dateStr: string) => {
      try {
        const [year, month, day] = dateStr.split('T')[0].split('-');
        const date = new Date(Number(year), Number(month) - 1, Number(day));
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
      } catch {
        return dateStr;
      }
    };
    if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
    if (start) return `A partir de ${formatDate(start)}`;
    return `Até ${formatDate(end ?? '')}`;
  };

  const formatWorkload = (val?: number | string, unit?: string) => {
    if (!val) return 'Carga a definir';
    if (unit === 'total' || unit === 'h/total') return `${val}h /Total`;
    if (unit === 'h/semana') return `${val}h/semana`;
    if (unit === 'h/mês') return `${val}h/Mês`;
    return `${val} ${unit}`;
  };

  const isNearFull = (item: OpportunityData) => {
    if (!item.vacancies || item.vacancies === 0) return false;
    return (item.applicants_count || 0) / item.vacancies >= 0.85;
  };

  const renderCard = ({ item }: { item: OpportunityData }) => {
    const statusStyle = getStatusStyle(item.status);
    const nearFull = item.status === 'active' && isNearFull(item);
    const fillRatio = item.vacancies ? Math.min(((item.applicants_count || 0) / item.vacancies), 1) : 0;
    const isClosed = item.status === 'closed';

    return (
      <View style={styles.cardContainer}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={[
            styles.categoryBadge,
            isClosed && styles.categoryBadgeClosed,
          ]}>
            <Text style={[styles.categoryText, isClosed && styles.categoryTextClosed]}>
              {getCategoryIcon(item.area)} {(item.area || 'Diversos').toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
            </View>
            {nearFull && (
              <View style={styles.nearFullBadge}>
                <Text style={styles.nearFullText}>🔥 Quase cheio</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{item.title}</Text>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Ionicons name="calendar-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>{formatCardDate(item.start_date, item.end_date)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>{formatWorkload(item.workload_value, item.workload_unit)}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataText}>{getModalityLabel(item.modality)}</Text>
          </View>
        </View>

        {/* Vagas section — varies by status */}
        {item.status === 'active' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Vagas</Text>
              <Text style={[styles.progressValue, nearFull && { color: '#ef4444' }]}>
                {item.applicants_count || 0} de {item.vacancies || 0}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={nearFull ? ['#ef4444', '#f87171'] : [colors.brand.navy, colors.brand.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${fillRatio * 100}%` }]}
              />
            </View>
          </View>
        )}

        {item.status === 'draft' && (
          <Text style={styles.draftStats}>
            {item.applicants_count || 0} de {item.vacancies || 0} vagas · não publicada
          </Text>
        )}

        {item.status === 'closed' && (
          <Text style={styles.closedStats}>
            {item.applicants_count || 0} de {item.vacancies || 0} voluntários concluíram
          </Text>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {item.status === 'draft' && (
            <>
              <TouchableOpacity
                style={[styles.goldOutlineButton, { flex: 1 }]}
                onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
              >
                <Text style={styles.goldOutlineButtonText}>Continuar{'\n'}editando</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.navyButton, { flex: 1 }]}
                onPress={() => handlePublish(item.id)}
              >
                <Text style={styles.navyButtonText}>Publicar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.redOutlineButton, { flex: 1 }]}
                onPress={() => confirmDelete(item.id)}
              >
                <Text style={styles.redOutlineButtonText}>Excluir</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'active' && (
            <>
              <TouchableOpacity
                style={[styles.goldButton, { flex: 1 }]}
                onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
              >
                <Text style={styles.goldButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.redOutlineButton, { flex: 1 }]}
                onPress={() => handleClose(item.id)}
              >
                <Text style={styles.redOutlineButtonText}>Encerrar</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'closed' && (
            <TouchableOpacity
              style={[styles.navyOutlineButton, { flex: 1 }]}
              onPress={() => handleReopen(item.id)}
            >
              <Text style={styles.navyOutlineButtonText}>Reabrir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer info */}
        <Text style={styles.footerInfo}>
          {item.status === 'draft'
            ? 'Rascunho salvo'
            : item.status === 'closed'
            ? 'Encerrada · Criada por você'
            : 'Publicada · Criada por você'}
        </Text>
      </View>
    );
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: opportunities.length },
    { key: 'active', label: 'Ativas', count: opportunities.filter(o => o.status === 'active').length },
    { key: 'draft', label: 'Rascunho', count: opportunities.filter(o => o.status === 'draft').length },
    { key: 'closed', label: 'Encerradas', count: opportunities.filter(o => o.status === 'closed').length },
  ];

  return (
    <View style={styles.container}>
      {/* Status bar area */}
      <View style={{ height: insets.top, backgroundColor: colors.brand.navy }} />

      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Vagas</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOpportunity')}
        >
          <Ionicons name="add" size={14} color="white" />
          <Text style={styles.createButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}{' '}
                  <Text style={[styles.tabCount, isActive && styles.activeTabCount]}>
                    · {tab.count}
                  </Text>
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vagas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.secondary}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer} testID="loading-indicator">
          <ActivityIndicator size="large" color={colors.brand.navy} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.navyOutlineButton} onPress={fetchOpportunities}>
            <Text style={styles.navyOutlineButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredOpportunities}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma vaga encontrada.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate('CreateOpportunity')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="briefcase" size={24} color={colors.brand.gold} />
          <Text style={[styles.navText, { color: colors.brand.gold, fontFamily: fontFamilies.dmSansBold }]}>Vagas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => Alert.alert('Candidatos', 'Selecione uma vaga para ver os candidatos.')}
        >
          <Ionicons name="people-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Candidatos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('OrgProfile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    backgroundColor: colors.brand.navy,
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 18,
    color: colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: colors.brand.gold,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 29,
    borderRadius: 999,
    gap: 4,
  },
  createButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: colors.neutral.white,
  },
  tabsWrapper: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.brand.gold,
  },
  tabLabel: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 13,
    color: colors.text.secondary,
  },
  activeTabLabel: {
    fontFamily: fontFamilies.dmSansBold,
    color: colors.brand.navy,
  },
  tabCount: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 12,
    color: colors.text.secondary,
  },
  activeTabCount: {
    color: colors.brand.gold,
  },
  searchContainer: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: colors.neutral.bg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 10,
    paddingHorizontal: 13,
    height: 42,
    gap: 8,
  },
  searchInput: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 14,
    flex: 1,
    color: '#3a4560',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16,
  },
  cardContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: colors.accent.lightBg,
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.3)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  categoryBadgeClosed: {
    backgroundColor: 'rgba(26,39,68,0.1)',
    borderColor: 'rgba(26,39,68,0.2)',
  },
  categoryText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 11,
    color: colors.brand.gold,
  },
  categoryTextClosed: {
    color: colors.brand.navy,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 11,
  },
  nearFullBadge: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  nearFullText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 10,
    color: '#ef4444',
  },
  cardTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 15,
    lineHeight: 19.5,
    color: colors.brand.navy,
    marginBottom: 10,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 12,
    color: '#3a4560',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 12,
    color: '#3a4560',
  },
  progressValue: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: colors.brand.navy,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.neutral.border,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 999,
  },
  draftStats: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 14,
  },
  closedStats: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 13,
    color: '#1d7a4a',
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  goldButton: {
    backgroundColor: colors.brand.gold,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  goldButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: colors.neutral.white,
  },
  goldOutlineButton: {
    borderWidth: 1,
    borderColor: colors.brand.gold,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  goldOutlineButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: colors.brand.gold,
    textAlign: 'center',
  },
  navyButton: {
    backgroundColor: colors.brand.navy,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navyButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: colors.neutral.white,
  },
  navyOutlineButton: {
    borderWidth: 1,
    borderColor: colors.brand.navy,
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navyOutlineButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: colors.brand.navy,
  },
  redOutlineButton: {
    borderWidth: 1,
    borderColor: '#dc2626',
    borderRadius: 999,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  redOutlineButtonText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13,
    color: '#c0392b',
  },
  footerInfo: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.navy,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.brand.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
