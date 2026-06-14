import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';

interface SearchBarProps {
  onChangeText: (text: string) => void;
  value?: string;
  placeholder?: string;
}

export default function SearchBar({ onChangeText, value, placeholder = 'Buscar vagas...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
      <TextInput
        testID="search-bar-input"
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd8ce',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a2744',
  },
});
