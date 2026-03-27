export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  lastWeight: number | null;
  currentWeight: number | null;
  notes: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  emoji: string;
  color: string;
  exercises: Exercise[];
}

export type WorkoutData = WorkoutDay[];
