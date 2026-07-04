import { PhaseKey, RecoveryExercise, WarmupExercise } from '../types';
import { planForDurationItem, planForRestOnly, TimerPlan } from './timerPlan';
import { formatSeconds } from './format';
import { getRecoveryDuration } from './phase';

export interface ItemDescription {
  bits: string[];
  plan: TimerPlan;
  label: string;
}

export function describeWarmupItem(w: WarmupExercise): ItemDescription {
  const bits: string[] = [];
  if (w.sets) bits.push(`${w.sets} sets`);
  if (w.reps) bits.push(`${w.reps} reps`);
  if (w.duration_sec) bits.push(formatSeconds(w.duration_sec));
  if (w.rest_sec) bits.push(`rest ${w.rest_sec}s`);
  const plan =
    w.duration_sec !== undefined
      ? planForDurationItem({ durationSeconds: w.duration_sec, sets: w.sets, restSeconds: w.rest_sec })
      : planForRestOnly(w.rest_sec);
  return { bits, plan, label: w.duration_sec !== undefined ? 'Work' : 'Rest between sets' };
}

export function describeRecoveryItem(ex: RecoveryExercise, phaseKey: PhaseKey): ItemDescription {
  const duration = getRecoveryDuration(ex, phaseKey);
  const bits: string[] = [];
  if (duration) bits.push(formatSeconds(duration));
  if (ex.reps) bits.push(`${ex.reps} reps`);
  if (ex.pace) bits.push(ex.pace.replace(/_/g, ' '));
  const plan = duration !== undefined ? planForDurationItem({ durationSeconds: duration }) : { kind: 'none' as const };
  return { bits, plan, label: 'Work' };
}
