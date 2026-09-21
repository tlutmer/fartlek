import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, rem } from '../theme/tokens';

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>Coming soon to Android and iOS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[24],
  },
  text: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[500],
    lineHeight: rem(12 * typography.lineHeight.tight),
  },
});
