import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, Filter, FeGaussianBlur, G } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { SpaceDust, SpaceDustHandle } from './SpaceDust';

export type RingSpec = {
  segments: number; // interval count (the configured number, capped); 0 hides the ring
  lit: number; // segments still remaining — lit in the ring color
};

type ProgressRingProps = {
  rings: RingSpec[]; // outer → inner (work, rest, sets)
  activeRing: number; // ring for the current phase; -1 dims every ring (idle preview)
  color?: string; // lit segments + center circle
  size?: number;
  children?: React.ReactNode;
  dustRef?: React.Ref<SpaceDustHandle>; // burst() scatters dust from the clock center
  dustColors?: readonly string[];
};

export const MAX_SEGMENTS = 60; // beyond this the wedges are unreadably thin
const DIM_OPACITY = 0.35; // inactive rings recede so the active phase reads first
const IDLE_OPACITY = 0.8; // idle preview: all rings even and light, none competing
const SPENT_OPACITY = 0.18; // spent slots: a quiet ghost track instead of hard dark blocks

// Proportional geometry: the timer circle hugs the number, and the rings fill
// everything from just outside that circle to the clock's edge
function geometry(size: number, ringCount: number) {
  const centerR = size * 0.155; // timer circle, sized to sit close to the mm:ss text
  const innerEdge = centerR + size * 0.03; // air gap before the innermost ring
  const outerEdge = size / 2 - 2;
  const ringGap = size * 0.035; // radial gap between rings
  // Fewer visible rings → thicker rings, capped so a lone ring stays a band
  const slot = Math.min(
    (outerEdge - innerEdge - (ringCount - 1) * ringGap) / ringCount,
    size * 0.13
  );
  // Bands sit centered in their slots at 75% thickness; the rest is air
  const stroke = slot * 0.75;
  const r0 = outerEdge - slot / 2;
  const ringR = (i: number) => r0 - i * (slot + ringGap);
  const segGapPx = size * 0.012; // divider width, constant across rings for clean geometry
  return { stroke, ringR, centerR, segGapPx };
}

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

// Segmented rings, memoized: segments only change once per second while the
// parent re-renders every timer tick
const RingSegments = React.memo(function RingSegments({
  rings,
  activeRing,
  color,
  size,
}: {
  rings: RingSpec[];
  activeRing: number;
  color: string;
  size: number;
}) {
  // Hidden rings (segments 0 / "None") give their space to the visible ones
  const visible = rings
    .map((ring, index) => ({ ring, index }))
    .filter((v) => v.ring.segments > 0);
  const { stroke, ringR, segGapPx } = geometry(size, Math.max(visible.length, 1));
  const c = size / 2;

  // Two passes over the same geometry: a gaussian-blurred bloom underneath
  // (lit segments only) and the crisp wedges on top
  const bloom: React.ReactNode[] = [];
  const crisp: React.ReactNode[] = [];

  const idle = activeRing < 0;
  visible.forEach(({ ring, index }, vi) => {
    const r = ringR(vi);
    const active = index === activeRing;
    const peak = active ? 1 : idle ? IDLE_OPACITY : DIM_OPACITY;
    if (ring.segments === 1) {
      const lit = ring.lit > 0;
      if (lit && active) {
        bloom.push(
          <Circle key={index} cx={c} cy={c} r={r} stroke={color} opacity={peak} strokeWidth={stroke} fill="none" />
        );
      }
      crisp.push(
        <Circle
          key={index}
          cx={c}
          cy={c}
          r={r}
          stroke={lit ? color : colors.grey[600]}
          opacity={lit ? peak : SPENT_OPACITY}
          strokeWidth={stroke}
          fill="none"
        />
      );
      return;
    }
    const span = 360 / ring.segments;
    // Constant-width dividers: convert the pixel gap to degrees at this radius
    const gap = Math.min((segGapPx / (2 * Math.PI * r)) * 360, span * 0.3);
    const elapsed = ring.segments - ring.lit; // segments spent, greyed top → clockwise
    for (let k = 0; k < ring.segments; k++) {
      const spent = k < elapsed;
      const d = arc(c, c, r, k * span + gap / 2, (k + 1) * span - gap / 2);
      if (!spent && active) {
        bloom.push(
          <Path key={`${index}-${k}`} d={d} stroke={color} opacity={peak} strokeWidth={stroke} fill="none" />
        );
      }
      crisp.push(
        <Path
          key={`${index}-${k}`}
          d={d}
          stroke={spent ? colors.grey[600] : color}
          opacity={spent ? SPENT_OPACITY : peak}
          strokeWidth={stroke}
          fill="none"
        />
      );
    }
  });

  return (
    <>
      <Defs>
        <Filter id="ringBloom" x="-30%" y="-30%" width="160%" height="160%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation={size * 0.018} />
        </Filter>
      </Defs>
      {/* Soft phosphor bloom under the active ring only: true gaussian blur, wide and quiet */}
      <G filter="url(#ringBloom)" opacity={0.5}>
        {bloom}
      </G>
      {crisp}
    </>
  );
},
(prev, next) =>
  prev.color === next.color &&
  prev.size === next.size &&
  prev.activeRing === next.activeRing &&
  prev.rings.length === next.rings.length &&
  prev.rings.every(
    (r, i) => r.segments === next.rings[i].segments && r.lit === next.rings[i].lit
  ));

export function ProgressRing({
  rings,
  activeRing,
  color = colors.grey[100],
  size = 280,
  children,
  dustRef,
  dustColors,
}: ProgressRingProps) {
  const c = size / 2;
  // The bloom blurs past the clock's edge; oversize the canvas so it isn't
  // clipped while the layout container keeps the clock's own footprint
  const pad = size * 0.08;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size + pad * 2}
        height={size + pad * 2}
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
        style={{ position: 'absolute', left: -pad, top: -pad }}
      >
        <RingSegments rings={rings} activeRing={activeRing} color={color} size={size} />
      </Svg>
      {dustRef && (
        // Zero-size anchor at the clock center; boundary dust scatters outward
        <View pointerEvents="none" style={[styles.dustAnchor, { left: c, top: c }]}>
          <SpaceDust ref={dustRef} palette={dustColors} spread={1.6} />
        </View>
      )}
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
  dustAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
