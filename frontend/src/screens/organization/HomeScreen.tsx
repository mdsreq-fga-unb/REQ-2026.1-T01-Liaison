import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  FlatList, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import * as api from '../../services/api';
import { OpportunityData } from '../../services/api';

type FilterTab = 'all' | 'active' | 'draft' | 'closed';

export default function OrgHomeScreen() {
  const navigation = useNavigation<any>();
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
        const data = await api.getOrgOpportunities(accessToken);
        setOpportunities(data);
      }
    } catch (err: any) {
      setError('Erro ao carregar vagas');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const getCategoryIcon = (area: string) => {
    if (!area) return '📋';
    if (area.toLowerCase().includes('edu')) return '📚';
    if (area.toLowerCase().includes('saúd') || area.toLowerCase().includes('saud')) return '🏥';
    if (area.toLowerCase().includes('tec')) return '💻';
    if (area.toLowerCase().includes('social')) return '🤝';
    return '📋';
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesTab = activeTab === 'all' || opp.status === activeTab;
    const matchesSearch = opp.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderCard = ({ item }: { item: OpportunityData }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <View style={styles.cardContainer}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{getCategoryIcon(item.area)} {(item.area || 'Geral').toUpperCase()}</Text>
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
              {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Data a definir'}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="time-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>{item.workload_hours}h{item.workload_type === 'weekly' ? '/semana' : ''}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Ionicons name="location-outline" size={14} color="#3a4560" />
            <Text style={styles.metadataText}>
              {item.location_type === 'remote' ? 'Remoto' : `Presencial · ${item.state || 'DF'}`}
            </Text>
          </View>
        </View>

        {/* Progress Bar (Mocked for now as we don't have filled_spots in response yet) */}
        {item.status !== 'closed' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Vagas</Text>
              <Text style={styles.progressValue}>{item.filled_spots || 0} de {item.available_spots}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((item.filled_spots || 0) / item.available_spots) * 100, 100)}%` }]} />
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          {item.status === 'draft' ? (
            <>
              <TouchableOpacity 
                style={styles.outlineButton}
                onPress={() => navigation.navigate('CreateOpportunity', { id: item.id })}
              >
                <Text style={styles.outlineButtonText}>Continuar editando</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.solidDarkButton}>
                <Text style={styles.solidDarkButtonText}>Publicar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.outlineButton}
                onPress={() => Alert.alert('Em breve', 'A tela de candidatos ainda não foi implementada.')}
              >
                <Text style={styles.outlineButtonText}>Ver Candidatos ({(item.filled_spots || 0)})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.solidBrandButton}>
                <Text style={styles.solidBrandButtonText}>{item.status === 'closed' ? 'Republicar' : 'Editar'}</Text>
              </TouchableOpacity>
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
      {/* Banner Superior */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Vagas</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateOpportunity')}
        >
          <Ionicons name="add" size={16} color="white" />
          <Text style={styles.createButtonText}>Criar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
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
          <ActivityIndicator size="large" color={colors.brand.primary} />
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
        style={styles.fab}
        onPress={() => navigation.navigate('CreateOpportunity')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd8ce',
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
    color: '#7a8299',
    fontSize: 14,
    fontWeight: '600',
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
    flex: 1,
    fontSize: 14,
    color: '#3a4560',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
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
    color: '#d4813a',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a2744',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#3a4560',
    fontWeight: '500',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#3a4560',
  },
  progressValue: {
    fontSize: 12,
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
    color: '#1a2744',
    fontSize: 13,
    fontWeight: 'bold',
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
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
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
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  footerInfo: {
    fontSize: 11,
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
    fontSize: 16,
    color: '#7a8299',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
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
    height: 60,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd8ce',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#7a8299',
    marginTop: 4,
  }
});
