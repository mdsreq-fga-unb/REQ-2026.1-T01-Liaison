import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  /** Icon to show for completed steps */
  checkmarkIcon?: React.ReactNode;
}

const DEFAULT_LABELS = ['Perfil', 'Dados', 'Acadêmico', 'Interesses'];

export default function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels = DEFAULT_LABELS,
  checkmarkIcon,
}: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const isPending = step > currentStep;

          const testID = isActive
            ? 'progress-step-active'
            : isCompleted
            ? 'progress-step-completed'
            : 'progress-step-pending';

          return (
            <React.Fragment key={step}>
              <View style={styles.stepColumn}>
                <View
                  testID={testID}
                  style={[
                    styles.circle,
                    isActive && styles.circleActive,
                    isCompleted && styles.circleCompleted,
                    isPending && styles.circlePending,
                  ]}
                >
                  {isCompleted ? (
                    checkmarkIcon ? (
                      checkmarkIcon
                    ) : (
                      <Text style={styles.checkmarkText}>✓</Text>
                    )
                  ) : (
                    <Text
                      testID="progress-step"
                      style={[
                        styles.stepNumber,
                        isActive && styles.stepNumberActive,
                        isPending && styles.stepNumberPending,
                      ]}
                    >
                      {step}
                    </Text>
                  )}
                </View>
                {stepLabels[i] && (
                  <Text
                    style={[
                      styles.stepLabel,
                      isCompleted && styles.stepLabelCompleted,
                      isActive && styles.stepLabelActive,
                      isPending && styles.stepLabelPending,
                    ]}
                  >
                    {stepLabels[i]}
                  </Text>
                )}
              </View>
              {i < totalSteps - 1 && (
                <View style={styles.connectorWrapper}>
                  <View
                    style={[
                      styles.connector,
                      isCompleted && styles.connectorActive,
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepColumn: {
    minWidth: 64,
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  circleActive: {
    backgroundColor: colors.brand.gold,
    borderColor: colors.brand.gold,
  },
  circleCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  circlePending: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.border,
  },
  stepNumber: {
    ...typography['body-sm'],
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: colors.neutral.white,
  },
  stepNumberPending: {
    color: colors.text.secondary,
  },
  checkmarkText: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography['body-sm'],
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: colors.success,
  },
  stepLabelActive: {
    color: colors.brand.gold,
  },
  stepLabelPending: {
    color: colors.text.secondary,
  },
  connectorWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 15,
  },
  connector: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.neutral.border,
  },
  connectorActive: {
    backgroundColor: colors.success,
  },
});
