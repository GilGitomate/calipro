import { PHASES, PROGRAM_META, WEEKLY_CALENDARS, WORKOUT_A, WORKOUT_B, WORKOUTS } from '../constants';
import {
  DayAbbrev,
  LogEntry,
  MainWorkoutExercise,
  PhaseKey,
  PhaseNumber,
  RecoveryExercise,
  WeeklyCalendarKey,
  WorkoutDef,
} from '../types';

const DAY_ABBREVS: DayAbbrev[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function todayISO(): string {
  return toISODate(new Date());
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function getDayAbbrev(date: string): DayAbbrev {
  return DAY_ABBREVS[new Date(`${date}T00:00:00`).getDay()];
}

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

/** 1-based week number since PROGRAM_META.startDate. Dates before start clamp to week 1. */
export function getWeekNumber(date: string): number {
  const diff = daysBetween(PROGRAM_META.startDate, date);
  return diff < 0 ? 1 : Math.floor(diff / 7) + 1;
}

export interface NominalPhase {
  phaseKey: PhaseKey;
  phaseNumber: PhaseNumber;
  cycleNumber: number;
  weekInCycle: number;
}

/**
 * Cycle 1 follows phases 1-4 in order. Per post_cycle_instructions, every later cycle
 * restarts at Phase 3 (Full Load) instead of Phase 1, since Gil is no longer "returning"
 * after the first cycle - only week 8 of each cycle is ever a deload.
 */
export function getNominalPhase(weekNumber: number): NominalPhase {
  const cycleLength = PROGRAM_META.cycleLengthWeeks;
  const cycleNumber = Math.floor((weekNumber - 1) / cycleLength) + 1;
  const weekInCycle = ((weekNumber - 1) % cycleLength) + 1;

  if (cycleNumber === 1) {
    if (weekInCycle <= 2) return { phaseKey: 'phase_1', phaseNumber: 1, cycleNumber, weekInCycle };
    if (weekInCycle <= 4) return { phaseKey: 'phase_2', phaseNumber: 2, cycleNumber, weekInCycle };
    if (weekInCycle <= 7) return { phaseKey: 'phase_3', phaseNumber: 3, cycleNumber, weekInCycle };
    return { phaseKey: 'phase_4_deload', phaseNumber: 4, cycleNumber, weekInCycle };
  }

  if (weekInCycle <= 7) return { phaseKey: 'phase_3', phaseNumber: 3, cycleNumber, weekInCycle };
  return { phaseKey: 'phase_4_deload', phaseNumber: 4, cycleNumber, weekInCycle };
}

export function getAllMainExercises(): MainWorkoutExercise[] {
  return [...WORKOUT_A.exercises, ...WORKOUT_B.exercises];
}

export interface EarlyDeloadCheck {
  forced: boolean;
  reason?: string;
}

/** deload_early_trigger_rules from the progression engine spec. */
export function checkEarlyDeload(logs: LogEntry[], weekNumber: number, nominalPhaseKey: PhaseKey): EarlyDeloadCheck {
  if (nominalPhaseKey === 'phase_4_deload') return { forced: false };

  const currentWeekLogs = logs.filter((l) => getWeekNumber(l.date) === weekNumber);
  const painExercises = new Set(currentWeekLogs.filter((l) => l.painFlag).map((l) => l.exerciseId));
  if (painExercises.size >= 3) {
    return {
      forced: true,
      reason: `Pain flagged on ${painExercises.size} different exercises this week - deload triggered early.`,
    };
  }

  const prevWeekLogs = logs.filter((l) => getWeekNumber(l.date) === weekNumber - 1);
  const strengthIds = new Set(getAllMainExercises().filter((e) => e.driver_type === 'strength_muscle').map((e) => e.id));
  const strengthLogs = prevWeekLogs.filter((l) => strengthIds.has(l.exerciseId) && !l.skipped);
  if (strengthLogs.length > 0) {
    const avgRpe = strengthLogs.reduce((s, l) => s + l.rpe, 0) / strengthLogs.length;
    if (avgRpe >= 8.5) {
      return {
        forced: true,
        reason: `Average RPE across strength work last week was ${avgRpe.toFixed(1)} - deload triggered early.`,
      };
    }
  }

  return { forced: false };
}

function calendarKeyForPhase(phaseKey: PhaseKey): WeeklyCalendarKey {
  if (phaseKey === 'phase_4_deload') return 'phase_4_deload';
  if (phaseKey === 'phase_3') return 'phase_3';
  return 'phase_1_2';
}

/** Workout_A_Deload / Workout_B_Deload are schedule-only aliases: same exercise list as the
 * base workout, with phaseKey already forced to phase_4_deload by the caller. */
export function resolveWorkoutKey(key: string): WorkoutDef {
  if (key === 'Workout_A_Deload') return WORKOUTS.Workout_A;
  if (key === 'Workout_B_Deload') return WORKOUTS.Workout_B;
  return WORKOUTS[key];
}

export interface ResolvedDay {
  date: string;
  dayAbbrev: DayAbbrev;
  weekNumber: number;
  cycleNumber: number;
  weekInCycle: number;
  phaseKey: PhaseKey;
  phaseNumber: PhaseNumber;
  phaseName: string;
  workoutKey: string;
  workout: WorkoutDef;
  earlyDeload: boolean;
  earlyDeloadReason?: string;
  isOverridden: boolean;
}

export function resolveDay(date: string, logs: LogEntry[], overrides: Record<string, string>): ResolvedDay {
  const weekNumber = getWeekNumber(date);
  const nominal = getNominalPhase(weekNumber);
  const earlyDeload = checkEarlyDeload(logs, weekNumber, nominal.phaseKey);
  const phaseKey: PhaseKey = earlyDeload.forced ? 'phase_4_deload' : nominal.phaseKey;
  const phaseNumber: PhaseNumber = earlyDeload.forced ? 4 : nominal.phaseNumber;
  const phaseDef = PHASES.find((p) => p.phaseId === phaseNumber)!;

  const dayAbbrev = getDayAbbrev(date);
  const calendarKey = calendarKeyForPhase(phaseKey);
  const scheduledKey = WEEKLY_CALENDARS[calendarKey][dayAbbrev];
  const isOverridden = Boolean(overrides[date]) && overrides[date] !== scheduledKey;
  const workoutKey = overrides[date] ?? scheduledKey;
  const workout = resolveWorkoutKey(workoutKey);

  return {
    date,
    dayAbbrev,
    weekNumber,
    cycleNumber: nominal.cycleNumber,
    weekInCycle: nominal.weekInCycle,
    phaseKey,
    phaseNumber,
    phaseName: phaseDef.name,
    workoutKey,
    workout,
    earlyDeload: earlyDeload.forced,
    earlyDeloadReason: earlyDeload.reason,
    isOverridden,
  };
}

export function getRecoveryDuration(ex: RecoveryExercise, phaseKey: PhaseKey): number | undefined {
  if (typeof ex.duration_sec === 'number') return ex.duration_sec;
  if (ex.duration_sec && typeof ex.duration_sec === 'object') {
    return ex.duration_sec[phaseKey] ?? ex.duration_sec.phase_3 ?? Object.values(ex.duration_sec)[0];
  }
  return undefined;
}
