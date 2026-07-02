import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { radius } from '../../theme/spacing';

interface CategoryPillProps {
  label: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export default function CategoryPill({ label, count, isSelected, onPress, color, icon }: CategoryPillProps) {
  const iconColor = isSelected ? '#fff' : (color ?? colors.text.secondary);
  return (
    <TouchableOpacity
      testID="category-pill"
      onPress={onPress}
      style={[
        styles.pill,
        isSelected ? styles.pillSelected : styles.pillUnselected,
        color && isSelected ? { borderColor: color } : null,
      ]}
      activeOpacity={0.7}
    >
      <View
        testID={isSelected ? 'category-pill-selected' : 'category-pill-unselected'}
        style={styles.inner}
      >
        {icon && <Ionicons name={icon} size={14} color={iconColor} />}
        <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
        <View style={[styles.countBadge, isSelected ? styles.countBadgeSelected : styles.countBadgeUnselected]}>
          <Text style={[styles.count, isSelected && styles.countSelected]}>{String(count)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 36,
    justifyContent: 'center',
    borderRadius: radius.round,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  pillUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ddd8ce',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fontFamilies.dmSansMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: '#fff',
  },
  countBadge: {
    borderRadius: radius.round,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  countBadgeUnselected: {
    backgroundColor: '#e8e0d0',
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  count: {
    fontFamily: fontFamilies.dmSansBold,
    fontSize: 10,
    color: colors.text.secondary,
  },
  countSelected: {
    color: '#fff',
  },
});
