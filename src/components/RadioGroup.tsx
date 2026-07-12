import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type RadioGroupProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export function RadioGroup<T extends string>({ options, value, onChange }: RadioGroupProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            style={styles.option}
            onPress={() => onChange(option)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option}
            hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
          >
            <View
              style={[
                styles.outer,
                { borderColor: active ? colors.grey[100] : colors.grey[600] },
              ]}
            >
              {active && <View style={styles.inner} />}
            </View>
            <Text style={styles.label}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing[16],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  outer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grey[100],
  },
  label: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
  },
});
