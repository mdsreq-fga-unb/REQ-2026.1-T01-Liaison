import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

interface CategoryPillProps {
  label: string;
  count: number;
  isSelected: boolean;
  onPress: () => void;
  color?: string;
}

export default function CategoryPill({ label, count, isSelected, onPress, color }: CategoryPillProps) {
  return (
    <TouchableOpacity
      testID="category-pill"
      onPress={onPress}
      style={[
        styles.pill,
        isSelected ? styles.pillSelected : styles.pillUnselected,
        color ? { borderColor: color } : null,
      ]}
      activeOpacity={0.7}
    >
      {isSelected ? (
        <View testID="category-pill-selected" style={styles.inner}>
          <Text style={[styles.label, styles.labelSelected]}>{label}</Text>
          <Text style={[styles.count, styles.countSelected]}>{String(count)}</Text>
        </View>
      ) : (
        <View testID="category-pill-unselected" style={styles.inner}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.count}>{String(count)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.gold,
  },
  pillUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ddd8ce',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: '#1a2744',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#fff',
  },
  count: {
    fontSize: 11,
    color: '#7a8299',
  },
  countSelected: {
    color: '#d4813a',
  },
});
