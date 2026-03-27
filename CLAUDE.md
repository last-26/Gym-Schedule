# CLAUDE.md — Gym Tracker Expo App

## Project Summary

A React Native (Expo) gym workout tracker app. Users create workout programs (days), add exercises with sets/reps/weight, start workout sessions, mark exercises as completed, and finish the day. The app features a dark theme with animated storm background (rain + lightning).

**Language:** All UI text is in English.

---

## Tech Stack

- **Framework:** React Native + Expo SDK 54
- **Navigation:** `expo-router` (file-based routing)
- **Storage:** `@react-native-async-storage/async-storage`
- **Drag & Drop:** `react-native-draggable-flatlist`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **OTA Updates:** `expo-updates` (EAS Update)
- **Language:** TypeScript

---

## File Structure

```
GymTracker/
├── app/
│   ├── _layout.tsx            # Root layout, GestureHandlerRootView, dark theme
│   ├── index.tsx              # Home screen (program cards, add/edit/delete)
│   └── day/
│       └── [id].tsx           # Day detail (exercises, start/finish workout)
├── components/
│   ├── DayCard.tsx            # Program card on home screen
│   ├── ExerciseRow.tsx        # Exercise row with weight, completion toggle
│   ├── AddExerciseModal.tsx   # New exercise form modal
│   ├── EditDayModal.tsx       # Edit program (name, emoji, card color, exercise color)
│   ├── ImageViewer.tsx        # Exercise form image viewer modal
│   └── StormBackground.tsx    # Animated rain + lightning bolt background
├── store/
│   └── workoutStore.ts        # All AsyncStorage operations + data migration
├── types/
│   └── index.ts               # TypeScript interfaces
├── constants/
│   ├── defaultData.ts         # Default 4-day program
│   └── colors.ts              # 18-color palette + emoji options
└── assets/                    # Icons, splash, exercise images (manual)
```

---

## TypeScript Types (`types/index.ts`)

```typescript
interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;           // "8-10", "12", "AMRAP"
  weight: number | null;  // current working weight (kg)
  completed: boolean;     // completed in active session
  image?: string;         // exercise form image path
  notes: string;
}

interface WorkoutDay {
  id: string;
  name: string;
  emoji: string;
  color: string;          // program card color (hex)
  exerciseColor: string;  // exercise card color inside program (hex)
  exercises: Exercise[];
  isActive: boolean;      // workout session started
  lastCompletedDate?: string;
}
```

---

## Key Features

### Home Screen (`app/index.tsx`)
- Dark background (#0D0D1A) with animated storm effect
- Program cards with customizable colors (18-color palette)
- **+ button** to add new program (modal form, card created on Save only)
- **Long press** card to edit (name, emoji, card color, exercise color) or delete
- Cards show: emoji, name, exercise count, active badge, last completed date

### Day Detail (`app/day/[id].tsx`)
- Storm background effect (same as home)
- Exercise list uses `DraggableFlatList` with flex layout for proper scrolling
- **"Start Workout"** button rendered as list footer (inside scroll)
- When active: completion checkmarks on each exercise, progress bar
- **All exercises completed** → auto-finishes silently
- **"Finish Day"** button (manual) → smart confirmation if exercises remain incomplete
- Weight display: tap pencil icon to edit, saves on blur
- Tap exercise name → opens ImageViewer (for exercise form images)
- Drag-to-reorder exercises
- **+ button** in header to add exercises

### Color System (`constants/colors.ts`)
18 colors for both card and exercise card selection:
Bordo, Canli Kirmizi, Mercan, Turuncu, Hardal, Krem, Orman Yesili,
Zumrut Yesili, Nane Yesili, Camgobegi, Acik Camgobegi, Klasik Mavi,
Gece Mavisi, Koyu Mor, Canli Mor, Lila, Antrasit, Acik Gri

Text colors auto-adapt (white on dark, black on light) via `isLightColor()` helper.

### Storm Background (`components/StormBackground.tsx`)
- 40 animated raindrops (Animated API, useNativeDriver)
- Lightning bolt: zigzag segments + glow + branches, generated procedurally
- Bolt reaches 85-95% of screen height, random position each time
- Flash sequence: bolt appears → screen flash → dim → aftershock flash → fade out
- Repeats every 4-11 seconds

### Data Layer (`store/workoutStore.ts`)
- `migrateData()` handles schema migration from old versions
- Functions: loadWorkoutData, saveWorkoutData, resetWorkoutData
- Day CRUD: addWorkoutDay, deleteWorkoutDay, updateDayInfo
- Exercise CRUD: addExercise, deleteExercise, updateDayExercises
- Workout session: startDay, completeDay, toggleExerciseCompleted
- Weight: updateExerciseWeight
- Image: updateExerciseImage

---

## Build & Update

### Development
```bash
npm install
npx expo start
```

### Build APK (EAS)
```bash
npx eas build --profile preview --platform android
```

### OTA Update (no rebuild needed)
```bash
npx eas update --branch preview --message "description"
```
`expo-updates` is configured. After the first build with it, subsequent JS-only changes can be pushed via `eas update`. Native package changes still require a new build.

---

## Important Behaviors

- **Data persistence:** Every weight change saves immediately to AsyncStorage
- **Schema migration:** Old data auto-migrates (new fields get defaults)
- **Session flow:** Start Workout → mark exercises done → auto-prompt or manual Finish Day
- **No "Complete Week" button** — replaced by per-day session system
- **Exercise images:** Manual asset files, linked via `image` field on Exercise
- **EditDayModal:** Only creates card on Save (not on + button press)
- **Bottom bar:** Start/Finish button rendered as `ListFooterComponent` inside DraggableFlatList to avoid overlap
- **Header:** `headerTransparent` is **not** used — removed to prevent status bar/content overlap on Android
- **Finish confirmation:** Smart prompt — only asks "finish without completing all?" if exercises remain incomplete; auto-finishes silently when all done
