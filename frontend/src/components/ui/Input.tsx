import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { components, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface InputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  testID?: string;
  hideLabel?: boolean;
  required?: boolean;
  containerStyle?: any;
}

const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    label,
    value,
    onChangeText,
    error,
    testID = 'input-field',
    style,
    containerStyle,
    secureTextEntry,
    hideLabel = false,
    required = false,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {!hideLabel && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        ref={ref}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        accessibilityLabel={hideLabel ? label : undefined}
        placeholderTextColor={colors.text.secondary}
        onFocus={(e) => {
          setIsFocused(true);
          onFocusProp?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlurProp?.(e);
        }}
        style={[
          styles.input,
          typography.input,
          styles.inputNormal,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

export default Input;

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
    paddingTop: 14,
    paddingBottom: 14,
    color: colors.text.primary,
    backgroundColor: colors.neutral.white,
  },
  inputNormal: {
    borderColor: colors.neutral.border,
  },
  inputFocused: {
    borderColor: colors.brand.navy,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontFamily: typography.body.fontFamily,
  },
});
