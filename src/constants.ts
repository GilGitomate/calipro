import {
  ExerciseMeta,
  MainWorkout,
  ProgramPhase,
  RecoveryWorkout,
  RestWorkout,
  WarmupExercise,
  WeeklyCalendar,
  WeeklyCalendarKey,
  WorkoutDef,
} from './types';

export const PROGRAM_META = {
  programName: 'Gil Recomposition Program - Calisthenics & Hybrid Growth v2',
  startDate: '2026-07-05',
  timezone: 'Asia/Bangkok',
  goal: 'Fat loss + strength/muscle retention, returning after 2-month training break',
  equipment: [
    'dumbbell_8kg',
    'dumbbell_10kg',
    'jump_rope_weighted_10kg_handles',
    'parallel_bars',
    'resistance_bands',
    'pull_up_chin_up_bar',
  ],
  cycleLengthWeeks: 8,
};

export const PHASES: ProgramPhase[] = [
  {
    phaseId: 1,
    name: 'Reintroduction',
    weeks: [1, 2],
    dateRange: ['2026-07-05', '2026-07-18'],
    daysPerWeek: 5,
    purpose: 'Rebuild tissue tolerance and form after layoff. Lowest volume of the cycle.',
  },
  {
    phaseId: 2,
    name: 'Build-up',
    weeks: [3, 4],
    dateRange: ['2026-07-19', '2026-08-01'],
    daysPerWeek: 5,
    purpose: 'Increase volume and jump-training intensity now tissue tolerance is confirmed.',
  },
  {
    phaseId: 3,
    name: 'Full Load',
    weeks: [5, 6, 7],
    dateRange: ['2026-08-02', '2026-08-22'],
    daysPerWeek: 6,
    purpose: 'Full original training frequency and volume. Primary strength/muscle-building block.',
  },
  {
    phaseId: 4,
    name: 'Deload',
    weeks: [8],
    dateRange: ['2026-08-23', '2026-08-29'],
    daysPerWeek: 6,
    purpose:
      'Cut volume ~45% across all lifts, remove plyometric peak intensity, let joints and CNS recover before next loading block.',
  },
];

export const WEEKLY_CALENDARS: Record<WeeklyCalendarKey, WeeklyCalendar> = {
  phase_1_2: {
    Sun: 'Workout_A',
    Mon: 'Active_Recovery_Light',
    Tue: 'Workout_B',
    Wed: 'Active_Recovery_Mobility',
    Thu: 'Workout_A',
    Fri: 'Full_Rest',
    Sat: 'Active_Recovery_Rope',
  },
  phase_3: {
    Sun: 'Workout_A',
    Mon: 'Workout_B',
    Tue: 'Active_Recovery_Mobility',
    Wed: 'Workout_A',
    Thu: 'Workout_B',
    Fri: 'Full_Rest',
    Sat: 'Active_Recovery_Rope',
  },
  phase_4_deload: {
    Sun: 'Workout_A_Deload',
    Mon: 'Workout_B_Deload',
    Tue: 'Active_Recovery_Mobility',
    Wed: 'Workout_A_Deload',
    Thu: 'Workout_B_Deload',
    Fri: 'Full_Rest',
    Sat: 'Active_Recovery_Rope_Light',
  },
};

export const WARMUP: WarmupExercise[] = [
  { id: 'jump_rope_warmup', duration_sec: 300 },
  { id: 'wrist_circles', duration_sec: 120 },
  { id: 'shoulder_dislocations', reps: 15 },
  { id: 'cat_cow', reps: 12 },
  { id: 'scapular_pullups', sets: 2, reps: 10, rest_sec: 30 },
  { id: 'straight_arm_plank', sets: 2, duration_sec: 45, rest_sec: 30 },
];

export const WORKOUT_A: MainWorkout = {
  kind: 'main',
  id: 'Workout_A',
  name: 'Push & Legs',
  exercises: [
    {
      id: 'handstand_practice',
      driver_type: 'skill',
      progress_by: 'time_only',
      phase_1: { accumulated_time_sec: 300, rest_between_attempts_sec: 60 },
      phase_2: { accumulated_time_sec: 480, rest_between_attempts_sec: 60 },
      phase_3: { accumulated_time_sec: 600, rest_between_attempts_sec: 60 },
      phase_4_deload: { accumulated_time_sec: 300, rest_between_attempts_sec: 60 },
    },
    {
      id: 'dips',
      driver_type: 'strength_muscle',
      progress_by: 'reps_then_tempo',
      phase_1: { sets: 2, reps: 8, rest_sec: 90 },
      phase_2: { sets: 3, reps: 10, rest_sec: 90 },
      phase_3: { sets: 3, reps: 12, tempo: '3sec_eccentric', rest_sec: 90 },
      phase_4_deload: { sets: 2, reps: 8, rest_sec: 90 },
    },
    {
      id: 'pushups',
      driver_type: 'strength_muscle',
      progress_by: 'reps_then_variation',
      phase_1: { sets: 2, reps: 12, rest_sec: 60 },
      phase_2: { sets: 3, reps: 15, rest_sec: 60 },
      phase_3: { sets: 3, reps: 18, variation: 'feet_elevated_optional', rest_sec: 60 },
      phase_4_deload: { sets: 2, reps: 10, rest_sec: 60 },
    },
    {
      id: 'pike_pushups',
      driver_type: 'strength_muscle',
      progress_by: 'reps',
      phase_1: { sets: 2, reps: 8, rest_sec: 90 },
      phase_2: { sets: 3, reps: 10, rest_sec: 90 },
      phase_3: { sets: 3, reps: 12, rest_sec: 90 },
      phase_4_deload: { sets: 2, reps: 8, rest_sec: 90 },
    },
    {
      id: 'jump_squat',
      driver_type: 'conditioning_plyometric',
      progress_by: 'volume_only_never_load',
      phase_1: { sets: 2, reps: 6, rest_sec: 60, note: 'Low volume from day 1 - ramping intensity, not skipping. Submaximal height, soft landing.' },
      phase_2: { sets: 3, reps: 8, rest_sec: 75 },
      phase_3: { sets: 3, reps: 12, rest_sec: 90 },
      phase_4_deload: { sets: 2, reps: 6, rest_sec: 60, note: 'Deload - submaximal height, prioritize landing mechanics over power.' },
    },
    {
      id: 'jump_lunge',
      driver_type: 'conditioning_plyometric',
      progress_by: 'volume_only_never_load',
      phase_1: { sets: 2, reps_per_leg: 5, rest_sec: 60, note: 'Low volume from day 1 - ramping intensity, not skipping. Submaximal height, soft landing.' },
      phase_2: { sets: 3, reps_per_leg: 6, rest_sec: 75 },
      phase_3: { sets: 3, reps_per_leg: 10, rest_sec: 90 },
      phase_4_deload: { sets: 2, reps_per_leg: 5, rest_sec: 60, note: 'Deload - submaximal height, prioritize landing mechanics over power.' },
    },
    {
      id: 'jump_rope_intervals',
      driver_type: 'conditioning_fatloss_priority',
      progress_by: 'duration_and_intensity',
      phase_1: { total_duration_sec: 120, pattern: '20s_fast_10s_slow', note: 'Full priority from day 1 per user request' },
      phase_2: { total_duration_sec: 180, pattern: '20s_fast_10s_slow' },
      phase_3: { total_duration_sec: 180, pattern: '25s_fast_10s_slow' },
      phase_4_deload: { total_duration_sec: 60, pattern: 'easy_pace' },
    },
  ],
};

export const WORKOUT_B: MainWorkout = {
  kind: 'main',
  id: 'Workout_B',
  name: 'Pull & Core',
  exercises: [
    {
      id: 'crow_pose_practice',
      driver_type: 'skill',
      progress_by: 'time_only',
      phase_1: { accumulated_time_sec: 240, rest_between_attempts_sec: 60 },
      phase_2: { accumulated_time_sec: 360, rest_between_attempts_sec: 60 },
      phase_3: { accumulated_time_sec: 480, rest_between_attempts_sec: 60 },
      phase_4_deload: { accumulated_time_sec: 240, rest_between_attempts_sec: 60 },
    },
    {
      id: 'pullups',
      driver_type: 'strength_muscle',
      progress_by: 'reps_then_tempo',
      phase_1: { sets: 3, reps: 6, rest_sec: 120 },
      phase_2: { sets: 4, reps: 8, rest_sec: 120 },
      phase_3: { sets: 4, reps: 10, tempo: '3sec_eccentric', rest_sec: 120 },
      phase_4_deload: { sets: 2, reps: 6, rest_sec: 120 },
    },
    {
      id: 'bar_rows',
      driver_type: 'strength_muscle',
      progress_by: 'reps_then_leverage',
      phase_1: { sets: 3, reps: 10, rest_sec: 90 },
      phase_2: { sets: 4, reps: 12, rest_sec: 90 },
      phase_3: { sets: 4, reps: 15, variation: 'feet_further_forward_optional', rest_sec: 90 },
      phase_4_deload: { sets: 2, reps: 10, rest_sec: 90 },
    },
    {
      id: 'chinups',
      driver_type: 'strength_muscle',
      progress_by: 'reps',
      phase_1: { sets: 2, reps: 8, rest_sec: 90 },
      phase_2: { sets: 2, reps: 10, rest_sec: 90 },
      phase_3: { sets: 2, reps: 12, rest_sec: 90 },
      phase_4_deload: { sets: 2, reps: 6, rest_sec: 90 },
    },
    {
      id: 'hanging_leg_raises',
      driver_type: 'strength_muscle',
      progress_by: 'reps',
      phase_1: { sets: 2, reps: 10, rest_sec: 60 },
      phase_2: { sets: 3, reps: 12, rest_sec: 60 },
      phase_3: { sets: 3, reps: 15, rest_sec: 60 },
      phase_4_deload: { sets: 2, reps: 8, rest_sec: 60 },
    },
    {
      id: 'lsit_hold',
      driver_type: 'strength_muscle',
      progress_by: 'duration',
      phase_1: { sets: 2, duration_sec: 15, rest_sec: 90 },
      phase_2: { sets: 3, duration_sec: 20, rest_sec: 90 },
      phase_3: { sets: 3, duration_sec: 30, rest_sec: 90 },
      phase_4_deload: { sets: 2, duration_sec: 15, rest_sec: 90 },
    },
    {
      id: 'jump_rope_freestyle',
      driver_type: 'conditioning_fatloss_priority',
      progress_by: 'duration',
      phase_1: { total_duration_sec: 180, pace: 'moderate_even' },
      phase_2: { total_duration_sec: 240, pace: 'moderate_even' },
      phase_3: { total_duration_sec: 300, pace: 'moderate_even' },
      phase_4_deload: { total_duration_sec: 120, pace: 'easy' },
    },
  ],
};

const ACTIVE_RECOVERY_LIGHT: RecoveryWorkout = {
  kind: 'recovery',
  id: 'Active_Recovery_Light',
  name: 'Light rope + mobility (weeks 1-4 only)',
  exercises: [
    { id: 'jump_rope_light', duration_sec: { phase_1: 600, phase_2: 900 } },
    { id: 'pigeon_stretch', duration_sec: 120 },
    { id: 'hamstring_fold', duration_sec: 120 },
  ],
};

const ACTIVE_RECOVERY_MOBILITY: RecoveryWorkout = {
  kind: 'recovery',
  id: 'Active_Recovery_Mobility',
  name: 'Mobility only, no rope',
  exercises: [
    { id: 'passive_dead_hang', duration_sec: 90 },
    { id: 'pigeon_stretch', duration_sec: 120 },
    { id: 'shoulder_flexion_stretch', duration_sec: 90 },
    { id: 'hamstring_fold', duration_sec: 120 },
    { id: 'cobra_pose', duration_sec: 60 },
  ],
};

const ACTIVE_RECOVERY_ROPE: RecoveryWorkout = {
  kind: 'recovery',
  id: 'Active_Recovery_Rope',
  name: 'Jump rope cardio + mobility',
  exercises: [
    { id: 'jump_rope_cardio', duration_sec: { phase_1: 900, phase_2: 1200, phase_3: 1500 }, pace: 'easy_conversational' },
    { id: 'wrist_circles', duration_sec: 60 },
    { id: 'cat_cow', reps: 10 },
    { id: 'pigeon_stretch', duration_sec: 60 },
    { id: 'hamstring_fold', duration_sec: 60 },
  ],
};

const ACTIVE_RECOVERY_ROPE_LIGHT: RecoveryWorkout = {
  kind: 'recovery',
  id: 'Active_Recovery_Rope_Light',
  name: 'Deload week cardio - reduced',
  exercises: [
    { id: 'jump_rope_cardio', duration_sec: 600, pace: 'easy_conversational' },
    { id: 'mobility_flow', duration_sec: 300 },
  ],
};

const FULL_REST: RestWorkout = {
  kind: 'rest',
  id: 'Full_Rest',
  name: 'Full rest - no training',
  exercises: [],
};

/** Keyed by the workout ids that appear in WEEKLY_CALENDARS. Workout_A_Deload/Workout_B_Deload
 * are resolved in lib/phase.ts to the base workout forced onto the phase_4_deload prescription. */
export const WORKOUTS: Record<string, WorkoutDef> = {
  Workout_A: WORKOUT_A,
  Workout_B: WORKOUT_B,
  Active_Recovery_Light: ACTIVE_RECOVERY_LIGHT,
  Active_Recovery_Mobility: ACTIVE_RECOVERY_MOBILITY,
  Active_Recovery_Rope: ACTIVE_RECOVERY_ROPE,
  Active_Recovery_Rope_Light: ACTIVE_RECOVERY_ROPE_LIGHT,
  Full_Rest: FULL_REST,
};

export const EXERCISE_CATALOG: Record<string, ExerciseMeta> = {
  jump_rope_warmup: { id: 'jump_rope_warmup', name: 'Jump Rope Warmup', category: 'Warmup', metricType: 'seconds', color: 'amber', description: 'Easy to moderate pace. Establish breathing rhythm.' },
  wrist_circles: { id: 'wrist_circles', name: 'Wrist Circles & Stretches', category: 'Warmup', metricType: 'seconds', color: 'amber', description: 'Palm-up/palm-down pulses.' },
  shoulder_dislocations: { id: 'shoulder_dislocations', name: 'Shoulder Dislocations', category: 'Warmup', metricType: 'reps', color: 'amber', description: 'Use a stick or resistance band.' },
  cat_cow: { id: 'cat_cow', name: 'Cat-Cow Stretch', category: 'Warmup', metricType: 'reps', color: 'amber', description: 'Mobilize the spine.' },
  scapular_pullups: { id: 'scapular_pullups', name: 'Scapular Pull-ups', category: 'Warmup', metricType: 'reps', color: 'amber', description: 'Dead hang, pull shoulder blades down.' },
  straight_arm_plank: { id: 'straight_arm_plank', name: 'Straight Arm Plank', category: 'Warmup', metricType: 'seconds', color: 'amber', description: 'Push floor away (protract shoulders).' },

  handstand_practice: { id: 'handstand_practice', name: 'Handstand Practice (Chest-to-wall)', category: 'Skill', metricType: 'seconds', color: 'amber', description: 'Hollow body, actively push away from the floor.' },
  dips: { id: 'dips', name: 'Dips (Standard/Bar)', category: 'Push', metricType: 'reps', color: 'emerald', description: 'Full ROM. Controlled eccentric.' },
  pushups: { id: 'pushups', name: 'Push-ups', category: 'Push', metricType: 'reps', color: 'emerald', description: 'Elbows tucked ~45 degrees.' },
  pike_pushups: { id: 'pike_pushups', name: 'Pike Push-ups', category: 'Push', metricType: 'reps', color: 'emerald', description: 'Vertical pushing path, shoulder focus.' },
  jump_squat: { id: 'jump_squat', name: 'Jump Squat', category: 'Legs', metricType: 'reps', color: 'rose', description: 'Explosive power, soft landing.' },
  jump_lunge: { id: 'jump_lunge', name: 'Jump Lunge', category: 'Legs', metricType: 'reps_per_leg', color: 'rose', description: 'Explosive alternating switch, soft landing.' },
  jump_rope_intervals: { id: 'jump_rope_intervals', name: 'Jump Rope Intervals', category: 'Finisher', metricType: 'seconds', color: 'rose', description: 'High-intensity interval pacing.' },

  crow_pose_practice: { id: 'crow_pose_practice', name: 'Crow Pose Practice', category: 'Skill', metricType: 'seconds', color: 'amber', description: 'Balance practice, forearm/hand grip engagement.' },
  pullups: { id: 'pullups', name: 'Pull-ups (Standard)', category: 'Pull', metricType: 'reps', color: 'indigo', description: 'Chest to bar, controlled eccentric.' },
  bar_rows: { id: 'bar_rows', name: 'Ring/Bar Rows (Horizontal Pull)', category: 'Pull', metricType: 'reps', color: 'indigo', description: 'Rigid plank, pull chest to bar/rings.' },
  chinups: { id: 'chinups', name: 'Chin-ups', category: 'Pull', metricType: 'reps', color: 'indigo', description: 'Underhand grip, bicep squeeze at top.' },
  hanging_leg_raises: { id: 'hanging_leg_raises', name: 'Hanging Knee/Leg Raises', category: 'Core', metricType: 'reps', color: 'indigo', description: 'Slow hip flexor control, minimal swing.' },
  lsit_hold: { id: 'lsit_hold', name: 'L-Sit / Tuck L-Sit Hold', category: 'Core', metricType: 'seconds', color: 'indigo', description: 'Shoulders depressed, knees or legs lifted.' },
  jump_rope_freestyle: { id: 'jump_rope_freestyle', name: 'Jump Rope Freestyle', category: 'Finisher', metricType: 'seconds', color: 'rose', description: 'Consistent, fluid moderate rhythm.' },

  jump_rope_light: { id: 'jump_rope_light', name: 'Jump Rope (Light)', category: 'LISS', metricType: 'seconds', color: 'slate', description: 'Light pace recovery cardio.' },
  pigeon_stretch: { id: 'pigeon_stretch', name: 'Pigeon Stretch', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'Per side.' },
  hamstring_fold: { id: 'hamstring_fold', name: 'Hamstring Fold', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'Sitting or standing.' },
  passive_dead_hang: { id: 'passive_dead_hang', name: 'Passive Dead Hang', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'Decompress the spine.' },
  shoulder_flexion_stretch: { id: 'shoulder_flexion_stretch', name: 'Shoulder Flexion', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'Against a wall.' },
  cobra_pose: { id: 'cobra_pose', name: 'Cobra Pose', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'Abdominal/spine stretch.' },
  jump_rope_cardio: { id: 'jump_rope_cardio', name: 'Jump Rope Cardio (LISS)', category: 'LISS', metricType: 'seconds', color: 'slate', description: 'Conversational pace.' },
  mobility_flow: { id: 'mobility_flow', name: 'Mobility Flow', category: 'Stretch', metricType: 'seconds', color: 'slate', description: 'General joint mobility flow.' },
};
