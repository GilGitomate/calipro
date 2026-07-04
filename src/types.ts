export type PhaseKey = 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4_deload';
export type PhaseNumber = 1 | 2 | 3 | 4;

export type DriverType =
  | 'skill'
  | 'strength_muscle'
  | 'conditioning_plyometric'
  | 'conditioning_fatloss_priority';

export type MetricType = 'reps' | 'reps_per_leg' | 'seconds';

export type CategoryColor = 'emerald' | 'indigo' | 'amber' | 'rose' | 'slate';

export type DayAbbrev = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface ExerciseMeta {
  id: string;
  name: string;
  category: string;
  metricType: MetricType;
  color: CategoryColor;
  description?: string;
}

/** A single phase's prescription for one exercise. Fields present vary by exercise/driver type. */
export interface PhasePrescription {
  sets?: number;
  reps?: number;
  reps_per_leg?: number;
  load_kg?: number;
  rest_sec?: number;
  rest_between_attempts_sec?: number;
  accumulated_time_sec?: number;
  total_duration_sec?: number;
  duration_sec?: number;
  tempo?: string;
  variation?: string;
  pattern?: string;
  pace?: string;
  note?: string;
}

export interface MainWorkoutExercise {
  id: string;
  driver_type: DriverType;
  progress_by: string;
  phase_1: PhasePrescription;
  phase_2: PhasePrescription;
  phase_3: PhasePrescription;
  phase_4_deload: PhasePrescription;
}

export interface MainWorkout {
  kind: 'main';
  id: 'Workout_A' | 'Workout_B';
  name: string;
  exercises: MainWorkoutExercise[];
}

export interface RecoveryExercise {
  id: string;
  duration_sec?: number | Partial<Record<PhaseKey, number>>;
  reps?: number;
  pace?: string;
}

export interface RecoveryWorkout {
  kind: 'recovery';
  id: string;
  name: string;
  exercises: RecoveryExercise[];
}

export interface RestWorkout {
  kind: 'rest';
  id: 'Full_Rest';
  name: string;
  exercises: [];
}

export type WorkoutDef = MainWorkout | RecoveryWorkout | RestWorkout;

export interface WarmupExercise {
  id: string;
  sets?: number;
  reps?: number;
  duration_sec?: number;
  rest_sec?: number;
  intensity?: string;
}

export interface ProgramPhase {
  phaseId: PhaseNumber;
  name: string;
  weeks: number[];
  dateRange: [string, string];
  daysPerWeek: number;
  purpose: string;
}

export type WeeklyCalendarKey = 'phase_1_2' | 'phase_3' | 'phase_4_deload';

export type WeeklyCalendar = Record<DayAbbrev, string>;

/** logging_schema_UPLOAD - what Gil submits after completing an exercise. */
export interface LogEntry {
  id: string;
  date: string;
  workoutId: string;
  exerciseId: string;
  setsCompleted: number;
  repsCompleted: number[];
  loadKg: number;
  durationSecCompleted?: number;
  /** Individual attempt times (sec) for accumulated skill practice, e.g. handstand holds. Sums to durationSecCompleted. */
  attemptsSec?: number[];
  rpe: number;
  painFlag: boolean;
  painLocation?: string;
  skipped: boolean;
  skippedReason?: string;
}

export type ProgressionAction =
  | 'increase_reps'
  | 'increase_load'
  | 'increase_tempo'
  | 'maintain'
  | 'reduce_deload'
  | 'flag_pain_rest'
  | 'advance_phase';

/** output_schema_DOWNLOAD - what the app shows Gil before his next session of this exercise. */
export interface ProgressionResult {
  exerciseId: string;
  nextSets: number;
  nextRepsOrDuration: number;
  nextLoadKg: number;
  tempoNote: string | null;
  progressionAction: ProgressionAction;
  messageToUser: string;
}

export interface AppState {
  logs: LogEntry[];
  /** Manual per-date overrides of the auto-computed schedule, keyed by ISO date. */
  scheduleOverrides: Record<string, string>;
}
