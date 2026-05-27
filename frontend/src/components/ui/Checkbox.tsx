import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  testID?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  error,
  testID = 'checkbox',
}: CheckboxProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        testID={testID}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={styles.row}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.box,
            checked ? styles.boxChecked : styles.boxUnchecked,
          ]}
        >
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxUnchecked: {
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  boxChecked: {
    backgroundColor: colors.brand.navy,
    borderColor: colors.brand.navy,
  },
  checkmark: {
    color: colors.neutral.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 28,
  },
});
