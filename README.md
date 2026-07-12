# Fartlek

A minimal interval timer for set-based workouts. Configure your sets, work, and rest; press play. One screen, no clutter — an iPod-inspired list over a progress ring, in monochrome with a single accent color per set.

Built with Expo / React Native. Runs on iOS, Android, and the web.

## Features

### Timer
- **Simple session model** — `sets × (work + rest)`, with the total session time computed live as you configure
- **5-second get-ready countdown** before the first set so you can get in position
- **Per-phase progress ring** — the dot sweeps one full lap for each phase (prep, work, rest), so a glance tells you how far into the current interval you are
- **Session countdown** above the ring in `mm:ss`
- **Drift-free timing** — timestamp-based clock that stays accurate through pauses, backgrounding, and long sessions

### Controls
- **One control, in the center of the ring** — play to start or resume, pause while running
- **Hold to reset** the timer back to configuration
- **Shake to pause** mid-workout; shake again while paused to stop — no need to look at the screen
- **Steppers, not keyboards** — every value adjusts with +/− taps; zero shows as `None`

### Configuration
- Sets, work duration, and rest duration
- Seconds or minutes, switchable with one tap
- Defaults: 3 sets × (10s work + 5s rest)

### Feedback
- **Set colors rotate** cyan → magenta → yellow (repeating) across sets — the ring and the active phase number always match
- **Progress rows** show Set / Work / Rest live, with the active phase counting down in the set color
- **Distinct beeps**: a tick per countdown second, a double-beep at every set start, a long tone at the finish
- **Audio mixes over your music** — beeps play on top of Spotify (iOS) or briefly duck it (Android), and work with the mute switch on
- **Blink cue** on every phase boundary (respects the system reduce-motion setting)

### Mobile-ready
- Screen stays awake during a session
- Portrait-locked, safe-area aware (Dynamic Island to home indicator)
- Scales down to small screens (iPhone SE class) without clipping
- Screen-reader labels on every control, 44pt touch targets

## Development

```bash
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone, or press `i` for the iOS simulator / `w` for the web.
