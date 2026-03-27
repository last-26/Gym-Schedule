import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutData, Exercise } from '../types';
import { DEFAULT_DATA } from '../constants/defaultData';

const STORAGE_KEY = '@gymtracker_data';

export async function loadWorkoutData(): Promise<WorkoutData> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return DEFAULT_DATA;
  }
  return JSON.parse(raw);
}

export async function saveWorkoutData(data: WorkoutData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

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

export async function updateExerciseWeight(
  dayId: string,
  exerciseId: string,
  currentWeight: number | null,
): Promise<void> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => {
    if (day.id !== dayId) return day;
    return {
      ...day,
      exercises: day.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, currentWeight } : ex,
      ),
    };
  });
  await saveWorkoutData(updated);
}

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

export async function completeWeek(): Promise<WorkoutData> {
  const data = await loadWorkoutData();
  const updated = data.map((day) => ({
    ...day,
    exercises: day.exercises.map((ex) => ({
      ...ex,
      lastWeight: ex.currentWeight ?? ex.lastWeight,
      currentWeight: null,
    })),
  }));
  await saveWorkoutData(updated);
  return updated;
}
