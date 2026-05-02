import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography } from '../theme/tokens';

type CircularDialProps = {
  time: string;
  progress: number; // 0–1
  phaseLabel: string;
  phaseColor: string;
  repText?: string;
  totalTime?: string;
};

const SIZE = 260;
const STROKE = 4;
const RADIUS = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CircularDial({
  time,
  progress,
  phaseLabel,
  phaseColor,
  repText,
  totalTime,
}: CircularDialProps) {
  const strokeDashoffset = -(CIRCUMFERENCE * (1 - progress));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.grey[800]}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Tick marks at 12, 3, 6, 9 positions */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.grey[700]}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE / 60} ${CIRCUMFERENCE / 60}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        {/* Progress arc */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={phaseColor}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      {/* Center content */}
      <View style={styles.center}>
        <View style={styles.phaseRow}>
          <View style={[styles.phaseDot, { backgroundColor: phaseColor }]} />
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>{phaseLabel}</Text>
        </View>
        <Text style={[styles.time, { color: phaseColor }]}>{time}</Text>
        {repText && (
          <Text style={styles.repText}>{repText}</Text>
        )}
        {totalTime && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{totalTime}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing[8],
  },
  phaseLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    letterSpacing: 2,
  },
  time: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.subtitle2,
    letterSpacing: 4,
    lineHeight: typography.fontSize.subtitle2 * typography.lineHeight.normal,
  },
  repText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    color: colors.grey[500],
    letterSpacing: 1,
    marginTop: spacing[4],
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    gap: spacing[8],
  },
  totalLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    color: colors.grey[600],
    letterSpacing: 1,
  },
  totalValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.body,
    color: colors.grey[400],
  },
});
