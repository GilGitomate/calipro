import { LogEntry, MainWorkoutExercise, PhaseKey, PhasePrescription, ProgressionResult } from '../types';

const MAX_LOAD_KG = 10;
const DEFAULT_TEMPO = '3-second eccentric (slow lowering)';

export function getPrescription(exercise: MainWorkoutExercise, phaseKey: PhaseKey): PhasePrescription {
  return exercise[phaseKey];
}

/** The single number a phase prescribes for this exercise's primary metric (reps, reps/leg, or a duration). */
export function getTargetValue(p: PhasePrescription): number | undefined {
  return p.reps ?? p.reps_per_leg ?? p.duration_sec ?? p.accumulated_time_sec ?? p.total_duration_sec;
}

export function isDurationBased(p: PhasePrescription): boolean {
  return p.reps === undefined && p.reps_per_leg === undefined;
}

function hitTarget(log: LogEntry, prescription: PhasePrescription, target: number): boolean {
  if (log.skipped) return false;
  if (isDurationBased(prescription)) {
    return (log.durationSecCompleted ?? 0) >= target;
  }
  const requiredSets = prescription.sets ?? 1;
  return log.setsCompleted >= requiredSets && log.repsCompleted.length > 0 && log.repsCompleted.every((r) => r >= target);
}

/**
 * Implements the progression_engine rules from the program spec, in priority order.
 * `history` must be this exercise's logs sorted newest-first; `history[0]` is the session
 * just completed that we're generating next-session guidance from.
 */
export function computeProgression(
  exercise: MainWorkoutExercise,
  phaseKey: PhaseKey,
  history: LogEntry[],
  /** Gil's manually-set target, if any - takes priority over the phase table's number so
   * progression guidance is based on what he's actually aiming for. */
  targetOverride?: number,
): ProgressionResult {
  const prescription = getPrescription(exercise, phaseKey);
  const target = targetOverride ?? getTargetValue(prescription) ?? 0;
  const baseline: ProgressionResult = {
    exerciseId: exercise.id,
    nextSets: prescription.sets ?? 1,
    nextRepsOrDuration: target,
    nextLoadKg: prescription.load_kg ?? 0,
    tempoNote: prescription.tempo ?? null,
    progressionAction: 'maintain',
    messageToUser: 'Log a session to get personalized progression guidance.',
  };

  const last = history[0];
  if (!last) return baseline;

  // Priority 1: pain always wins.
  if (last.painFlag) {
    return {
      ...baseline,
      progressionAction: 'flag_pain_rest',
      messageToUser:
        'Pain flagged last session - repeat the same numbers, do not increase anything. If pain persists 2 sessions in a row, take an extra full rest day before this exercise comes up again.',
    };
  }

  // Priority 7: deload week overrides everything else below.
  if (phaseKey === 'phase_4_deload') {
    return {
      ...baseline,
      progressionAction: 'reduce_deload',
      messageToUser:
        'Deload week - numbers are automatically reduced regardless of how strong last week felt. Do not add reps or load this week.',
    };
  }

  // Priority 2: two consecutive very-high-RPE sessions means hold, don't push further.
  const last2 = history.slice(0, 2);
  if (last2.length === 2 && last2.every((l) => l.rpe >= 9)) {
    return {
      ...baseline,
      progressionAction: 'maintain',
      messageToUser: 'RPE 9+ for two sessions in a row - hold at current numbers one more session before progressing.',
    };
  }

  // Priorities 3-6 depend on driver type.
  if (exercise.driver_type === 'strength_muscle') {
    const metTarget = hitTarget(last, prescription, target);

    if (metTarget && last.rpe <= 7) {
      const bothLastMaxed = last2.length === 2 && last2.every((l) => hitTarget(l, prescription, target));

      if (bothLastMaxed && prescription.load_kg !== undefined && prescription.load_kg < MAX_LOAD_KG) {
        return {
          ...baseline,
          nextLoadKg: MAX_LOAD_KG,
          nextRepsOrDuration: target,
          progressionAction: 'increase_load',
          messageToUser: `You've maxed out reps at ${prescription.load_kg}kg twice in a row - move up to ${MAX_LOAD_KG}kg next session and reset reps.`,
        };
      }

      if (bothLastMaxed && (prescription.load_kg === undefined || prescription.load_kg >= MAX_LOAD_KG)) {
        return {
          ...baseline,
          tempoNote: prescription.tempo ?? DEFAULT_TEMPO,
          progressionAction: 'increase_tempo',
          messageToUser: "You've capped reps at max load - next session, slow the lowering phase instead of adding reps.",
        };
      }

      return {
        ...baseline,
        nextRepsOrDuration: isDurationBased(prescription) ? target + 5 : target + 1,
        progressionAction: 'increase_reps',
        messageToUser: 'All sets completed cleanly - add one more rep per set next time.',
      };
    }

    return {
      ...baseline,
      progressionAction: 'maintain',
      messageToUser: "Didn't hit every set at target last time - repeat the same numbers before progressing.",
    };
  }

  // Priority 6: skill / plyometric / fat-loss conditioning progress by the phase table only, never by load.
  return {
    ...baseline,
    progressionAction: 'increase_reps',
    messageToUser: "Increase duration/volume per this phase's target - do not add weight to jumping or rope work.",
  };
}
