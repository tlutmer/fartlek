import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Bevel } from './Bevel';
import { colors, spacing, typography } from '../theme/tokens';

type BevelCardProps = {
  children: React.ReactNode;
  header?: string;
  color?: string;
  style?: ViewStyle;
};

// Kelex Card: tertiary bevels, transparent bg, border-t/b, header row
export function BevelCard({ children, header, color = colors.grey[100], style }: BevelCardProps) {
  return (
    <View style={[styles.container, style]}>
      <Bevel side="left" color={color} variant="tertiary" />

      <View style={[styles.body, { borderTopColor: color, borderBottomColor: color }]}>
        {header && (
          <View style={[styles.headerRow, { borderBottomColor: color }]}>
            <Text style={[styles.headerText, { color }]}>{header}</Text>
          </View>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </View>

      <Bevel side="right" color={color} variant="tertiary" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  body: {
    flex: 1,
    minWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: spacing[8],
  },
  headerText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    lineHeight: typography.fontSize.label * typography.lineHeight.tight,
  },
  content: {
    paddingVertical: spacing[8],
  },
});
