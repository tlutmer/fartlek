import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MainScreen } from './src/screens/MainScreen';
import { colors } from './src/theme/tokens';

function Root() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style="light" />
      {/* Landscape uses the full width for the side-by-side layout */}
      <View style={[styles.frame, isLandscape && styles.frameWide]}>
        <MainScreen />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.grey[700],
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
  },
  frameWide: {
    maxWidth: 900,
  },
});
