import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { colors } from '../../theme/colors';
import { radius, shadows } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface RadioCardProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Icon element (SVG component or Ionicons) */
  icon?: React.ReactNode;
  /** Optional category badge shown above the card */
  badge?: string;
  /** Optional badge accent color — defaults to gold */
  badgeColor?: string;
  testID?: string;
}

export default function RadioCard({
  title,
  description,
  selected,
  onPress,
  disabled = false,
  icon,
  badge,
  badgeColor = colors.brand.gold,
  testID = 'radio-card',
}: RadioCardProps) {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.contentRow}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <View style={styles.textContent}>
          {badge && (
            <View style={[styles.badge, { borderColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
          <Text style={[styles.title, disabled && styles.textDisabled]}>{title}</Text>
          <Text style={[styles.description, disabled && styles.textDisabled]}>
            {description}
          </Text>
        </View>
        <View
          style={[
            styles.radio,
            selected && styles.radioSelected,
            disabled && styles.radioDisabled,
          ]}
        >
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    marginBottom: 12,
    backgroundColor: colors.neutral.white,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.brand.navy,
    backgroundColor: colors.neutral.white,
  },
  cardDisabled: {
    opacity: 0.5,
    backgroundColor: colors.neutral.bg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(26,39,68,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeText: {
    ...typography['label-sm'],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.label,
    color: colors.text.primary,
    fontSize: 15,
  },
  description: {
    ...typography['body-sm'],
    color: colors.text.secondary,
    marginTop: 2,
  },
  textDisabled: {
    color: colors.text.secondary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: colors.brand.navy,
  },
  radioDisabled: {
    borderColor: colors.neutral.border,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand.navy,
  },
});
