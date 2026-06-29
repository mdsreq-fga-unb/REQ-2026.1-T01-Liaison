import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
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
  const { accessToken, logout } = useAuth();
  
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
        // Aceita lista pura ou resposta paginada {results}.
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
        fetchOpportunities(); // Recarrega a lista para mostrar o novo status
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { color: '#1d7a4a', bg: 'rgba(29,122,74,0.08)', text: '● Ativa' };
      case 'draft': return { color: '#7a8299', bg: 'rgba(122,130,153,0.1)', text: '◎ Rascunho' };
      case 'closed': return { color: '#1a2744', bg: 'rgba(26,39,68,0.12)', text: '✓ Encerrada' };
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
    return '📋';
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
      } catch (e) {
        return dateStr;
      }
    };

    if (start && end) {
      return `${formatDate(start)} a ${formatDate(end)}`;
    } else if (start) {
      return `A partir de ${formatDate(start)}`;
    } else {
      return `Até ${formatDate(end ?? '')}`;
    }
  };

  const formatWorkload = (val?: number | string, unit?: string) => {
    if (!val) return 'Carga a definir';
    if (unit === 'total' || unit === 'h/total') return `${val}h/total`;
    if (unit === 'h/semana' || unit === 'h/mês') return `${val}${unit}`;
    return `${val} ${unit}`;
  };

  const renderCard = ({ item }: { item: OpportunityData }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <View style={styles.cardContainer}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryIcon(item.area)} {(item.area || 'Diversos').toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle}>{item.title}</Text>

        {/* Metadata */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Ionicons name="calendar-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>
              {formatCardDate(item.start_date, item.end_date)}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>
              {formatWorkload(item.workload_value, item.workload_unit)}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="location-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>
              {item.modality ? (item.modality.charAt(0).toUpperCase() + item.modality.slice(1)) : 'Local a definir'}
            </Text>
          </View>
        </View>

        {/* Progress Bar — vagas preenchidas (applicants_count) / total (vacancies) */}
        {item.status !== 'closed' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Vagas</Text>
              <Text style={styles.progressValue}>{item.applicants_count || 0} de {item.vacancies || 0}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.vacancies ? Math.min(((item.applicants_count || 0) / item.vacancies) * 100, 100) : 0}%` }]} />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {item.status === 'draft' ? (
            <>
              <TouchableOpacity 
                style={[styles.outlineButton, { flex: 1.5 }]}
                onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
              >
                <Text style={styles.outlineButtonText}>Continuar editando</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.solidDarkButton, { flex: 1 }]}
                onPress={() => handlePublish(item.id)}
              >
                <Text style={styles.solidDarkButtonText}>Publicar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.outlineDangerButton, { width: 36, flex: undefined }]}
                onPress={() => confirmDelete(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.outlineButton, { flex: 1.5 }]}
                onPress={() => Alert.alert('Em breve', 'A tela de candidatos ainda não foi implementada.')}
              >
                <Text style={styles.outlineButtonText}>Candidatos ({(item.applicants_count || 0)})</Text>
              </TouchableOpacity>
              
              {item.status === 'closed' ? (
                <TouchableOpacity 
                  style={[styles.solidBrandButton, { flex: 1 }]}
                  onPress={() => handleReopen(item.id)}
                >
                  <Text style={styles.solidBrandButtonText}>Reabrir</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.solidBrandButton, { flex: 1 }]}
                    onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
                  >
                    <Text style={styles.solidBrandButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.outlineDangerButton, { flex: 1 }]}
                    onPress={() => handleClose(item.id)}
                  >
                    <Text style={styles.outlineDangerButtonText}>Encerrar</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
        
        {/* Footer info */}
        <Text style={styles.footerInfo}>
          {item.status === 'draft' ? 'Rascunho salvo' : `Publicada há alguns dias · Criada por você`}
        </Text>
      </View>
    );
  };

  const tabs = [
    { key: 'all', label: 'Todas', count: opportunities.length },
    { key: 'active', label: 'Ativas', count: opportunities.filter(o => o.status === 'active').length },
    { key: 'draft', label: 'Rascunho', count: opportunities.filter(o => o.status === 'draft').length },
    { key: 'closed', label: 'Encerradas', count: opportunities.filter(o => o.status === 'closed').length },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Minhas Vagas</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={logout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateOpportunity')}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.createButtonText}>Criar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity 
              key={tab.key} 
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as FilterTab)}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                {tab.label} <Text style={styles.tabCount}>· {tab.count}</Text>
              </Text>
            </TouchableOpacity>
          ))}
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
          <TouchableOpacity style={styles.outlineButton} onPress={fetchOpportunities}>
            <Text style={styles.outlineButtonText}>Tentar novamente</Text>
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

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate('CreateOpportunity')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="briefcase" size={24} color="#d4813a" />
          <Text style={[styles.navText, { color: '#d4813a', fontWeight: 'bold' }]}>Vagas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => Alert.alert('Em breve', 'A tela de candidatos ainda não foi implementada.')}
        >
          <Ionicons name="people-outline" size={24} color="#7a8299" />
          <Text style={styles.navText}>Candidatos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('OrgProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#7a8299" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f4',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#1a2744',
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h2,
    color: 'white',
  },
  createButton: {
    backgroundColor: '#d4813a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  createButtonText: {
    ...typography.button,
    color: 'white',
  },
  tabsWrapper: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd8ce',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#d4813a',
  },
  tabLabel: {
    ...typography.button,
    color: '#7a8299',
  },
  activeTabLabel: {
    color: '#1a2744',
    fontWeight: 'bold',
  },
  tabCount: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#faf8f4',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1a2744',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: '#3a4560',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 16,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd8ce',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#fdf5ec',
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    ...typography['label-sm'],
    color: '#d4813a',
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    ...typography['label-sm'],
    fontWeight: 'bold',
  },
  cardTitle: {
    ...typography.button,
    color: '#1a2744',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    ...typography['label-sm'],
    color: '#3a4560',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    ...typography['label-sm'],
    color: '#3a4560',
  },
  progressValue: {
    ...typography['label-sm'],
    fontWeight: 'bold',
    color: '#1a2744',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#ddd8ce',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1a2744',
    borderRadius: 3,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#1a2744',
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    ...typography.label,
    color: '#1a2744',
  },
  outlineDangerButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineDangerButtonText: {
    ...typography.label,
    color: '#ef4444',
  },
  solidDarkButton: {
    flex: 1,
    backgroundColor: '#1a2744',
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidDarkButtonText: {
    ...typography.label,
    color: 'white',
  },
  solidBrandButton: {
    flex: 1,
    backgroundColor: '#d4813a',
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidBrandButtonText: {
    ...typography.label,
    color: 'white',
  },
  footerInfo: {
    ...typography['body-sm'],
    color: '#7a8299',
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
    backgroundColor: '#1a2744',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1a2744',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd8ce',
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
    ...typography['label-sm'],
    color: '#7a8299',
    marginTop: 4,
  }
});
