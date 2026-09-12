// Kelex Design System — Tokens
// Extracted from tokens.css

import { Platform } from 'react-native';

const REM_BASE = 16; // matches the browser's default root font-size

// Converts a px-equivalent design value to a web-only CSS rem string so text
// and spacing scale with the browser's root font-size / zoom. Typed as
// `number` so call sites don't need type changes; native ignores this and
// keeps the raw point value. Apply this to a value only after any arithmetic
// on it is done (e.g. `rem(12 * typography.lineHeight.tight)`, not before) —
// once converted it's a string at runtime and can't be used in further math.
export function rem(px: number): number {
  if (Platform.OS !== 'web') return px;
  return `${px / REM_BASE}rem` as unknown as number;
}

export const colors = {
  grey: {
    100: '#ffffff',
    200: '#e3e3e5',
    300: '#ceced3',
    400: '#ababb1',
    500: '#858484',
    600: '#706e6e',
    700: '#232426',
    800: '#151517',
    900: '#000000',
  },
  red: {
    100: '#ffded9',
    200: '#ffbcb0',
    300: '#ff2600',
    400: '#e62200',
    500: '#cc1e00',
    600: '#bf1d00',
    700: '#991700',
    800: '#731100',
    900: '#590d00',
  },
  orange: {
    100: '#fff2d9',
    200: '#ffe3b0',
    300: '#ffa600',
    400: '#e69500',
    500: '#cc8500',
    600: '#bf7d00',
    700: '#996400',
    800: '#734b00',
    900: '#593a00',
  },
  yellow: {
    100: '#fffcd9',
    200: '#fff8b0',
    300: '#ffea00',
    400: '#e6d300',
    500: '#ccbb00',
    600: '#bfb000',
    700: '#998c00',
    800: '#736900',
    900: '#595200',
  },
  green: {
    100: '#d9ffec',
    200: '#b0ffd8',
    300: '#00ff80',
    400: '#00e673',
    500: '#00cc66',
    600: '#00bf60',
    700: '#00994d',
    800: '#00733a',
    900: '#00592d',
  },
  cyan: {
    100: '#d9fffd',
    200: '#b0fffb',
    300: '#00fff2',
    400: '#00e6da',
    500: '#00ccc2',
    600: '#00bfb6',
    700: '#009991',
    800: '#00736d',
    900: '#005955',
  },
  blue: {
    100: '#d9efff',
    200: '#b0deff',
    300: '#0095ff',
    400: '#0086e6',
    500: '#0077cc',
    600: '#0070bf',
    700: '#005999',
    800: '#004373',
    900: '#003459',
  },
  magenta: {
    100: '#ffd9fd',
    200: '#ffb0fb',
    300: '#ff00f2',
    400: '#e600da',
    500: '#cc00c2',
    600: '#bf00b6',
    700: '#990091',
    800: '#73006d',
    900: '#590055',
  },
  purple: {
    100: '#f0d9ff',
    200: '#dfb0ff',
    300: '#9900ff',
    400: '#8a00e6',
    500: '#7a00cc',
    600: '#7300bf',
    700: '#5c0099',
    800: '#450073',
    900: '#360059',
  },
} as const;

export const spacing = {
  0: rem(0),
  1: rem(1),
  4: rem(4),
  8: rem(8),
  12: rem(12),
  16: rem(16),
  20: rem(20),
  24: rem(24),
  28: rem(28),
  32: rem(32),
  36: rem(36),
  40: rem(40),
  44: rem(44),
  48: rem(48),
  52: rem(52),
  56: rem(56),
  64: rem(64),
  72: rem(72),
  80: rem(80),
  90: rem(90),
} as const;

export const typography = {
  fontFamily: {
    mono: 'IBMPlexMono-Regular',
    monoBold: 'IBMPlexMono-Bold',
  },
  fontWeight: {
    regular: '400' as const,
    bold: '400' as const, // Kelex tokens: both weights map to 400
  },
  fontSize: {
    label: rem(12.8),
    body: rem(16),
    header3: rem(20.8),
    header2: rem(24),
    header1: rem(32),
    subtitle3: rem(36),
    subtitle2: rem(44),
    subtitle1: rem(64),
    title3: rem(86),
    title2: rem(96),
    display2: rem(172),
    display1: rem(258),
  },
  lineHeight: {
    tight: 1,    // leading-none — buttons, labels, UI elements
    normal: 1.3, // intrinsic — body, paragraphs, display
  },
} as const;
