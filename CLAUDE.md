# CLAUDE.md — Gym Tracker Expo App

## Project Summary

A React Native (Expo) gym workout tracker app. Users manage multiple workout **programs** (e.g. "Push/Pull/Legs", "Upper/Lower Split"), each containing workout days with exercises. Users can switch between programs, keeping old ones archived. Within a program, users add exercises with sets/reps/weight, start workout sessions, mark exercises as completed, and finish the day. The app features a dark theme with animated storm background (rain + lightning).

**Language:** All UI text is in English.

---

## Tech Stack

- **Framework:** React Native + Expo SDK 54
- **Navigation:** `expo-router` (file-based routing)
- **Storage:** `@react-native-async-storage/async-storage`
- **Drag & Drop:** `react-native-draggable-flatlist`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **OTA Updates:** `expo-updates` (EAS Update)
- **Image Picker:** `expo-image-picker` (gallery access)
- **File System:** `expo-file-system` (persistent image storage)
- **Language:** TypeScript

---

## File Structure

```
GymTracker/
├── app/
│   ├── _layout.tsx            # Root layout, GestureHandlerRootView, dark theme
│   ├── index.tsx              # Home screen (program selector, day cards)
│   └── day/
│       └── [id].tsx           # Day detail (exercises, start/finish workout)
├── components/
│   ├── DayCard.tsx            # Day card on home screen
│   ├── ExerciseRow.tsx        # Exercise row with weight, completion toggle
│   ├── AddExerciseModal.tsx   # New exercise form modal
│   ├── EditDayModal.tsx       # Edit day (name, emoji, card color, exercise color)
│   ├── ProgramSelector.tsx    # Program switch/create/rename/delete/duplicate modal
│   ├── ImageViewer.tsx        # Exercise image management modal (pick/change/remove)
│   ├── FullScreenImage.tsx    # Full-screen dark overlay image viewer (view only)
│   └── StormBackground.tsx    # Animated rain + lightning bolt background
├── store/
│   └── workoutStore.ts        # All AsyncStorage operations + data migration
├── types/
│   └── index.ts               # TypeScript interfaces
├── constants/
│   ├── defaultData.ts         # Default program with 4 days
│   └── colors.ts              # 18-color palette + emoji options
└── assets/                    # Icons, splash, exercise images (manual)
```

---

## Data Hierarchy

**Program > Days > Exercises**

The app uses a three-level hierarchy:
- **Programs** (`WorkoutProgram[]`): top-level containers (e.g. "Push/Pull/Legs")
- **Days** (`WorkoutDay[]`): workout days within a program, each linked via `programId`
- **Exercises** (`Exercise[]`): exercises within a day

One program is **active** at a time (`activeProgramId`). The home screen shows only the active program's days. Users switch programs via the program selector pill.

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
  programId: string;      // which program this day belongs to
  name: string;
  emoji: string;
  color: string;          // day card color (hex)
  exerciseColor: string;  // exercise card color inside day (hex)
  scheduledDay?: string;  // day of week (Monday, Tuesday, etc.)
  exercises: Exercise[];
  isActive: boolean;      // workout session started
  lastCompletedDate?: string;
}

interface WorkoutProgram {
  id: string;
  name: string;
  createdAt: string;
}

interface AppData {
  programs: WorkoutProgram[];
  activeProgramId: string;
  days: WorkoutDay[];
}
```

---

## Key Features

### Program Management (`components/ProgramSelector.tsx`)
- **Program selector pill** on home screen (below header) shows active program name
- Tap pill → opens dark-themed bottom sheet with all programs
- Active program highlighted with blue border + checkmark
- Tap a program → switches to it (home screen updates)
- **"New Program"** button → inline name input to create empty program
- **Long press** a program → action menu: Rename, Duplicate, Delete
- Cannot delete last remaining program
- Duplicate copies all days and exercises (resets completion state)

### Home Screen (`app/index.tsx`)
- Dark background (#0D0D1A) with animated storm effect
- Program selector pill (see above)
- Day cards with customizable colors (18-color palette)
- **+ button** to add new day to active program (modal form, card created on Save only)
- **Long press** card to edit (name, emoji, card color, exercise color, scheduled day) or delete
- Cards show: emoji, name, scheduled day, exercise count, last completed date (inline)
- **Auto-sorted** by day of week (Monday → Sunday), unscheduled days at bottom

### Day Detail (`app/day/[id].tsx`)
- Storm background effect (same as home)
- Exercise list uses `DraggableFlatList` with flex layout for proper scrolling
- **"Start Workout"** button rendered as list footer (inside scroll)
- When active: completion checkmarks on each exercise, progress bar
- **All exercises completed** → auto-finishes silently
- **"Finish Day"** button (manual) → smart confirmation if exercises remain incomplete
- Weight display: tap pencil icon to edit, saves on blur
- Tap exercise name → opens ImageViewer (pick/change/remove image from gallery)
- **Eye icon** on exercise row (visible when image exists) → full-screen dark overlay image viewer
- **Edit icon** (pencil) on exercise row → edit name, sets, reps via modal
- **Delete icon** (trash) on exercise row → delete with confirmation
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
- **AppData format:** `{ programs, activeProgramId, days }` — all stored under single AsyncStorage key
- **Migration:** Auto-detects old flat `WorkoutDay[]` format → wraps in AppData with default program
- `migrateDays()` handles per-day field migration (new fields get defaults)
- **Program CRUD:** addProgram, updateProgram, deleteProgram, setActiveProgram, duplicateProgram
- **Day loading:** `loadWorkoutData()` returns only active program's days (backward-compatible)
- Day CRUD: addWorkoutDay, deleteWorkoutDay, updateDayInfo
- Exercise CRUD: addExercise, deleteExercise, updateExercise, updateDayExercises
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
- **Schema migration:** Old flat array data auto-migrates to AppData format (programs + days)
- **Program switching:** Changing active program immediately updates home screen day list
- **Session flow:** Start Workout → mark exercises done → auto-prompt or manual Finish Day
- **No "Complete Week" button** — replaced by per-day session system
- **Exercise images:** Picked from device gallery via `expo-image-picker`, copied to `documentDirectory/exercise-images/` for persistence
- **EditDayModal:** Only creates card on Save (not on + button press)
- **Bottom bar:** Start/Finish button rendered as `ListFooterComponent` inside DraggableFlatList to avoid overlap
- **Header:** `headerTransparent` is **not** used — removed to prevent status bar/content overlap on Android
- **Finish confirmation:** Smart prompt — only asks "finish without completing all?" if exercises remain incomplete; auto-finishes silently when all done
