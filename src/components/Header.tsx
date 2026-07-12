import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Fartlek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing[24],
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
    lineHeight: 12 * typography.lineHeight.tight,
  },
});
