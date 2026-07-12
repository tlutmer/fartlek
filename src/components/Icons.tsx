import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

type IconProps = {
  size?: number;
  color: string;
};

export function PlayIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 1.5 L12.5 7 L3 12.5 Z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 14, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Rect x="2.5" y="1.5" width="3.2" height="11" fill={color} />
      <Rect x="8.3" y="1.5" width="3.2" height="11" fill={color} />
    </Svg>
  );
}
