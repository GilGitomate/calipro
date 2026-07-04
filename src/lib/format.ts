import { CategoryColor, PhasePrescription } from '../types';

export const COLOR_CLASSES: Record<CategoryColor, { bg: string; border: string; text: string; chip: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-800', text: 'text-emerald-400', chip: 'bg-emerald-500/20 text-emerald-300' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-800', text: 'text-indigo-400', chip: 'bg-indigo-500/20 text-indigo-300' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-800', text: 'text-amber-400', chip: 'bg-amber-500/20 text-amber-300' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-800', text: 'text-rose-400', chip: 'bg-rose-500/20 text-rose-300' },
  slate: { bg: 'bg-slate-800/60', border: 'border-slate-700', text: 'text-slate-400', chip: 'bg-slate-700 text-slate-300' },
};

export function formatSeconds(sec: number): string {
  if (sec >= 60) {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return s === 0 ? `${m} min` : `${m}m ${s}s`;
  }
  return `${sec}s`;
}

export function formatPrescription(p: PhasePrescription): string {
  const parts: string[] = [];
  if (p.sets !== undefined && p.reps !== undefined) {
    parts.push(`${p.sets} x ${p.reps} reps`);
  } else if (p.sets !== undefined && p.reps_per_leg !== undefined) {
    parts.push(`${p.sets} x ${p.reps_per_leg}/leg`);
  } else if (p.reps !== undefined) {
    parts.push(`${p.reps} reps`);
  } else if (p.reps_per_leg !== undefined) {
    parts.push(`${p.reps_per_leg} reps/leg`);
  }
  if (p.load_kg !== undefined && p.load_kg > 0) parts.push(`${p.load_kg}kg`);
  if (p.duration_sec !== undefined) {
    parts.push(p.sets !== undefined ? `${p.sets} x ${formatSeconds(p.duration_sec)}` : formatSeconds(p.duration_sec));
  }
  if (p.accumulated_time_sec !== undefined) parts.push(`${formatSeconds(p.accumulated_time_sec)} total`);
  if (p.total_duration_sec !== undefined) parts.push(formatSeconds(p.total_duration_sec));
  if (p.tempo) parts.push(p.tempo.replace(/_/g, ' '));
  if (p.pattern) parts.push(p.pattern.replace(/_/g, ' '));
  if (p.pace) parts.push(p.pace.replace(/_/g, ' '));
  if (p.variation) parts.push(`(${p.variation.replace(/_/g, ' ')})`);
  const rest = p.rest_sec ?? p.rest_between_attempts_sec;
  if (rest !== undefined) parts.push(`rest ${rest}s`);
  return parts.length ? parts.join(' · ') : '—';
}

export function workoutColor(workoutKey: string): CategoryColor {
  if (workoutKey.startsWith('Workout_A')) return 'emerald';
  if (workoutKey.startsWith('Workout_B')) return 'indigo';
  if (workoutKey.startsWith('Active_Recovery')) return 'amber';
  return 'slate';
}

export function formatDateLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}
