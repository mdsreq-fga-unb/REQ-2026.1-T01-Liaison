import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';
import { radius } from '../../theme/spacing';

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value?: string;
  placeholder?: string;
  onFilterPress?: () => void;
}

export default function SearchBar({
  onChangeText,
  value,
  placeholder = 'Buscar por tema, ONG, local...',
  onFilterPress,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
      <TextInput
        testID="search-bar-input"
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
      />
      {onFilterPress && (
        <TouchableOpacity
          testID="search-filter-button"
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={16} color={colors.text.secondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 12,
    gap: 12,
    shadowColor: colors.brand.navy,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontFamily: fontFamilies.dmSansRegular,
    fontSize: 13,
    color: colors.brand.navy,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
