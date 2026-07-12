import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { Accelerometer } from 'expo-sensors';
import { colors, spacing, typography } from '../theme/tokens';
import { Header } from '../components/Header';
import { FadeIn } from '../components/FadeIn';
import { NumberInput } from '../components/NumberInput';
import { RadioGroup } from '../components/RadioGroup';
import { ProgressRing } from '../components/ProgressRing';
import { PlayIcon, PauseIcon } from '../components/Icons';

export type TimeUnit = 'sec' | 'min';

type SessionConfig = {
  fullTime: number; // seconds
  work: number; // seconds; 0 = untimed work, whole set counts as rest
  rest: number; // seconds
  sets: number;
};

type ConfigDraft = {
  sets: string;
  work: string;
  rest: string;
  unit: TimeUnit;
};

const TICK_MS = 33;
const RING_SIZE = 280; // shrinks on small screens (iPhone SE/8 class) so nothing clips
const CONFIG_MIN_HEIGHT = 180; // same footprint in config and progress modes so the ring never shifts
const PREP_SECONDS = 5; // get-ready countdown before the workout begins
const useNative = Platform.OS !== 'web';
const UNITS = ['min', 'sec'] as const; // sec stays the default selection

// Ring color rotates per set: cyan → magenta → yellow
const SET_COLORS = [colors.cyan[300], colors.magenta[300], colors.yellow[300]];

function formatCountdown(secs: number): string {
  const clamped = Math.max(0, Math.ceil(secs));
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatFullTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const mmss = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

// Phase countdown: plain seconds under a minute, m:ss beyond (e.g. 100s → 1:40)
function formatPhase(secs: number): string {
  const s = Math.max(0, Math.ceil(secs));
  if (s < 60) return s.toString().padStart(2, '0');
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

function ProgressRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowInner}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      </View>
      <View style={styles.underline} />
    </View>
  );
}

export function MainScreen() {
  const [draft, setDraft] = useState<ConfigDraft>({
    sets: '3',
    work: '10',
    rest: '5',
    unit: 'sec',
  });
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const elapsedRef = useRef(0);
  const firstBoundary = useRef(true);

  // Functional update so rapid consecutive taps each apply to the latest value
  const adjust = (key: 'sets' | 'work' | 'rest') => (delta: number) =>
    setDraft((d) => ({
      ...d,
      [key]: String(Math.max(0, (parseInt(d[key]) || 0) + delta)),
    }));

  // Fit the ring to the screen: portrait stacks (header + config + time need ~420pt of
  // height); landscape puts config and ring side by side, so only height constrains it
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const ringSize = isLandscape
    ? Math.max(140, Math.min(RING_SIZE, windowHeight - 190))
    : Math.max(160, Math.min(RING_SIZE, windowWidth - 96, windowHeight - 420));

  const unitSeconds = draft.unit === 'min' ? 60 : 1;
  const draftRest = (parseInt(draft.rest) || 0) * unitSeconds;
  const draftWork = (parseInt(draft.work) || 0) * unitSeconds;
  const draftSets = parseInt(draft.sets) || 0;
  const previewFullTime = draftSets * (draftWork + draftRest);

  const done = session !== null && elapsed >= session.fullTime + PREP_SECONDS;

  useEffect(() => {
    if (!session || done || paused) return;
    startRef.current = Date.now() - elapsedRef.current * 1000;
    const id = setInterval(() => {
      const e = (Date.now() - startRef.current) / 1000;
      elapsedRef.current = e;
      setElapsed(e);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [session, done, paused]);

  const start = () => {
    if (previewFullTime <= 0) return;
    elapsedRef.current = 0;
    firstBoundary.current = true;
    setElapsed(0);
    setPaused(false);
    setSession({
      fullTime: previewFullTime,
      work: draftWork,
      rest: draftRest,
      sets: draftSets,
    });
  };

  const stop = () => {
    setSession(null);
    setElapsed(0);
    setPaused(false);
    elapsedRef.current = 0;
  };

  // Shake once to pause; shake again while paused to stop the timer
  const lastShake = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const doneRef = useRef(done);
  doneRef.current = done;
  useEffect(() => {
    if (!session || Platform.OS === 'web') return;
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const g = Math.sqrt(x * x + y * y + z * z);
      if (g > 2.4 && Date.now() - lastShake.current > 2000 && !doneRef.current) {
        lastShake.current = Date.now();
        if (pausedRef.current) stop();
        else setPaused(true);
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Keep the screen on while a session is running
  useEffect(() => {
    if (!session || Platform.OS === 'web') return;
    activateKeepAwakeAsync('fartlek-session');
    return () => {
      deactivateKeepAwake('fartlek-session');
    };
  }, [session]);

  // Distinct beeps: countdown tick, set start (double), session end (long)
  const countdownBeep = useAudioPlayer(require('../../assets/sounds/countdown.wav'));
  const setBeep = useAudioPlayer(require('../../assets/sounds/set.wav'));
  const endBeep = useAudioPlayer(require('../../assets/sounds/end.wav'));

  const beep = (player: AudioPlayer) => {
    try {
      player.seekTo(0);
      player.play();
    } catch {
      // audio is best-effort; never let a failed beep break the timer
    }
  };

  useEffect(() => {
    // Mix with other audio (Spotify etc.) so beeps play on top instead of interrupting;
    // Android briefly ducks other audio since it cannot overlay as cleanly.
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      interruptionModeAndroid: 'duckOthers',
    }).catch(() => {});
  }, []);

  // Respect the OS reduce-motion setting for the blink animation
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  // Show COMPLETE briefly, then return to the configuration automatically
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(stop, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const fullTime = session?.fullTime ?? 0;
  const inPrep = session !== null && !done && elapsed < PREP_SECONDS;
  const prepRemaining = Math.max(0, PREP_SECONDS - elapsed);
  const workoutElapsed = session ? Math.max(0, elapsed - PREP_SECONDS) : 0;
  const clamped = session ? Math.min(workoutElapsed, fullTime) : 0;
  const remaining = fullTime - clamped;

  const cycle = session ? session.work + session.rest : 0;
  const totalCycles = session ? session.sets : 0;
  const cycleIndex =
    cycle > 0 ? Math.min(Math.floor(clamped / cycle), totalCycles - 1) : 0;
  const within = cycle > 0 ? clamped % cycle : 0;
  const isWork = session !== null && session.work > 0 && within < session.work;
  const phaseRemaining = isWork && session ? session.work - within : cycle - within;
  const currentSet = cycleIndex + 1;

  const phaseName = !session ? 'IDLE' : done ? 'DONE' : inPrep ? 'READY' : isWork ? 'WORK' : 'REST';

  // Ring sweeps once per phase (prep, work, rest) rather than tracking the full session
  const phaseDuration = !session
    ? 0
    : inPrep
    ? PREP_SECONDS
    : isWork
    ? session.work
    : session.rest;
  const phaseProgress = !session
    ? 0
    : done
    ? 1
    : phaseDuration > 0
    ? Math.min(1, Math.max(0, 1 - (inPrep ? prepRemaining : phaseRemaining) / phaseDuration))
    : 0;

  // Blink the dial when a new set or rest begins
  const blink = useRef(new Animated.Value(1)).current;
  const boundaryKey = !session ? 'idle' : done ? 'done' : `${phaseName}-${cycleIndex}`;
  useEffect(() => {
    if (!session || reduceMotion) return;
    if (firstBoundary.current) {
      firstBoundary.current = false;
      return;
    }
    blink.setValue(1);
    Animated.sequence([
      Animated.timing(blink, { toValue: 0.15, duration: 90, useNativeDriver: useNative }),
      Animated.timing(blink, { toValue: 1, duration: 90, useNativeDriver: useNative }),
      Animated.timing(blink, { toValue: 0.15, duration: 90, useNativeDriver: useNative }),
      Animated.timing(blink, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: useNative,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundaryKey, blink]);

  const ringColor =
    !session || done || inPrep
      ? colors.grey[100]
      : SET_COLORS[(currentSet - 1) % SET_COLORS.length];

  // Countdown tick on each second of the get-ready phase
  const prepTick = inPrep ? Math.ceil(prepRemaining) : 0;
  useEffect(() => {
    if (prepTick > 0) beep(countdownBeep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepTick]);

  // Double beep at the start of every set
  const cycleKey = session && !done && !inPrep ? cycleIndex : -1;
  useEffect(() => {
    if (cycleKey < 0) return;
    beep(setBeep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleKey]);

  // Long beep when the session completes
  useEffect(() => {
    if (done) beep(endBeep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <FadeIn style={styles.fill}>
      <View style={styles.fill}>
        <Header />

        <View style={[styles.body, isLandscape && styles.bodyRow]}>
        <View style={[styles.configSection, isLandscape && styles.configLandscape]}>
          {session ? (
            <>
              {/* Active phase number takes the set's ring color; inactive stays white */}
              <ProgressRow
                label="Set"
                value={`${currentSet}`}
                valueColor={inPrep || done ? colors.grey[100] : ringColor}
              />
              <ProgressRow
                label="Work"
                value={`${formatPhase(isWork ? phaseRemaining : session.work)} ${draft.unit}`}
                valueColor={isWork ? ringColor : colors.grey[100]}
              />
              <ProgressRow
                label="Rest"
                value={
                  session.rest === 0
                    ? 'None'
                    : `${formatPhase(
                        !isWork && !inPrep && !done ? phaseRemaining : session.rest
                      )} ${draft.unit}`
                }
                valueColor={!isWork && !inPrep && !done ? ringColor : colors.grey[100]}
              />
            </>
          ) : (
            <>
              <View style={styles.listRow}>
                <View style={styles.listRowInner}>
                  <Text style={styles.rowLabel}>Unit</Text>
                  <RadioGroup
                    options={UNITS}
                    value={draft.unit}
                    onChange={(unit) => setDraft((d) => ({ ...d, unit }))}
                  />
                </View>
                <View style={styles.underline} />
              </View>
              <NumberInput label="Sets" value={draft.sets} onAdjust={adjust('sets')} zeroText="None" />
              <NumberInput label="Work" value={draft.work} onAdjust={adjust('work')} />
              <NumberInput label="Rest" value={draft.rest} onAdjust={adjust('rest')} zeroText="None" />
            </>
          )}
        </View>

        <View style={styles.ringSection}>
          <Animated.View style={{ opacity: blink, alignItems: 'center' }}>
            <Text style={[styles.time, paused && styles.timePaused]}>
              {!session
                ? formatFullTime(previewFullTime)
                : formatCountdown(inPrep ? prepRemaining : remaining)}
            </Text>
            <ProgressRing progress={phaseProgress} color={ringColor} size={ringSize}>
              {/* Bare icon control in the ring: play starts/resumes, pause pauses; hold resets */}
              <TouchableOpacity
                style={styles.playTouch}
                onPress={() => {
                  if (!session) start();
                  else if (done) stop();
                  else setPaused((p) => !p);
                }}
                onLongPress={() => {
                  if (session) stop();
                }}
                delayLongPress={600}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={
                  !session ? 'Start workout' : paused ? 'Resume workout' : 'Pause workout'
                }
                accessibilityHint={session ? 'Hold to reset the timer' : undefined}
              >
                {session && !paused && !done ? (
                  <PauseIcon size={28} color={colors.grey[100]} />
                ) : (
                  <PlayIcon size={28} color={colors.grey[100]} />
                )}
              </TouchableOpacity>
            </ProgressRing>
          </Animated.View>
        </View>
        </View>
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configLandscape: {
    flex: 1,
    width: 'auto',
    maxWidth: 420,
    marginTop: 0,
    justifyContent: 'center',
    // offset for the time label + margin that sits above the ring in the right column,
    // so the config block centers on the circle itself
    paddingTop: 40,
  },
  configSection: {
    width: '100%',
    maxWidth: 384,
    minHeight: CONFIG_MIN_HEIGHT,
    alignSelf: 'center',
    marginTop: spacing[24],
    paddingHorizontal: spacing[24],
    gap: spacing[16],
  },
  listRow: {
    alignSelf: 'stretch',
  },
  listRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },
  rowLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
  },
  rowValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
    fontVariant: ['tabular-nums'],
  },
  underline: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.grey[600],
    marginTop: spacing[4],
  },
  ringSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 12,
    color: colors.grey[100],
    fontVariant: ['tabular-nums'],
    marginBottom: spacing[24],
  },
  timePaused: {
    color: colors.grey[500],
  },
  playTouch: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
