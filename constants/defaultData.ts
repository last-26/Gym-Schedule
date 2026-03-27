import { WorkoutData } from '../types';

let counter = 0;
function genId(): string {
  return Date.now().toString(36) + '_' + (counter++).toString(36);
}

export const DEFAULT_DATA: WorkoutData = [
  {
    id: 'upper1',
    name: 'Üst 1',
    emoji: '\u{1F4AA}',
    color: '#EBF5FF',
    isActive: false,
    exercises: [
      { id: genId(), name: 'Bench Press', sets: 4, reps: '8-10', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Cable Row', sets: 4, reps: '10', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Lat Pulldown', sets: 3, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Overhead Press', sets: 3, reps: '8-10', weight: null, completed: false, notes: '' },
    ],
  },
  {
    id: 'lower1',
    name: 'Alt 1',
    emoji: '\u{1F9B5}',
    color: '#FFF3EB',
    isActive: false,
    exercises: [
      { id: genId(), name: 'Squat', sets: 4, reps: '6-8', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Romanian Deadlift', sets: 3, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Leg Press', sets: 3, reps: '12-15', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Leg Curl', sets: 3, reps: '12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Calf Raise', sets: 4, reps: '15-20', weight: null, completed: false, notes: '' },
    ],
  },
  {
    id: 'upper2',
    name: 'Üst 2',
    emoji: '\u{1F3CB}\u{FE0F}',
    color: '#EBFFF2',
    isActive: false,
    exercises: [
      { id: genId(), name: 'Pull-up / Lat Pulldown', sets: 4, reps: '6-8', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Dumbbell Row', sets: 3, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Chest Fly', sets: 3, reps: '12-15', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Lateral Raise', sets: 4, reps: '15', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Tricep Pushdown', sets: 3, reps: '12-15', weight: null, completed: false, notes: '' },
    ],
  },
  {
    id: 'lower2',
    name: 'Alt 2',
    emoji: '\u{26A1}',
    color: '#F5EBFF',
    isActive: false,
    exercises: [
      { id: genId(), name: 'Deadlift', sets: 4, reps: '5', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Leg Extension', sets: 3, reps: '12-15', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Hip Thrust', sets: 4, reps: '10-12', weight: null, completed: false, notes: '' },
      { id: genId(), name: 'Standing Calf Raise', sets: 4, reps: '15-20', weight: null, completed: false, notes: '' },
    ],
  },
];
