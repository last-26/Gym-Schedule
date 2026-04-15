export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number | null;       // mevcut çalışma ağırlığı
  completed: boolean;          // bu seansta tamamlandı mı
  image?: string;              // egzersiz form görseli (asset dosya adı)
  notes: string;
}

export interface WorkoutDay {
  id: string;
  programId: string;           // hangi programa ait
  name: string;
  emoji: string;
  color: string;
  exerciseColor: string;       // egzersiz kartlarinin rengi
  scheduledDay?: string;       // haftanın günü (Monday, Tuesday, vb.)
  exercises: Exercise[];
  isActive: boolean;           // antrenman başlatıldı mı
  lastCompletedDate?: string;  // son tamamlanma tarihi
}

export interface WorkoutProgram {
  id: string;
  name: string;
  createdAt: string;
}

export interface AppData {
  programs: WorkoutProgram[];
  activeProgramId: string;
  days: WorkoutDay[];
}

export type WorkoutData = WorkoutDay[];
