import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import * as Font from 'expo-font';
import { TimerScreen } from './src/screens/TimerScreen';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'IBMPlexMono-Regular': require('./assets/fonts/IBMPlexMono-Regular.ttf'),
      'IBMPlexMono-Bold': require('./assets/fonts/IBMPlexMono-Bold.ttf'),
    }).then(() => setReady(true))
      .catch(() => setReady(true)); // proceed even if fonts fail on web
  }, []);

  if (!ready) return null;

  return (
    <View style={{ flex: 1 }}>
      <TimerScreen />
    </View>
  );
}
