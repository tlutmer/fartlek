---
name: "Fartlek — React Native App"
description: "Build or modify screens and components in the Fartlek Expo/React Native app. Use when working in src/components/, src/screens/, or src/theme/."
---

## Overview

Fartlek is a React Native app built with Expo (SDK 54). It uses Kelex design tokens (`src/theme/tokens.ts`) and shares core visual components — `Bevel`, `BevelCard`, `CircularDial`, `NumberInput` — adapted from the Kelex design system for React Native.

## When to Apply

- Adding or modifying a component in `src/components/`
- Adding or modifying a screen in `src/screens/`
- Updating design tokens in `src/theme/tokens.ts`
- Running or debugging the app

## Commands

```bash
npm start           # Expo dev server
npm run ios         # Run on iOS simulator
npm run android     # Run on Android emulator
npm run web         # Run in browser
```

## Architecture

- `src/theme/tokens.ts` — Kelex color, spacing, and typography tokens for React Native (no CSS vars; values are plain JS)
- `src/components/` — Shared primitives: `Bevel.tsx`, `BevelCard.tsx`, `CircularDial.tsx`, `NumberInput.tsx`
- `src/screens/` — Full screen views composed from components
- SVG rendering uses `react-native-svg`

## Token Convention

Tokens mirror the Kelex system but as TypeScript constants (not CSS custom properties). Reference `tokens.ts` for all color and spacing values — never hardcode hex values inline.
