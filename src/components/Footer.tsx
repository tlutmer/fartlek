import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { colors, spacing, typography, rem } from '../theme/tokens';

// TODO: fill in once the App Store / Play Store listings are live
const ANDROID_URL = '';
const IOS_URL = '';

function openIfSet(url: string) {
  if (url) Linking.openURL(url);
}

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>Get for </Text>
      <Pressable onPress={() => openIfSet(ANDROID_URL)} hitSlop={8}>
        <Text style={styles.link}>Android</Text>
      </Pressable>
      <Text style={styles.text}> and </Text>
      <Pressable onPress={() => openIfSet(IOS_URL)} hitSlop={8}>
        <Text style={styles.link}>iOS</Text>
      </Pressable>
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
  link: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[100],
    textDecorationLine: 'underline',
    lineHeight: rem(12 * typography.lineHeight.tight),
  },
});
