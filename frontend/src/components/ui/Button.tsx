import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { components } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'disabled'> {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
  /** Optional right icon */
  rightIcon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  testID = 'button-touchable',
  rightIcon,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      accessibilityRole="button"
      style={[
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.neutral.white : colors.brand.navy}
        />
      ) : (
        <>
          <View style={styles.contentRow}>
            <Text
              style={[
                typography.button,
                variant === 'primary' ? styles.textPrimary : styles.textSecondary,
                styles.buttonText,
              ]}
            >
              {title}
            </Text>
            {rightIcon}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: components.button.height,
    borderRadius: components.button.borderRadius,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primary: {
    backgroundColor: colors.brand.navy,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.brand.navy,
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    color: colors.neutral.white,
  },
  textSecondary: {
    color: colors.brand.navy,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
});
