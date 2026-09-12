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
import { colors, spacing, typography, rem } from '../theme/tokens';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FadeIn } from '../components/FadeIn';
import { NumberInput } from '../components/NumberInput';
import { RadioGroup } from '../components/RadioGroup';
import { ProgressRing, MAX_SEGMENTS } from '../components/ProgressRing';
import { SpaceDust, SpaceDustHandle } from '../components/SpaceDust';

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
const RING_SIZE = 320; // shrinks on small screens (iPhone SE/8 class) so nothing clips
const CONFIG_MIN_HEIGHT = 196; // 4 rows × (8 + 32 + 8 + 1): same footprint in config and progress modes so the ring never shifts
const PREP_SECONDS = 5; // get-ready countdown before the workout begins
const useNative = Platform.OS !== 'web';
const UNITS = ['min', 'sec'] as const; // sec stays the default selection

// Ring color rotates per set: cyan → magenta → yellow
const SET_COLORS = [colors.cyan[300], colors.magenta[300], colors.yellow[300]];

// Dust at phase boundaries varies within the set's color ramp, with a white spark
const SET_DUST = [
  [colors.cyan[100], colors.cyan[200], colors.cyan[300], colors.grey[100]],
  [colors.magenta[100], colors.magenta[200], colors.magenta[300], colors.grey[100]],
  [colors.yellow[100], colors.yellow[200], colors.yellow[300], colors.grey[100]],
] as const;

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

// Memoized: the parent re-renders every timer tick (33ms) but row content only
// changes once per second at most
const ProgressRow = React.memo(function ProgressRow({
  label,
  value,
  activeColor,
}: {
  label: string;
  value: string;
  activeColor?: string; // set color; boxes the value with grey-700 text while the phase is active
}) {
  return (
    <View style={styles.listRow}>
      <View style={styles.listRowInner}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text
          style={[
            styles.rowValue,
            activeColor ? { backgroundColor: activeColor, color: colors.grey[700] } : null,
          ]}
        >
          {value}
        </Text>
      </View>
      <View style={styles.underline} />
    </View>
  );
});

export function MainScreen() {
  const [draft, setDraft] = useState<ConfigDraft>({
    sets: '3',
    work: '45',
    rest: '15',
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

  // Fit the ring to the screen: portrait stacks (header + config need ~380pt of
  // height); landscape puts config and ring side by side, so only height constrains it
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isLandscape = windowWidth > windowHeight;
  const ringSize = isLandscape
    ? Math.max(140, Math.min(RING_SIZE, windowHeight - 150))
    : Math.max(160, Math.min(RING_SIZE, windowWidth - 48, windowHeight - 380));

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

  const displayTime = !session
    ? formatFullTime(previewFullTime)
    : formatCountdown(inPrep ? prepRemaining : remaining);

  // Sci-fi clock rings: outer = work, middle = rest, inner = sets. Segment
  // counts come from the configured numbers (in the chosen unit); lit segments
  // count down as each is spent.
  const setsN = Math.min(draftSets, MAX_SEGMENTS);
  const workN = Math.min(parseInt(draft.work) || 0, MAX_SEGMENTS);
  const restN = Math.min(parseInt(draft.rest) || 0, MAX_SEGMENTS);
  const clockRings = [
    {
      segments: workN,
      lit:
        !session || inPrep
          ? workN
          : done
          ? 0
          : isWork
          ? Math.ceil((phaseRemaining / session.work) * workN)
          : 0,
    },
    {
      segments: restN,
      lit:
        !session || inPrep
          ? restN
          : done
          ? 0
          : isWork
          ? restN
          : session.rest > 0
          ? Math.ceil((phaseRemaining / session.rest) * restN)
          : 0,
    },
    {
      segments: setsN,
      lit: !session ? setsN : done ? 0 : setsN - Math.min(cycleIndex, setsN),
    },
  ];
  // -1 in idle: every ring renders dimmed so the preview stays quiet
  const activeRing = !session ? -1 : inPrep ? 2 : isWork ? 0 : 1;

  // Blink the dial when a new set or rest begins
  const blink = useRef(new Animated.Value(1)).current;
  const ringDust = useRef<SpaceDustHandle>(null);
  const playDust = useRef<SpaceDustHandle>(null);
  const boundaryKey = !session ? 'idle' : done ? 'done' : `${phaseName}-${cycleIndex}`;

  // VoiceOver: announce phase transitions (no-op when no screen reader is running)
  useEffect(() => {
    if (!session || inPrep) return;
    AccessibilityInfo.announceForAccessibility(
      done ? 'Workout complete' : isWork ? `Set ${currentSet}: work` : 'Rest'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundaryKey]);

  useEffect(() => {
    if (!session || reduceMotion) return;
    if (firstBoundary.current) {
      firstBoundary.current = false;
      return;
    }
    ringDust.current?.burst();
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

  // Idle preview wears a quiet Kelex grey; prep/done are white, sets bring color
  const ringColor = !session
    ? colors.grey[600]
    : done || inPrep
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

  const isMobileWeb = Platform.OS === 'web' && !isLandscape;

  return (
    <FadeIn style={styles.fill}>
      <View style={styles.fill}>
        <Header />

        <View
          style={[
            styles.body,
            isLandscape && styles.bodyRow,
            isMobileWeb && styles.bodyMobileWeb,
          ]}
        >
        <View
          style={[
            styles.configSection,
            isLandscape && styles.configLandscape,
            isMobileWeb && styles.configSectionMobileWeb,
          ]}
        >
          {session ? (
            <>
              {/* Active phase number gets a set-colored box; inactive stays plain white */}
              <ProgressRow
                label="Set"
                value={`${currentSet}`}
                activeColor={inPrep || done ? undefined : ringColor}
              />
              <ProgressRow
                label="Work"
                value={`${formatPhase(isWork ? phaseRemaining : session.work)} ${draft.unit}`}
                activeColor={isWork && !inPrep && !done ? ringColor : undefined}
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
                activeColor={!isWork && !inPrep && !done ? ringColor : undefined}
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

        <View style={isMobileWeb ? styles.ringSectionMobileWeb : styles.ringSection}>
          <Animated.View style={{ opacity: blink, alignItems: 'center' }}>
            <ProgressRing
              rings={clockRings}
              activeRing={activeRing}
              color={ringColor}
              size={ringSize}
              dustRef={ringDust}
              dustColors={
                session && !inPrep && !done
                  ? SET_DUST[(currentSet - 1) % SET_DUST.length]
                  : undefined
              }
            >
              {/* The time is the control: tap the ring to start/pause/resume; hold resets */}
              <TouchableOpacity
                style={[
                  styles.playTouch,
                  { width: ringSize * 0.7, height: ringSize * 0.7 },
                ]}
                onPress={() => {
                  if (!reduceMotion) playDust.current?.burst();
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
                accessibilityValue={{ text: `${displayTime} remaining` }}
                accessibilityHint={session ? 'Hold to reset the timer' : undefined}
              >
                <Text
                  style={[
                    styles.time,
                    {
                      color: paused ? colors.grey[500] : ringColor,
                      // Same phosphor quality as the ring bloom, scaled for text
                      textShadowColor: `${paused ? colors.grey[500] : ringColor}66`,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 12,
                    },
                  ]}
                >
                  {displayTime}
                </Text>
                <SpaceDust ref={playDust} spread={1.3} />
              </TouchableOpacity>
            </ProgressRing>
          </Animated.View>
        </View>
        </View>
        {Platform.OS === 'web' && <Footer />}
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
  // On mobile web, group the config list and the dial as one vertically
  // centered unit instead of docking the list at the top (ringSection loses
  // its flex so `justifyContent: 'center'` here can center both together)
  bodyMobileWeb: {
    justifyContent: 'center',
  },
  // Cancel the top-of-screen leading margin (meant for the docked-at-top
  // layout) so the centered group isn't pushed off-center — the gap between
  // the config box and the dial is set explicitly on ringSectionMobileWeb
  configSectionMobileWeb: {
    marginTop: 0,
  },
  // A standalone object (used instead of merging onto `ringSection`, not
  // alongside it) so no `flex: 1` from that base style ever coexists with
  // this one: mixing `flex` and `flexGrow`/`flexShrink` across merged style
  // objects left both active and the box kept expanding, overlapping the
  // config box above it. No `flex` property here at all means this box
  // simply sizes to its content.
  ringSectionMobileWeb: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[64], // 4rem gap between the config box and the dial
  },
  configLandscape: {
    flex: 1,
    width: 'auto',
    maxWidth: 420,
    marginTop: 0,
    justifyContent: 'center',
  },
  configSection: {
    width: '100%',
    maxWidth: 384,
    minHeight: CONFIG_MIN_HEIGHT,
    alignSelf: 'center',
    marginTop: spacing[24],
    paddingHorizontal: spacing[24],
  },
  // Rows carry their own symmetric spacing (8 above content, 8 below to the
  // underline) instead of a section gap, so text centers between underlines
  listRow: {
    alignSelf: 'stretch',
    paddingTop: spacing[8],
  },
  listRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 32, // fits the boxed value; matches NumberInput row so both modes line up
    paddingVertical: spacing[4],
  },
  rowLabel: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[100],
    paddingHorizontal: spacing[8],
  },
  rowValue: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(12),
    color: colors.grey[100],
    fontVariant: ['tabular-nums'],
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
  },
  underline: {
    height: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.grey[600],
    marginTop: spacing[8],
  },
  ringSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontFamily: typography.fontFamily.mono,
    fontSize: rem(21),
    color: colors.grey[100],
    fontVariant: ['tabular-nums'],
    // Room for the text-shadow glow: RN clips shadows to the Text's bounds,
    // and symmetric padding keeps the digits centered
    padding: rem(28),
  },
  playTouch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
