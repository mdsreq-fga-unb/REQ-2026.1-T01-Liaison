import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface PasswordStrengthIndicatorProps {
  password: string;
  testID?: string;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function getStrength(password: string): StrengthLevel {
  if (!password) return 0;
  const hasLength = password.length >= 8;
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);

  if (!hasLength) return 1; // too short → weak (1 bar)
  if (hasLetters && hasNumbers) return 4; // full strength
  if (hasLetters || hasNumbers) return 2; // only one type → medium
  return 1;
}

function getLabel(strength: StrengthLevel): string {
  if (strength === 0) return '';
  if (strength === 1) return 'Fraca';
  if (strength === 2) return 'Média';
  if (strength === 3) return 'Boa';
  return 'Forte';
}

const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#3b82f6', '#1d7a4a'];

export default function PasswordStrengthIndicator({
  password,
  testID = 'password-strength-indicator',
}: PasswordStrengthIndicatorProps) {
  const strength = getStrength(password);
  const label = getLabel(strength);
  const color = strengthColors[strength];

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((barIndex) => {
          const filled = strength >= barIndex;
          return (
            <View
              key={barIndex}
              testID={filled ? 'strength-bar-filled' : 'strength-bar-empty'}
              style={[
                styles.bar,
                { backgroundColor: filled ? color : '#e5e7eb' },
              ]}
            />
          );
        })}
      </View>
      {label ? (
        <Text style={[styles.label, { color }]}>
          Força: {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    ...typography['body-sm'],
    marginTop: 4,
  },
});
