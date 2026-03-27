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
  name: string;
  emoji: string;
  color: string;
  exerciseColor: string;       // egzersiz kartlarinin rengi
  exercises: Exercise[];
  isActive: boolean;           // antrenman başlatıldı mı
  lastCompletedDate?: string;  // son tamamlanma tarihi
}

export type WorkoutData = WorkoutDay[];
