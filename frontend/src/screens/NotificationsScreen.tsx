import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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

function colorForType(type: NotificationData['type']): string {
  switch (type) {
    case 'application_approved': return colors.success;
    case 'application_rejected': return '#9b1c1c';
    case 'new_application':      return colors.brand.gold;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)   return 'Agora';
    if (diffMin < 60)  return `${diffMin} min atrás`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)    return `${diffH}h atrás`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7)     return `${diffD}d atrás`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

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

  const renderCard = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      onPress={() => handleRead(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.typeIconWrap, { backgroundColor: colorForType(item.type) + '18' }]}>
        <Ionicons name={iconForType(item.type)} size={20} color={colorForType(item.type)} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.opportunity_title ? (
          <Text style={styles.cardOpportunity} numberOfLines={1}>{item.opportunity_title}</Text>
        ) : null}
        <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.markAllButton} />
        )}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brand.navy} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  header: {
    backgroundColor: colors.brand.navy,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 18,
    color: '#fff',
  },
  markAllButton: {
    minWidth: 90,
    alignItems: 'flex-end',
  },
  markAllText: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 13,
    color: colors.brand.gold,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  cardUnread: {
    backgroundColor: '#eef2ff',
    borderColor: 'rgba(99,102,241,0.2)',
  },
  typeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: fontFamilies.dmSansSemiBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  cardOpportunity: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 12,
    color: colors.brand.gold,
  },
  cardMessage: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 13,
    color: colors.text.info,
    lineHeight: 18,
  },
  cardDate: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginTop: 6,
    flexShrink: 0,
  },
  emptyText: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 12,
  },
});
