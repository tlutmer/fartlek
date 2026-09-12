# Fartlek

A minimal interval timer for set-based workouts. Configure your sets, work, and rest; press play. One screen, no clutter — a list over a progress ring, in monochrome with a single accent color per set.

<img src="assets/fartlek.mp4" alt="Fartlek" width="402" />

## Demo

<video src="https://github.com/trentlutmer/fartlek/raw/main/assets/fartlek.mp4" width="402" controls muted playsinline></video>

## Features

### Timer
- **Simple session model** — `sets × (work + rest)`, with the total session time computed live as you configure
- **5-second get-ready countdown** before the first set so you can get in position
- **Sci-fi segment clock** — three concentric rings: sets outside, work in the middle, rest inside. Each segment is one configured unit; spent segments go dark as you go, and the active phase's ring lights up in the set's color while the others recede
- **Session countdown** in the center of the clock in `mm:ss`, colored to match the current set
- **Drift-free timing** — timestamp-based clock that stays accurate through pauses, backgrounding, and long sessions

### Controls
- **One control — the ring itself** — tap to start, pause, or resume
- **Hold to reset** the timer back to configuration
- **Shake to pause** mid-workout; shake again while paused to stop — no need to look at the screen
- **Steppers, not keyboards** — every value adjusts with +/− taps; zero shows as `None`

### Configuration
- Sets, work duration, and rest duration
- Seconds or minutes, switchable with one tap
- Defaults: 3 sets × (45s work + 15s rest)

