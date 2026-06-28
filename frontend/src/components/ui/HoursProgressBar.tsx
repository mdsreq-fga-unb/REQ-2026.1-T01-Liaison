import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HoursProgressBarProps {
  filled: number;
  total: number;
  percentage?: number;
  /** 'header' renders on the dark gradient header (translucent track, gold gradient fill, no label). */
  variant?: 'light' | 'header';
}

export default function HoursProgressBar({ filled, total, percentage, variant = 'light' }: HoursProgressBarProps) {
  let pct: number;
  if (total === 0) {
    pct = percentage ?? 0;
  } else {
    pct = Math.min(100, Math.max(0, (filled / total) * 100));
  }

  const isHeader = variant === 'header';
  const width = pct === 0 ? 0 : (`${pct}%` as any);

  return (
    <View>
      <View testID="hours-progress-bar" style={[styles.track, isHeader && styles.trackHeader]}>
        {isHeader ? (
          <LinearGradient
            testID="hours-progress-fill"
            colors={['#d4813a', '#f0b070']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, styles.fillHeader, { width }]}
          />
        ) : (
          <View testID="hours-progress-fill" style={[styles.fill, { width }]} />
        )}
      </View>
      {!isHeader && (
        <Text testID="hours-progress-label" style={styles.label}>
          {filled}h / {total}h
        </Text>
      )}
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
  trackHeader: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
  },
  fill: {
    height: 8,
    backgroundColor: '#d4813a',
    borderRadius: 4,
  },
  fillHeader: {
    height: 4,
    borderRadius: 9999,
  },
  label: {
    fontSize: 12,
    color: '#7a8299',
    marginTop: 4,
  },
});
