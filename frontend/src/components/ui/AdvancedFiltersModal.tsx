import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

export interface AdvancedFilters {
  location: string;
  workload_max: string;
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onApply: (filters: AdvancedFilters) => void;
  onClose: () => void;
}

/** Basic advanced-filters sheet: location (text) + max workload (Issue #20 C5). */
export default function AdvancedFiltersModal({
  visible,
  onApply,
  onClose,
}: AdvancedFiltersModalProps) {
  const [location, setLocation] = useState('');
  const [workloadMax, setWorkloadMax] = useState('');

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filtros avançados</Text>
            <TouchableOpacity testID="filter-close-button" onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Localização</Text>
          <TextInput
            testID="filter-location-input"
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Cidade, estado..."
            placeholderTextColor={colors.text.secondary}
          />

          <Text style={styles.fieldLabel}>Carga horária máxima</Text>
          <TextInput
            testID="filter-workload-input"
            style={styles.input}
            value={workloadMax}
            onChangeText={setWorkloadMax}
            placeholder="Ex.: 10"
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
          />

          <TouchableOpacity
            testID="filter-apply-button"
            style={styles.applyBtn}
            onPress={() => onApply({ location, workload_max: workloadMax })}
          >
            <Text style={styles.applyText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,25,41,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.info,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text.primary,
  },
  applyBtn: {
    backgroundColor: colors.brand.navy,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  applyText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
