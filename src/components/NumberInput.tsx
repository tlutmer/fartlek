import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type NumberInputProps = {
  label: string;
  value: string;
  onAdjust: (delta: number) => void; // applied functionally by the parent so rapid taps never drop
  zeroText?: string; // shown instead of 0 (e.g. "None")
};

export function NumberInput({ label, value, onAdjust, zeroText }: NumberInputProps) {
  const num = parseInt(value) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            onPress={() => onAdjust(-1)}
            activeOpacity={0.6}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`Decrease ${label}`}
          >
            <Text style={styles.stepGlyph}>−</Text>
          </TouchableOpacity>
          <Text style={styles.value}>{num === 0 && zeroText ? zeroText : num}</Text>
          <TouchableOpacity
            onPress={() => onAdjust(1)}
            activeOpacity={0.6}
            hitSlop={{ top: 14, bottom: 14, left: 10, right: 14 }}
            accessibilityRole="button"
            accessibilityLabel={`Increase ${label}`}
          >
            <Text style={styles.stepGlyph}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  label: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[16],
  },
  stepGlyph: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 14,
    color: colors.grey[400],
    width: 20,
    textAlign: 'center',
  },
  value: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
    fontVariant: ['tabular-nums'],
    minWidth: 36,
    textAlign: 'center',
  },
  underline: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.grey[600],
    marginTop: spacing[4],
  },
});
