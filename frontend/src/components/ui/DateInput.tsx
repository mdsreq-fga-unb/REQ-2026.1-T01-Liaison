import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { components, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface DateInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hideLabel?: boolean;
  required?: boolean;
  placeholder?: string;
  mode?: 'date' | 'time';
  containerStyle?: any;
}

const DateInput = ({
  label,
  value,
  onChangeText,
  error,
  hideLabel = false,
  required = false,
  placeholder = '',
  mode = 'date',
  containerStyle,
}: DateInputProps) => {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const parseValueToDate = (val: string) => {
    if (!val) return new Date();
    if (mode === 'date') {
      const parts = val.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      const parts = val.split(':');
      if (parts.length === 2) {
        const d = new Date();
        d.setHours(Number(parts[0]));
        d.setMinutes(Number(parts[1]));
        return d;
      }
    }
    return new Date();
  };

  // Web: picker nativo não existe → input digitável com máscara.
  const maskInput = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (mode === 'date') {
      const d = digits.slice(0, 8);
      let out = d.slice(0, 2);
      if (d.length > 2) out += '/' + d.slice(2, 4);
      if (d.length > 4) out += '/' + d.slice(4, 8);
      onChangeText(out);
    } else {
      const d = digits.slice(0, 4);
      let out = d.slice(0, 2);
      if (d.length > 2) out += ':' + d.slice(2, 4);
      onChangeText(out);
    }
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    setIsFocused(false);
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedDate) {
      if (mode === 'date') {
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        onChangeText(`${day}/${month}/${year}`);
      } else {
        const hours = selectedDate.getHours().toString().padStart(2, '0');
        const mins = selectedDate.getMinutes().toString().padStart(2, '0');
        onChangeText(`${hours}:${mins}`);
      }
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
        >
          <TextInput
            style={[styles.inputText, styles.inputTextWithIcon]}
            value={value}
            onChangeText={maskInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || (mode === 'date' ? 'DD/MM/AAAA' : 'HH:MM')}
            placeholderTextColor={colors.text.secondary}
            keyboardType="numeric"
            maxLength={mode === 'date' ? 10 : 5}
          />
          <Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={20} color={colors.text.secondary} style={styles.inputIcon} />
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.input,
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
          onPress={() => {
            setIsFocused(true);
            setShow(true);
          }}
        >
          <Text style={[styles.inputText, !value && styles.placeholderText, styles.inputTextWithIcon]}>
            {value || placeholder}
          </Text>
          <Ionicons name={mode === 'date' ? "calendar-outline" : "time-outline"} size={20} color={colors.text.secondary} style={styles.inputIcon} />
        </TouchableOpacity>
      )}

      {show && Platform.OS !== 'web' && (
        <DateTimePicker
          value={parseValueToDate(value)}
          mode={mode}
          display="default"
          onChange={onChange}
        />
      )}
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

export default DateInput;

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
  input: {
    height: components.input.height,
    borderRadius: components.input.borderRadius,
    borderWidth: components.input.borderWidth,
    paddingHorizontal: components.input.paddingHorizontal,
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputFocused: {
    borderColor: colors.brand.navy,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputText: {
    ...typography.input,
    color: colors.text.primary,
    flex: 1,
  },
  inputTextWithIcon: {
    paddingRight: 28,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  placeholderText: {
    color: colors.text.secondary,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: typography.body.fontFamily,
  },
});
