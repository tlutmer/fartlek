import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type NumberInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  placeholder?: string;
};

export function NumberInput({ label, value, onChangeText, suffix, placeholder = '0' }: NumberInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          placeholder={placeholder}
          placeholderTextColor={colors.grey[600]}
          selectionColor={colors.grey[300]}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      <View style={styles.underline} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    color: colors.grey[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[4],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  input: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.header2,
    color: colors.grey[100],
    padding: 0,
    minWidth: 40,
  },
  suffix: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    color: colors.grey[500],
    marginLeft: spacing[4],
  },
  underline: {
    height: 1,
    backgroundColor: colors.grey[700],
    marginTop: spacing[4],
  },
});
