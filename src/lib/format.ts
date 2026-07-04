import { CategoryColor, LogEntry, MetricType, PhasePrescription } from '../types';

export const COLOR_CLASSES: Record<CategoryColor, { bg: string; border: string; text: string; chip: string; glow: string; iconBg: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-800',
    text: 'text-emerald-400',
    chip: 'bg-emerald-500/20 text-emerald-300',
    glow: 'shadow-[0_0_35px_-8px_rgba(16,185,129,0.45)]',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-800',
    text: 'text-indigo-400',
    chip: 'bg-indigo-500/20 text-indigo-300',
    glow: 'shadow-[0_0_35px_-8px_rgba(99,102,241,0.45)]',
    iconBg: 'bg-indigo-500/20 text-indigo-300',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-800',
    text: 'text-amber-400',
    chip: 'bg-amber-500/20 text-amber-300',
    glow: 'shadow-[0_0_35px_-8px_rgba(245,158,11,0.45)]',
    iconBg: 'bg-amber-500/20 text-amber-300',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-800',
    text: 'text-rose-400',
    chip: 'bg-rose-500/20 text-rose-300',
    glow: 'shadow-[0_0_35px_-8px_rgba(244,63,94,0.45)]',
    iconBg: 'bg-rose-500/20 text-rose-300',
  },
  slate: {
    bg: 'bg-slate-800/60',
    border: 'border-slate-700',
    text: 'text-slate-400',
    chip: 'bg-slate-700 text-slate-300',
    glow: 'shadow-[0_0_35px_-8px_rgba(100,116,139,0.35)]',
    iconBg: 'bg-slate-700 text-slate-300',
  },
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

/** The big "what's coming" number for an exercise's header: sets x reps, or the target time. */
export function formatTargetBig(p: PhasePrescription): string {
  if (p.reps !== undefined) return `${p.sets ?? 1}×${p.reps}`;
  if (p.reps_per_leg !== undefined) return `${p.sets ?? 1}×${p.reps_per_leg}/leg`;
  const dur = p.duration_sec ?? p.accumulated_time_sec ?? p.total_duration_sec;
  return dur !== undefined ? formatSeconds(dur) : '—';
}

export function summarizeLog(log: LogEntry, metricType: MetricType): string {
  if (log.skipped) return 'Skipped';
  const parts: string[] = [];
  if (metricType === 'seconds') {
    parts.push(formatSeconds(log.durationSecCompleted ?? 0));
    if (log.attemptsSec && log.attemptsSec.length > 1) parts.push(`${log.attemptsSec.length} attempts`);
  } else if (metricType === 'reps_per_leg') {
    parts.push(`${log.setsCompleted} x ${log.repsCompleted.join('/')} /leg`);
  } else {
    parts.push(`${log.setsCompleted} x ${log.repsCompleted.join('/')}`);
  }
  if (log.loadKg > 0) parts.push(`${log.loadKg}kg`);
  parts.push(`RPE ${log.rpe}`);
  if (log.painFlag) parts.push('pain');
  return parts.join(' · ');
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
