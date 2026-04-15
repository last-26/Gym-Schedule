import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, WorkoutData, WorkoutDay, WorkoutProgram, Exercise } from '../types';
import { DEFAULT_DATA } from '../constants/defaultData';

const STORAGE_KEY = '@gymtracker_data';

// ── Migration ──────────────────────────────────────────────────────────

function migrateDays(days: any[]): WorkoutDay[] {
  return days.map((day) => ({
    ...day,
    programId: day.programId ?? 'default_program',
    isActive: day.isActive ?? false,
    exerciseColor: day.exerciseColor ?? '#212529',
    scheduledDay: day.scheduledDay ?? undefined,
    lastCompletedDate: day.lastCompletedDate ?? undefined,
    exercises: day.exercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight ?? ex.currentWeight ?? ex.lastWeight ?? null,
      completed: ex.completed ?? false,
      image: ex.image ?? undefined,
      notes: ex.notes ?? '',
    })),
  }));
}

function migrateToAppData(raw: any): AppData {
  // Already new format
  if (raw && raw.programs && raw.days) {
    return {
      programs: raw.programs,
      activeProgramId: raw.activeProgramId,
      days: migrateDays(raw.days),
    };
  }

  // Old format: flat WorkoutDay[]
  if (Array.isArray(raw)) {
    const programId = 'migrated_program';
    const days = migrateDays(raw).map((d) => ({ ...d, programId }));
    return {
      programs: [
        {
          id: programId,
          name: 'My Program',
          createdAt: new Date().toISOString(),
        },
      ],
      activeProgramId: programId,
      days,
    };
  }

  return DEFAULT_DATA;
}

// ── Core load/save ─────────────────────────────────────────────────────

export async function loadAppData(): Promise<AppData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  const parsed = JSON.parse(raw);
  const appData = migrateToAppData(parsed);
  // Persist migrated format if it was old
  if (Array.isArray(parsed)) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }
  return appData;
}

export async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Program CRUD ───────────────────────────────────────────────────────

export async function getPrograms(): Promise<WorkoutProgram[]> {
  const data = await loadAppData();
  return data.programs;
}

export async function addProgram(name: string): Promise<AppData> {
  const data = await loadAppData();
  const newProgram: WorkoutProgram = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    createdAt: new Date().toISOString(),
  };
  data.programs.push(newProgram);
  data.activeProgramId = newProgram.id;
  await saveAppData(data);
  return data;
}

export async function updateProgram(
  programId: string,
  updates: Partial<Pick<WorkoutProgram, 'name'>>,
): Promise<AppData> {
  const data = await loadAppData();
  data.programs = data.programs.map((p) =>
    p.id === programId ? { ...p, ...updates } : p,
  );
  await saveAppData(data);
  return data;
}

export async function deleteProgram(programId: string): Promise<AppData> {
  const data = await loadAppData();
  data.programs = data.programs.filter((p) => p.id !== programId);
  data.days = data.days.filter((d) => d.programId !== programId);
  if (data.activeProgramId === programId && data.programs.length > 0) {
    data.activeProgramId = data.programs[0].id;
  }
  await saveAppData(data);
  return data;
}

export async function setActiveProgram(programId: string): Promise<AppData> {
  const data = await loadAppData();
  data.activeProgramId = programId;
  await saveAppData(data);
  return data;
}

export async function duplicateProgram(programId: string, newName: string): Promise<AppData> {
  const data = await loadAppData();
  const newProgramId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const sourceProgram = data.programs.find((p) => p.id === programId);
  if (!sourceProgram) return data;

  const newProgram: WorkoutProgram = {
    id: newProgramId,
    name: newName,
    createdAt: new Date().toISOString(),
  };
  data.programs.push(newProgram);

  const sourceDays = data.days.filter((d) => d.programId === programId);
  const clonedDays = sourceDays.map((day) => ({
    ...day,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    programId: newProgramId,
    isActive: false,
    lastCompletedDate: undefined,
    exercises: day.exercises.map((ex) => ({
      ...ex,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      completed: false,
    })),
  }));
  data.days.push(...clonedDays);
  data.activeProgramId = newProgramId;
  await saveAppData(data);
  return data;
}

// ── Backward-compatible day loading (active program only) ──────────────

export async function loadWorkoutData(): Promise<WorkoutData> {
  const data = await loadAppData();
  return data.days.filter((d) => d.programId === data.activeProgramId);
}

export async function saveWorkoutData(days: WorkoutData): Promise<void> {
  const data = await loadAppData();
  // Replace days for the active program, keep other programs' days
  const otherDays = data.days.filter((d) => d.programId !== data.activeProgramId);
  data.days = [...otherDays, ...days];
  await saveAppData(data);
}

export async function resetWorkoutData(): Promise<WorkoutData> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  return DEFAULT_DATA.days;
}

// ── Day CRUD ───────────────────────────────────────────────────────────

export async function updateDayExercises(
  dayId: string,
  exercises: Exercise[],
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) =>
    day.id === dayId ? { ...day, exercises } : day,
  );
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function updateExerciseWeight(
  dayId: string,
  exerciseId: string,
  weight: number | null,
): Promise<void> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, weight } : ex,
      ),
    };
  });
  await saveAppData(appData);
}

export async function toggleExerciseCompleted(
  dayId: string,
  exerciseId: string,
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex,
      ),
    };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function addExercise(
  dayId: string,
  exercise: Exercise,
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return { ...day, exercises: [...day.exercises, exercise] };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function updateExercise(
  dayId: string,
  exerciseId: string,
  updates: Partial<Pick<Exercise, 'name' | 'sets' | 'reps'>>,
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex,
      ),
    };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function deleteExercise(
  dayId: string,
  exerciseId: string,
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
    };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function startDay(dayId: string): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      isActive: true,
      exercises: day.exercises.map((ex) => ({ ...ex, completed: false })),
    };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function completeDay(dayId: string): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      isActive: false,
      lastCompletedDate: new Date().toISOString(),
      exercises: day.exercises.map((ex) => ({ ...ex, completed: false })),
    };
  });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function addWorkoutDay(day: WorkoutDay): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days.push({ ...day, programId: appData.activeProgramId });
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function deleteWorkoutDay(dayId: string): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.filter((day) => day.id !== dayId);
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function updateDayInfo(
  dayId: string,
  updates: Partial<Pick<WorkoutDay, 'name' | 'emoji' | 'color' | 'exerciseColor' | 'scheduledDay'>>,
): Promise<WorkoutData> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) =>
    day.id === dayId ? { ...day, ...updates } : day,
  );
  await saveAppData(appData);
  return appData.days.filter((d) => d.programId === appData.activeProgramId);
}

export async function updateExerciseImage(
  dayId: string,
  exerciseId: string,
  image: string | undefined,
): Promise<void> {
  const appData = await loadAppData();
  appData.days = appData.days.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, image } : ex,
      ),
    };
  });
  await saveAppData(appData);
}
