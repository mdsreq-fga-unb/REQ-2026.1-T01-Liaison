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
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography, fontFamilies } from '../../theme/typography';
import { getMyOpportunities, publishOpportunity, closeOpportunity, reopenOpportunity, deleteOpportunity } from '../../services/opportunities';
import OrgHeader from '../../components/ui/OrgHeader';

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
  const { accessToken } = useAuth();

  const [opportunities, setOpportunities] = useState<OpportunityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<OpportunityData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      if (accessToken) {
        const data = await getMyOpportunities(accessToken);
        setOpportunities(Array.isArray(data) ? data : (data?.results ?? []));
      }
    } catch (err: any) {
      setError('Erro ao carregar oportunidades');
      console.warn('API Opportunities Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      if (accessToken) {
        await publishOpportunity(accessToken, id);
        Alert.alert('Sucesso', 'Sua oportunidade foi publicada com sucesso!');
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
        Alert.alert('Sucesso', 'A oportunidade foi encerrada.');
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
        Alert.alert('Sucesso', 'Sua oportunidade foi reaberta!');
        fetchOpportunities();
      }
    } catch (err: any) {
      Alert.alert('Atenção', err.message);
    }
  };

  const confirmDelete = (item: OpportunityData) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!accessToken || !deleteTarget) return;
    try {
      setDeleting(true);
      await deleteOpportunity(accessToken, deleteTarget.id);
      setDeleteTarget(null);
      fetchOpportunities();
    } catch (err: any) {
      Alert.alert('Erro', err.message ?? 'Falha ao excluir rascunho');
    } finally {
      setDeleting(false);
    }
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
                style={[styles.cardActionBtn, styles.cardActionBtnFull]}
                onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
              >
                <View style={[styles.cardActionBtnInner, styles.cardActionGoldOutline]}>
                  <Text style={styles.cardActionGoldOutlineText}>Continuar editando</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => handlePublish(item.id)}
              >
                <View style={[styles.cardActionBtnInner, styles.cardActionNavy]}>
                  <Text style={styles.cardActionNavyText}>Publicar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => confirmDelete(item)}
              >
                <View style={[styles.cardActionBtnInner, styles.cardActionRedOutline]}>
                  <Text style={styles.cardActionRedOutlineText}>Excluir</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'active' && (
            <>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => navigation.navigate('CreateOpportunity', { draft: item })}
              >
                <View style={[styles.cardActionBtnInner, styles.cardActionGold]}>
                  <Text style={styles.cardActionGoldText}>Editar</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cardActionBtn}
                onPress={() => handleClose(item.id)}
              >
                <View style={[styles.cardActionBtnInner, styles.cardActionRedOutline]}>
                  <Text style={styles.cardActionRedOutlineText}>Encerrar</Text>
                </View>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'closed' && (
            <TouchableOpacity
              style={[styles.cardActionBtn, styles.cardActionBtnSingle]}
              onPress={() => handleReopen(item.id)}
            >
              <View style={[styles.cardActionBtnInner, styles.cardActionNavyOutline]}>
                <Text style={styles.cardActionNavyOutlineText}>Reabrir</Text>
              </View>
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
      {/* Header */}
      <OrgHeader
        eyebrow="Painel da organização"
        title="Minhas"
        accent="oportunidades"
        right={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateOpportunity')}
          >
            <Ionicons name="add" size={14} color="white" />
            <Text style={styles.createButtonText}>Criar</Text>
          </TouchableOpacity>
        }
      />

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
            placeholder="Buscar oportunidades..."
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
              <Text style={styles.emptyText}>Nenhuma oportunidade encontrada.</Text>
            </View>
          }
        />
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="warning-outline" size={28} color="#c0392b" />
            </View>
            <Text style={styles.modalTitle}>Excluir rascunho?</Text>
            <Text style={styles.modalBody}>
              {'Tem certeza que deseja excluir o rascunho '}
              <Text style={styles.modalBodyBold}>{deleteTarget?.title}</Text>
              {'? Esta ação não pode ser desfeita.'}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnBack]}
                onPress={() => setDeleteTarget(null)}
                activeOpacity={0.7}
                disabled={deleting}
              >
                <Text style={styles.modalBtnBackText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirm-delete-button"
                style={[styles.modalBtn, styles.modalBtnConfirm, deleting && { opacity: 0.6 }]}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Sim, excluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  cardActionBtn: {
    flex: 1,
    minWidth: 90,
  },
  cardActionBtnSingle: {
    width: '100%',
  },
  cardActionBtnFull: {
    flexBasis: '100%',
  },
  cardActionBtnInner: {
    borderRadius: 999,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  cardActionNavy: {
    backgroundColor: colors.brand.navy,
  },
  cardActionNavyText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  cardActionGold: {
    backgroundColor: colors.brand.gold,
  },
  cardActionGoldText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  cardActionGoldOutline: {
    borderWidth: 1,
    borderColor: colors.brand.gold,
  },
  cardActionGoldOutlineText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: colors.brand.gold,
    textAlign: 'center',
  },
  cardActionRedOutline: {
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  cardActionRedOutlineText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: '#c0392b',
    textAlign: 'center',
  },
  cardActionNavyOutline: {
    borderWidth: 1,
    borderColor: colors.brand.navy,
  },
  cardActionNavyOutlineText: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 12,
    color: colors.brand.navy,
    textAlign: 'center',
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(13,20,36,0.55)', alignItems: 'center', justifyContent: 'center' },
  modalCard: {
    width: 322, backgroundColor: colors.neutral.white,
    borderRadius: 22, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 20,
    alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28, shadowRadius: 22, elevation: 12,
  },
  modalIconWrap: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#fdecea', alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 19, color: colors.text.primary, textAlign: 'center' },
  modalBody: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.secondary, textAlign: 'center', lineHeight: 19.5, width: 278 },
  modalBodyBold: { fontFamily: fontFamilies.dmSansBold },
  modalBtns: { flexDirection: 'row', gap: 10, paddingTop: 6, width: 278 },
  modalBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalBtnBack: { borderWidth: 1, borderColor: colors.brand.navy, backgroundColor: colors.neutral.white },
  modalBtnBackText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.brand.navy },
  modalBtnConfirm: { backgroundColor: '#c0392b' },
  modalBtnConfirmText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.neutral.white },
});
