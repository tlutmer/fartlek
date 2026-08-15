import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

// Subtle white/grey dust — no bright accents, stays quiet against the dark bg
const DUST_COLORS = [
  colors.grey[100],
  colors.grey[200],
  colors.grey[300],
  colors.grey[400],
] as const;

const PARTICLE_COUNT = 10;
const DURATION = 420;

type Particle = {
  dx: number;
  dy: number;
  size: number;
  color: string;
};

type Burst = {
  id: number;
  particles: Particle[];
  progress: Animated.Value;
};

export type SpaceDustHandle = {
  burst: () => void;
};

type SpaceDustProps = {
  palette?: readonly string[]; // particle colors; defaults to white/greys
  spread?: number; // multiplies travel distance for larger anchors
};

// Overlay that scatters a quick puff of dust from the center of its parent.
// Fill the parent (absoluteFill), then call burst() on each tap; bursts
// overlap freely so rapid taps each get their own puff.
export const SpaceDust = forwardRef<SpaceDustHandle, SpaceDustProps>(function SpaceDust(
  { palette = DUST_COLORS, spread = 1 },
  ref
) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  useImperativeHandle(ref, () => ({
    burst: () => {
      const id = nextId.current++;
      const progress = new Animated.Value(0);
      const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = (11 + Math.random() * 15) * spread;
        return {
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          size: 2 + Math.random() * 1.5,
          color: palette[Math.floor(Math.random() * palette.length)],
        };
      });

      setBursts((prev) => [...prev, { id, particles, progress }]);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      });
    },
  }));

  if (bursts.length === 0) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      {bursts.map(({ id, particles, progress }) =>
        particles.map((p, i) => (
          <Animated.View
            key={`${id}-${i}`}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: p.color,
              opacity: progress.interpolate({
                inputRange: [0, 0.1, 1],
                outputRange: [0, 1, 0],
              }),
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dx],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, p.dy],
                  }),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.3],
                  }),
                },
              ],
            }}
          />
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
