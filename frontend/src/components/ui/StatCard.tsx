import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamilies } from '../../theme/typography';

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

/** Header stat card: icon in a translucent square + value + label (Figma 32:2). */
export default function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <View testID="stat-card" style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={16} color="#d4813a" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.value} numberOfLines={1}>{String(value)}</Text>
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(212,129,58,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    fontFamily: fontFamilies.playfairBold,
    fontSize: 15,
    color: '#ffffff',
  },
  label: {
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(255,255,255,0.4)',
  },
});
