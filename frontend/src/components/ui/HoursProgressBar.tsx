import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface HoursProgressBarProps {
  filled: number;
  total: number;
  percentage?: number;
}

export default function HoursProgressBar({ filled, total, percentage }: HoursProgressBarProps) {
  let pct: number;
  if (total === 0) {
    pct = percentage ?? 0;
  } else {
    pct = Math.min(100, Math.max(0, (filled / total) * 100));
  }

  return (
    <View>
      <View testID="hours-progress-bar" style={styles.track}>
        <View
          testID="hours-progress-fill"
          style={[styles.fill, { width: pct === 0 ? 0 : `${pct}%` as any }]}
        />
      </View>
      <Text testID="hours-progress-label" style={styles.label}>
        {filled}h / {total}h
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: '#f0ede8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: '#d4813a',
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    color: '#7a8299',
    marginTop: 4,
  },
});
