import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

interface OrgHeaderProps {
  title: string;
  accent?: string;
  eyebrow?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: keyof typeof Ionicons.glyphMap;
  backTestID?: string;
  onBell?: () => void;
  bellCount?: number;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function OrgHeader({
  title,
  accent,
  eyebrow,
  subtitle,
  onBack,
  backIcon = 'chevron-back',
  backTestID,
  onBell,
  bellCount,
  right,
  style,
}: OrgHeaderProps) {
  const insets = useSafeAreaInsets();

  const rightNode =
    right ??
    (onBell ? (
      <TouchableOpacity style={styles.btn} onPress={onBell} accessibilityLabel="Notificações">
        <Ionicons name="notifications-outline" size={18} color="white" />
        {bellCount != null && bellCount > 0 && (
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>{bellCount > 9 ? '9+' : bellCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    ) : null);

  return (
    <LinearGradient
      colors={['#1a2744', '#111c38', '#0f1729']}
      locations={[0.15, 0.57, 0.84]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 20 }, style]}
    >
      <View style={styles.ring} pointerEvents="none" />
      <View style={styles.ringSmall} pointerEvents="none" />

      <View style={styles.row}>
        {!!onBack && (
          <TouchableOpacity
            style={styles.btn}
            onPress={onBack}
            accessibilityLabel="Voltar"
            testID={backTestID}
          >
            <Ionicons name={backIcon} size={18} color="white" />
          </TouchableOpacity>
        )}

        <View style={styles.titleBlock}>
          {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>}
          <Text style={styles.title} numberOfLines={2}>
            {title}
            {!!accent && <Text style={styles.accent}>{title ? ' ' : ''}{accent}</Text>}
          </Text>
          {!!subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightNode}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    top: -34,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(212,129,58,0.14)',
  },
  ringSmall: {
    position: 'absolute',
    top: 55,
    left: -26,
    width: 104,
    height: 104,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
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
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand.gold,
    borderWidth: 2,
    borderColor: '#1a2744',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: 'white',
    fontSize: 9,
    fontFamily: fontFamilies.dmSansBold,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 0.88,
    fontFamily: fontFamilies.dmSansSemiBold,
  },
  title: {
    color: 'white',
    fontSize: 21,
    lineHeight: 24,
    fontFamily: fontFamilies.playfairBold,
  },
  accent: {
    color: '#f0b070',
    fontFamily: fontFamilies.playfairBoldItalic,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: fontFamilies.dmSansRegular,
    marginTop: 1,
  },
});
