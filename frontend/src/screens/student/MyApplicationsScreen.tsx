import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import NotificationBell from '../../components/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { getMyApplications } from '../../services/applications';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'cancelled';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Aguardando' },
  { key: 'approved', label: 'Aprovadas' },
  { key: 'rejected', label: 'Rejeitadas' },
  { key: 'cancelled', label: 'Canceladas' },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Aguardando', bg: '#fbf3e3', color: '#b5791f' },
  approved:  { label: 'Aprovada',   bg: '#ebf7f1', color: '#1d7a4a' },
  rejected:  { label: 'Rejeitada',  bg: '#fdecea', color: '#c0392b' },
  cancelled: { label: 'Cancelada',  bg: '#eef0f3', color: colors.text.secondary },
};

const MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

interface ApplicationItem {
  id: string;
  opportunity: {
    id: string;
    title: string;
    status: string;
    organization: { user_id: string; razao_social: string };
  };
  status: string;
  created_at: string;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const d = value.slice(0, 10).split('-');
  if (d.length !== 3) return value;
  const month = MONTHS[parseInt(d[1], 10) - 1] ?? d[1];
  return `${parseInt(d[2], 10)} ${month} ${d[0]}`;
}

export default function MyApplicationsScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ApplicationItem | null>(null);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const filteredItems = useMemo(
    () => activeTab === 'all' ? items : items.filter(i => i.status === activeTab),
    [items, activeTab],
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const tab of TABS) {
      if (tab.key !== 'all') counts[tab.key] = items.filter(i => i.status === tab.key).length;
    }
    return counts;
  }, [items]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a2744', '#111c38', '#0f1729']} style={styles.header}>
        <View pointerEvents="none" style={styles.ringTopRight} />
        <View pointerEvents="none" style={styles.ringBottomLeft} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            testID="back-button"
            style={styles.glassBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerSubtitle}>ACOMPANHE SEUS PROCESSOS</Text>
            <Text style={styles.headerTitle}>
              {'Minhas '}
              <Text style={styles.headerTitleAccent}>candidaturas</Text>
            </Text>
          </View>

          <NotificationBell
            iconSize={18}
            iconColor="#fff"
            containerStyle={styles.glassBtn}
            onNavigate={() => navigation.navigate('Notifications')}
          />
        </View>
      </LinearGradient>

      {/* Filter tabs */}
      <View style={styles.tabsRow}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={tab => tab.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item: tab }) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                testID={`tab-${tab.key}`}
                style={[styles.tab, active && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
                <View style={[styles.tabBadge, active && styles.activeTabBadge]}>
                  <Text style={[styles.tabBadgeText, active && styles.activeTabBadgeText]}>
                    {tabCounts[tab.key] ?? 0}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Cards */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand.navy]} />
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
          const org = item.opportunity.organization;
          const isPending = item.status === 'pending';

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>
                    {cfg.label.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.cardTitle}>{item.opportunity.title}</Text>

                <TouchableOpacity
                  onPress={org?.user_id
                    ? () => navigation.navigate('PublicOrgProfile', { orgId: org.user_id })
                    : undefined}
                  activeOpacity={org?.user_id ? 0.6 : 1}
                >
                  <Text style={styles.cardOrg}>{org?.razao_social ?? ''}</Text>
                </TouchableOpacity>

                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.dateText}>Candidatura em {formatDate(item.created_at)}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={[styles.footerBtn, styles.footerBtnOutline]}
                  onPress={() => navigation.navigate('OpportunityDetail', { id: item.opportunity.id })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerBtnOutlineText}>Ver vaga</Text>
                </TouchableOpacity>

                {isPending && (
                  <TouchableOpacity
                    style={[styles.footerBtn, styles.footerBtnCancel]}
                    onPress={() => setCancelTarget(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={15} color="#c0392b" />
                    <Text style={styles.footerBtnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View testID="empty-state" style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="document-text-outline" size={44} color={colors.text.secondary} />
            </View>
            <Text style={styles.emptyTitle}>
              {items.length === 0
                ? 'Você ainda não tem candidaturas'
                : 'Nenhuma candidatura com esse status'}
            </Text>
            {items.length === 0 && (
              <Text style={styles.emptySubtitle}>
                Explore as vagas de voluntariado e candidate-se às que combinam com você. Elas aparecerão aqui.
              </Text>
            )}
            {items.length === 0 && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('SearchOpportunities')}
                activeOpacity={0.8}
              >
                <Ionicons name="search-outline" size={16} color={colors.neutral.white} />
                <Text style={styles.emptyBtnText}>Buscar vagas</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Cancel confirmation modal */}
      <Modal
        visible={!!cancelTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setCancelTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="close-circle" size={28} color="#c0392b" />
            </View>
            <Text style={styles.modalTitle}>Cancelar candidatura?</Text>
            <Text style={styles.modalBody}>
              {'Tem certeza que deseja cancelar sua candidatura para '}
              <Text style={styles.modalBodyBold}>{cancelTarget?.opportunity.title}</Text>
              {'? Esta ação não pode ser desfeita.'}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnBack]}
                onPress={() => setCancelTarget(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnBackText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={() => {
                  // ponytail: cancel API (US2.9) not implemented yet
                  setCancelTarget(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnConfirmText}>Sim, cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.neutral.bg },

  header: { paddingTop: 54, paddingBottom: 16, paddingHorizontal: 20, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  glassBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerText: { flex: 1, gap: 3 },
  headerSubtitle: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11, letterSpacing: 0.88, textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  headerTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 21, color: '#fff' },
  headerTitleAccent: { fontFamily: fontFamilies.playfairBoldItalic, fontSize: 21, color: '#f0b070' },
  ringTopRight: {
    position: 'absolute', top: -34, right: -30,
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderColor: 'rgba(212,129,58,0.14)',
  },
  ringBottomLeft: {
    position: 'absolute', bottom: -20, left: -26,
    width: 104, height: 104, borderRadius: 52,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },

  tabsRow: {
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1, borderBottomColor: colors.neutral.border,
  },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 13, height: 36,
    borderRadius: radius.round,
    backgroundColor: colors.neutral.white,
    borderWidth: 1, borderColor: colors.neutral.border,
  },
  activeTab: { backgroundColor: colors.brand.navy, borderColor: colors.brand.navy },
  tabLabel: { fontFamily: fontFamilies.dmSansMedium, fontSize: 13, color: colors.text.secondary },
  activeTabLabel: { color: colors.neutral.white },
  tabBadge: {
    minWidth: 20, height: 16, borderRadius: radius.round,
    backgroundColor: '#e8e0d0',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  activeTabBadge: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabBadgeText: { fontFamily: fontFamilies.dmSansBold, fontSize: 10, color: colors.text.secondary },
  activeTabBadgeText: { color: colors.neutral.white },

  list: { padding: 20, gap: 14, flexGrow: 1 },

  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.neutral.border,
    overflow: 'hidden',
  },
  cardTop: { padding: 16, gap: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radius.round,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 10, letterSpacing: 0.4 },
  cardTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 17, color: colors.text.primary },
  cardOrg: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13, color: colors.text.secondary },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dateText: { fontFamily: fontFamilies.dmSansRegular, fontSize: 12.5, color: colors.text.secondary },

  cardFooter: {
    flexDirection: 'row', gap: 8,
    borderTopWidth: 1, borderTopColor: '#ece7dc',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  footerBtn: {
    flex: 1, height: 36, borderRadius: radius.sm,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  footerBtnOutline: { borderWidth: 1, borderColor: colors.brand.navy, backgroundColor: colors.neutral.white },
  footerBtnOutlineText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.brand.navy },
  footerBtnCancel: { borderWidth: 1, borderColor: '#c0392b', backgroundColor: colors.neutral.white },
  footerBtnCancelText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: '#c0392b' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 60, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 104, height: 104, borderRadius: 52,
    backgroundColor: '#f0ece3',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: fontFamilies.playfairBold, fontSize: 19, color: colors.text.primary, textAlign: 'center' },
  emptySubtitle: { fontFamily: fontFamilies.dmSansRegular, fontSize: 13.5, color: colors.text.secondary, textAlign: 'center', lineHeight: 19.5 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.brand.navy,
    paddingVertical: 13, paddingHorizontal: 26,
    borderRadius: 10,
  },
  emptyBtnText: { fontFamily: fontFamilies.dmSansSemiBold, fontSize: 13, color: colors.neutral.white },

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
