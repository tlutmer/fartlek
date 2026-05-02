import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type BevelProps = {
  side: 'left' | 'right';
  color: string;
  variant?: 'primary' | 'tertiary';
  height?: number;
};

const NOTCH = 8;

export function Bevel({ side, color, variant = 'primary', height }: BevelProps) {
  const isLeft = side === 'left';
  const isTertiary = variant === 'tertiary';

  // Notch SVG path
  const notchPath = isTertiary
    ? 'M8,0 L0,8' // diagonal stroke
    : isLeft
      ? `M${NOTCH},0 L${NOTCH},${NOTCH} L0,${NOTCH} Z` // filled left
      : `M0,0 L${NOTCH},0 L0,${NOTCH} Z`; // filled right

  const notch = (
    <Svg width={NOTCH} height={NOTCH} viewBox={`0 0 ${NOTCH} ${NOTCH}`}>
      <Path
        d={notchPath}
        fill={isTertiary ? 'none' : color}
        stroke={isTertiary ? color : 'none'}
        strokeWidth={isTertiary ? 1 : 0}
      />
    </Svg>
  );

  if (isTertiary) {
    // Tertiary: diagonal notch + 1px border lines
    return (
      <View style={[styles.container, height ? { height } : { alignSelf: 'stretch' as const }]}>
        {isLeft && notch}
        {!isLeft && <View style={[styles.hLine, { borderTopWidth: 1, borderTopColor: color }]} />}
        <View style={[
          styles.vLine,
          isLeft
            ? { borderLeftWidth: 1, borderLeftColor: color, alignSelf: 'flex-start' as const }
            : { borderRightWidth: 1, borderRightColor: color, alignSelf: 'flex-end' as const },
        ]} />
        {isLeft && <View style={[styles.hLine, { borderBottomWidth: 1, borderBottomColor: color }]} />}
        {!isLeft && notch}
      </View>
    );
  }

  // Primary: filled triangle + solid 8px-wide fill bar
  return (
    <View style={[styles.container, height ? { height } : { alignSelf: 'stretch' as const }]}>
      {isLeft && notch}
      <View style={[styles.fillBar, { backgroundColor: color }]} />
      {!isLeft && notch}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: NOTCH,
    flexDirection: 'column',
    flexShrink: 0,
  },
  fillBar: {
    flex: 1,
    minHeight: 0,
    width: NOTCH,
  },
  vLine: {
    flex: 1,
    minHeight: 0,
  },
  hLine: {
    width: '100%',
  },
});
