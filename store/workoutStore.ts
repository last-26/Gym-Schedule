import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutData, WorkoutDay, Exercise } from '../types';
import { DEFAULT_DATA } from '../constants/defaultData';

const STORAGE_KEY = '@gymtracker_data';

// Veri şemasını güncelle (eski veriden yeni şemaya migrasyon)
function migrateData(data: WorkoutData): WorkoutData {
  return data.map((day) => ({
    ...day,
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

export async function loadWorkoutData(): Promise<WorkoutData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  const parsed = JSON.parse(raw);
  return migrateData(parsed);
}

export async function saveWorkoutData(data: WorkoutData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Tüm veriyi sıfırla
export async function resetWorkoutData(): Promise<WorkoutData> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
  return DEFAULT_DATA;
}

// Tek bir günün egzersiz listesini güncelle
export async function updateDayExercises(
  dayId: string,
  exercises: Exercise[],
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) =>
    day.id === dayId ? { ...day, exercises } : day,
  );
  await saveWorkoutData(updated);
  return updated;
}

// Egzersiz ağırlığını güncelle
export async function updateExerciseWeight(
  dayId: string,
  exerciseId: string,
  weight: number | null,
): Promise<void> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, weight } : ex,
      ),
    };
  });
  await saveWorkoutData(updated);
}

// Egzersizi tamamlandı olarak işaretle
export async function toggleExerciseCompleted(
  dayId: string,
  exerciseId: string,
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex,
      ),
    };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Yeni egzersiz ekle
export async function addExercise(
  dayId: string,
  exercise: Exercise,
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return { ...day, exercises: [...day.exercises, exercise] };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Egzersiz güncelle
export async function updateExercise(
  dayId: string,
  exerciseId: string,
  updates: Partial<Pick<Exercise, 'name' | 'sets' | 'reps'>>,
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, ...updates } : ex,
      ),
    };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Egzersiz sil
export async function deleteExercise(
  dayId: string,
  exerciseId: string,
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.filter((ex) => ex.id !== exerciseId),
    };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Antrenman günü başlat
export async function startDay(dayId: string): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      isActive: true,
      exercises: day.exercises.map((ex) => ({ ...ex, completed: false })),
    };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Antrenman günü bitir
export async function completeDay(dayId: string): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      isActive: false,
      lastCompletedDate: new Date().toISOString(),
      exercises: day.exercises.map((ex) => ({ ...ex, completed: false })),
    };
  });
  await saveWorkoutData(updated);
  return updated;
}

// Yeni antrenman günü ekle
export async function addWorkoutDay(day: WorkoutDay): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = [...data, day];
  await saveWorkoutData(updated);
  return updated;
}

// Antrenman günü sil
export async function deleteWorkoutDay(dayId: string): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.filter((day) => day.id !== dayId);
  await saveWorkoutData(updated);
  return updated;
}

// Gün bilgilerini güncelle (isim, emoji, renk)
export async function updateDayInfo(
  dayId: string,
  updates: Partial<Pick<WorkoutDay, 'name' | 'emoji' | 'color' | 'exerciseColor' | 'scheduledDay'>>,
): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) =>
    day.id === dayId ? { ...day, ...updates } : day,
  );
  await saveWorkoutData(updated);
  return updated;
}

// Egzersiz görselini güncelle
export async function updateExerciseImage(
  dayId: string,
  exerciseId: string,
  image: string | undefined,
): Promise<void> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, image } : ex,
      ),
    };
  });
  await saveWorkoutData(updated);
}
