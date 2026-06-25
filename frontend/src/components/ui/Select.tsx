import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { components, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  testID?: string;
  hideLabel?: boolean;
  required?: boolean;
  /** Optional chevron SVG component for the dropdown */
  chevronIcon?: React.ReactNode;
  /** Optional component width override (e.g. for side-by-side selects) */
  width?: import('react-native').DimensionValue;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione',
  error,
  testID = 'select-trigger',
  hideLabel = false,
  required = false,
  chevronIcon,
  width,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={[styles.container, width ? { width } : undefined]}>
      {!hideLabel && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        testID={testID}
        onPress={() => { setOpen(!open); }}
        style={[
          styles.trigger,
          error ? styles.triggerError : styles.triggerNormal,
          open && styles.triggerFocused,
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.triggerText, !selectedOption && styles.placeholder]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {chevronIcon ? (
          chevronIcon
        ) : (
          <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {open && (
        <View style={styles.dropdown}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={[styles.option, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.formGap,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.labelGap,
  },
  required: {
    color: colors.brand.gold,
  },
  trigger: {
    height: components.input.height,
    borderRadius: components.input.borderRadius,
    borderWidth: components.input.borderWidth,
    paddingHorizontal: components.input.paddingHorizontal,
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerNormal: {
    borderColor: colors.neutral.border,
  },
  triggerFocused: {
    borderColor: colors.brand.navy,
  },
  triggerError: {
    borderColor: '#ef4444',
  },
  triggerText: {
    ...typography.input,
    color: colors.text.primary,
    flex: 1,
  },
  placeholder: {
    color: colors.text.secondary,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderRadius: 8,
    backgroundColor: colors.neutral.white,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 10,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0ede6',
  },
  optionSelected: {
    backgroundColor: colors.accent.lightBg,
  },
  optionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.brand.navy,
    fontFamily: typography.button.fontFamily,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
