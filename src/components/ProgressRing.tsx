import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme/tokens';

type ProgressRingProps = {
  progress: number; // 0–1, fraction elapsed; the dot travels clockwise from 12 o'clock
  color?: string; // remaining arc + dot
  size?: number;
  children?: React.ReactNode;
};

const STROKE = 2;
const DOT_RADIUS = 5;
const TOP_GAP = 0; // ring is closed at 12 o'clock; the only opening travels with the dot
const DOT_GAP = 6; // degrees of open ring either side of the dot

function point(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = point(cx, cy, r, start);
  const e = point(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function ProgressRing({
  progress,
  color = colors.grey[100],
  size = 280,
  children,
}: ProgressRingProps) {
  const c = size / 2;
  const r = c - DOT_RADIUS - STROKE;
  const head = Math.min(Math.max(progress, 0), 1) * 360;
  const dot = point(c, c, r, head);

  const showElapsed = head - DOT_GAP > TOP_GAP;
  const showRemaining = head + DOT_GAP < 360 - TOP_GAP;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {showElapsed && (
          <Path
            d={arc(c, c, r, TOP_GAP, head - DOT_GAP)}
            stroke={colors.grey[600]}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {showRemaining && (
          <Path
            d={arc(c, c, r, head + DOT_GAP, 360 - TOP_GAP)}
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />
        )}
        <Circle cx={dot.x} cy={dot.y} r={DOT_RADIUS} fill={color} />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
