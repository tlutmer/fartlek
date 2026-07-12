import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, ViewStyle } from 'react-native';

type FadeInProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

// Rams-style entrance: quiet fade with a small upward settle, cubic ease-out
export function FadeIn({ children, style }: FadeInProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [anim]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
