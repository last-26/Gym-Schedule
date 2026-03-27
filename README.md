# GymTracker

A gym workout tracker built with React Native and Expo. Track your workout programs, exercises, weights, and daily progress with a sleek dark UI featuring animated storm effects.

## Features

- Create, edit, and delete workout programs
- Customize program cards with 18 colors and 12 emojis
- Separate color selection for exercise cards inside each program
- Add, remove, and reorder exercises via drag-and-drop
- Track exercise weights with quick inline editing
- Start/finish workout sessions per day
- Mark exercises as completed during active sessions
- Auto-complete prompt when all exercises are done
- Exercise form image viewer (add your own images to assets)
- Animated storm background with rain and procedural lightning bolts
- OTA updates via EAS Update (no reinstall needed)
- All data persisted locally with AsyncStorage

## Tech Stack

- React Native + Expo SDK 54
- TypeScript
- expo-router (file-based routing)
- AsyncStorage (local persistence)
- react-native-draggable-flatlist
- react-native-reanimated + gesture-handler
- expo-updates (OTA)

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Build

```bash
# APK for testing
npx eas build --profile preview --platform android

# OTA update (after first build)
npx eas update --branch preview --message "update description"
```

## Project Structure

```
app/
  _layout.tsx              # Root layout, dark theme
  index.tsx                # Home screen (program cards)
  day/[id].tsx             # Day detail (exercises, workout session)
components/
  DayCard.tsx              # Program card component
  ExerciseRow.tsx          # Exercise row with weight + completion
  AddExerciseModal.tsx     # New exercise form
  EditDayModal.tsx         # Edit program (name, emoji, colors)
  ImageViewer.tsx          # Exercise form image modal
  StormBackground.tsx      # Rain + lightning animation
store/
  workoutStore.ts          # AsyncStorage data layer
types/
  index.ts                 # TypeScript interfaces
constants/
  defaultData.ts           # Default 4-day program
  colors.ts                # 18-color palette + emoji options
```
