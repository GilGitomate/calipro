import { LogEntry } from '../types';

export interface WorkoutRecap {
  date: string;
  entries: LogEntry[];
}

/** The most recent prior session logged for this exact workout (e.g. last time Push & Legs ran), before `beforeDate`. */
export function getLastWorkoutSession(logs: LogEntry[], workoutId: string, beforeDate: string): WorkoutRecap | null {
  const priorDates = Array.from(
    new Set(logs.filter((l) => l.workoutId === workoutId && l.date < beforeDate).map((l) => l.date)),
  ).sort((a, b) => b.localeCompare(a));

  const lastDate = priorDates[0];
  if (!lastDate) return null;

  return {
    date: lastDate,
    entries: logs.filter((l) => l.workoutId === workoutId && l.date === lastDate),
  };
}
