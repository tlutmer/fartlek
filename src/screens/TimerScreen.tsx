import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { Bevel } from '../components/Bevel';
import { BevelCard } from '../components/BevelCard';
import { NumberInput } from '../components/NumberInput';
import { CircularDial } from '../components/CircularDial';

type Phase = 'idle' | 'work' | 'rest' | 'done';

const BUTTON_HEIGHT = 45;

export function TimerScreen() {
  const [fullTime, setFullTime] = useState('60');
  const [restTime, setRestTime] = useState('15');
  const [totalReps, setTotalReps] = useState('5');
  const [repTime, setRepTime] = useState('10');

  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [currentRep, setCurrentRep] = useState(0);
  const [fullSecondsLeft, setFullSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    const full = parseInt(fullTime) || 0;
    if (full <= 0) return;

    clearTimer();
    setPhase('work');
    setCurrentRep(1);
    setSecondsLeft(parseInt(repTime) || 0);
    setFullSecondsLeft(full);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
      setFullSecondsLeft(prev => prev - 1);
    }, 1000);
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;

    if (fullSecondsLeft <= 0) {
      clearTimer();
      setPhase('done');
      return;
    }

    if (secondsLeft <= 0) {
      const reps = parseInt(totalReps) || 1;

      if (phase === 'work') {
        if (currentRep < reps) {
          setPhase('rest');
          setSecondsLeft(parseInt(restTime) || 0);
        } else {
          setCurrentRep(1);
          setPhase('rest');
          setSecondsLeft(parseInt(restTime) || 0);
        }
      } else if (phase === 'rest') {
        const nextRep = currentRep >= reps ? 1 : currentRep + 1;
        setCurrentRep(nextRep);
        setPhase('work');
        setSecondsLeft(parseInt(repTime) || 0);
      }
    }
  }, [secondsLeft, fullSecondsLeft, phase]);

  const stopTimer = () => {
    clearTimer();
    setPhase('idle');
    setSecondsLeft(0);
    setFullSecondsLeft(0);
    setCurrentRep(0);
  };

  const isRunning = phase === 'work' || phase === 'rest';

  const phaseColor =
    phase === 'work' ? colors.green[300] :
    phase === 'rest' ? colors.orange[300] :
    phase === 'done' ? colors.red[300] :
    colors.grey[300];

  const phaseLabel =
    phase === 'work' ? 'WORK' :
    phase === 'rest' ? 'REST' :
    phase === 'done' ? 'DONE' :
    'READY';

  const phaseDuration = phase === 'work'
    ? (parseInt(repTime) || 1)
    : (parseInt(restTime) || 1);
  const phaseProgress = isRunning
    ? Math.max(0, secondsLeft / phaseDuration)
    : phase === 'done' ? 0 : 1;

  const displayTime = isRunning || phase === 'done'
    ? formatTime(Math.max(0, secondsLeft))
    : formatTime(parseInt(fullTime) || 0);

  // Kelex Button primary: grey-100 bevel+bg, grey-800 text
  // Stop variant: red-300 bevel+bg, grey-100 text
  const btnColor = isRunning ? colors.red[300] : colors.grey[100];
  const btnText = isRunning ? colors.grey[100] : colors.grey[800];

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.mobileFrame}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top Bar ── */}
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>FARTLEK</Text>
            <Text style={styles.topBarSubtitle}>INTERVAL TIMER</Text>
          </View>

          {/* ── Circular Dial ── */}
          <View style={styles.dialSection}>
            <CircularDial
              time={displayTime}
              progress={phaseProgress}
              phaseLabel={phaseLabel}
              phaseColor={phaseColor}
              repText={isRunning ? `REP ${currentRep}/${totalReps || '0'}` : undefined}
              totalTime={isRunning ? formatTime(Math.max(0, fullSecondsLeft)) : undefined}
            />
          </View>

          {/* ── Config (Kelex Card: tertiary bevels, transparent bg, grey-100 borders) ── */}
          {!isRunning && phase !== 'done' && (
            <View style={styles.configSection}>
              <BevelCard header="CONFIG">
                <View>
                  <View style={styles.inputRow}>
                    <NumberInput
                      label="Full Time"
                      value={fullTime}
                      onChangeText={setFullTime}
                      suffix="sec"
                    />
                    <View style={styles.inputGap} />
                    <NumberInput
                      label="Rest Period"
                      value={restTime}
                      onChangeText={setRestTime}
                      suffix="sec"
                    />
                  </View>
                  <View style={styles.inputRowSpacing} />
                  <View style={styles.inputRow}>
                    <NumberInput
                      label="Total Reps"
                      value={totalReps}
                      onChangeText={setTotalReps}
                    />
                    <View style={styles.inputGap} />
                    <NumberInput
                      label="Rep Time"
                      value={repTime}
                      onChangeText={setRepTime}
                      suffix="sec"
                    />
                  </View>
                </View>
              </BevelCard>
            </View>
          )}

          {/* ── Button (Kelex: 45px, primary filled bevels, body bg+border = bevel color) ── */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.button}
              onPress={isRunning || phase === 'done' ? stopTimer : startTimer}
              activeOpacity={0.7}
            >
              <Bevel side="left" color={btnColor} variant="primary" />
              <View style={[styles.buttonBody, {
                backgroundColor: btnColor,
                borderTopColor: btnColor,
                borderBottomColor: btnColor,
              }]}>
                <Text style={[styles.buttonText, { color: btnText }]}>
                  {isRunning ? 'STOP' : phase === 'done' ? 'RESET' : 'START'}
                </Text>
              </View>
              <Bevel side="right" color={btnColor} variant="primary" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.grey[900],
    alignItems: 'center',
  },
  mobileFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 390,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[16],
    paddingBottom: spacing[40],
  },

  // Top Bar — Kelex TopBar: grey-800, 70px, border-b grey-700
  topBar: {
    height: 70,
    backgroundColor: colors.grey[800],
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -spacing[16],
    paddingHorizontal: spacing[24],
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[700],
  },
  topBarTitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.body,
    color: colors.grey[100],
    letterSpacing: 6,
    lineHeight: typography.fontSize.body * typography.lineHeight.tight,
  },
  topBarSubtitle: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.label,
    color: colors.grey[600],
    letterSpacing: 3,
    marginTop: spacing[4],
    lineHeight: typography.fontSize.label * typography.lineHeight.tight,
  },

  // Dial
  dialSection: {
    marginTop: spacing[32],
    alignItems: 'center',
  },

  // Config
  configSection: {
    marginTop: spacing[32],
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputGap: {
    width: spacing[24],
  },
  inputRowSpacing: {
    height: spacing[20],
  },

  // Button — Kelex: 45px, filled primary bevels (8px wide), body bg = bevel, border-t/b 1px
  buttonSection: {
    marginTop: spacing[32],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: BUTTON_HEIGHT,
  },
  buttonBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[12],
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  buttonText: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.body,
    lineHeight: typography.fontSize.body * typography.lineHeight.tight,
    letterSpacing: 4,
  },
});
