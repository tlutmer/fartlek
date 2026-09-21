import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { colors, spacing, typography, rem } from '../theme/tokens';

const AUTHOR_URL = 'https://www.trentlutmer.me/';

export function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Fartlek by </Text>
      <Pressable
        onPress={() => Linking.openURL(AUTHOR_URL)}
        accessibilityRole="link"
        hitSlop={8}
      >
        <Text style={styles.link}>Trent Lutmer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: spacing[24],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[100],
    lineHeight: rem(12 * typography.lineHeight.tight),
  },
  link: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[100],
    textDecorationLine: 'underline',
    lineHeight: rem(12 * typography.lineHeight.tight),
  },
});
