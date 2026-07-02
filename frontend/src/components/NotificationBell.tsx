import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/notifications';

interface NotificationBellProps {
  iconColor?: string;
  iconSize?: number;
  containerStyle?: StyleProp<ViewStyle>;
  onNavigate: () => void;
}

export default function NotificationBell({
  iconColor = '#fff',
  iconSize = 22,
  containerStyle,
  onNavigate,
}: NotificationBellProps) {
  const { accessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) return;
      getNotifications(accessToken)
        .then(data => setUnreadCount(data.unread_count))
        .catch(() => {});
    }, [accessToken])
  );

  return (
    <TouchableOpacity style={containerStyle} onPress={onNavigate} activeOpacity={0.7}>
      <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : String(unreadCount)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});
