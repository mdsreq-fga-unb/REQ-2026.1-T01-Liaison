import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  NotificationData,
} from '../services/notifications';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';

function iconForType(type: NotificationData['type']): React.ComponentProps<typeof Ionicons>['name'] {
  switch (type) {
    case 'application_approved': return 'checkmark-circle-outline';
    case 'application_rejected': return 'close-circle-outline';
    case 'new_application':      return 'person-add-outline';
  }
}

function iconColorForType(type: NotificationData['type']): string {
  switch (type) {
    case 'application_approved': return colors.success;
    case 'application_rejected': return '#9b1c1c';
    case 'new_application':      return colors.brand.gold;
  }
}

function iconBgForType(type: NotificationData['type']): string {
  switch (type) {
    case 'application_approved': return '#ebf7f1';
    case 'application_rejected': return '#fdecea';
    case 'new_application':      return colors.accent.lightBg;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return 'Agora';
    if (diffMin < 60) return `${diffMin} min atrás`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h atrás`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7)    return `${diffD}d atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

type Section = { title: string; data: NotificationData[] };

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const data = await getNotifications(accessToken);
      setNotifications(data.results);
      setUnreadCount(data.unread_count);
    } catch {
      // fail silently — user sees empty state
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]));

  const handleRead = async (item: NotificationData) => {
    if (item.is_read || !accessToken) return;
    try {
      await markAsRead(accessToken, item.id);
      setNotifications(prev =>
        prev.map(n => n.id === item.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!accessToken) return;
    try {
      await markAllAsRead(accessToken);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const sections = useMemo<Section[]>(() => {
    const unread = notifications.filter(n => !n.is_read);
    const read   = notifications.filter(n => n.is_read);
    const result: Section[] = [];
    if (unread.length) result.push({ title: 'Novas', data: unread });
    if (read.length)   result.push({ title: 'Anteriores', data: read });
    return result;
  }, [notifications]);

  const unreadLabel = unreadCount === 1 ? '1 não lida' : `${unreadCount} não lidas`;

  const renderCard = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      onPress={() => handleRead(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBgForType(item.type) }]}>
        <Ionicons name={iconForType(item.type)} size={18} color={iconColorForType(item.type)} />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={[styles.cardTitle, item.is_read && styles.cardTitleRead]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionLabel}>{section.title}</Text>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.header.gradientFrom, colors.header.gradientTo]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
      >
        <View style={styles.ringTopRight} />
        <View style={styles.ringBottomLeft} />

        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>{unreadLabel.toUpperCase()}</Text>
            )}
            <Text style={styles.headerTitle}>Notificações</Text>
          </View>
          <View style={styles.headerRightSpacer} />
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllWrap}>
            <Text style={styles.markAllText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.navy} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Nenhuma notificação</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  ringTopRight: {
    position: 'absolute',
    right: -10,
    top: -34,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.14)',
  },
  ringBottomLeft: {
    position: 'absolute',
    left: -26,
    bottom: -10,
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    gap: 3,
  },
  headerSubtitle: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.88,
  },
  headerTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 21,
    color: '#fff',
    lineHeight: 26,
  },
  headerRightSpacer: {
    width: 36,
    flexShrink: 0,
  },
  markAllWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  markAllText: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 12,
    color: '#f0b070',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 11,
    color: colors.text.secondary,
    letterSpacing: 0.44,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    paddingTop: 4,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ece7dc',
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: '#f4f7fc',
    borderColor: '#dde6f3',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 13.5,
    color: colors.text.primary,
    lineHeight: 20,
  },
  cardTitleRead: {
    fontFamily: fontFamilies.dmSansSemiBold,
  },
  cardMessage: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 12.5,
    color: '#5f6b82',
    lineHeight: 17.5,
  },
  cardDate: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    color: '#9aa3b5',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand.gold,
    flexShrink: 0,
  },
  emptyText: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 12,
  },
});
