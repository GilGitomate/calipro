import { TriangleAlert } from 'lucide-react';
import { LogEntry } from '../types';
import { ResolvedDay } from '../lib/phase';
import { WARMUP, EXERCISE_CATALOG } from '../constants';
import { formatDateLabel } from '../lib/format';
import { describeRecoveryItem, describeWarmupItem } from '../lib/describeItem';
import ExerciseAccordion from './ExerciseAccordion';
import TimedRow from './TimedRow';
import WorkoutRecapCard from './WorkoutRecapCard';

interface Props {
  day: ResolvedDay;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
  onOverride: (date: string, workoutKey: string) => void;
  onClearOverride: (date: string) => void;
}

const WORKOUT_OPTIONS = [
  'Workout_A',
  'Workout_B',
  'Workout_A_Deload',
  'Workout_B_Deload',
  'Active_Recovery_Light',
  'Active_Recovery_Mobility',
  'Active_Recovery_Rope',
  'Active_Recovery_Rope_Light',
  'Full_Rest',
];

export default function DayPanel({ day, logs, onSaveLog, onOverride, onClearOverride }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bebas text-3xl tracking-wide text-slate-100">{formatDateLabel(day.date)}</h2>
          <p className="text-xs text-slate-400">
            Week {day.weekNumber} · Cycle {day.cycleNumber}, week {day.weekInCycle}/8 · {day.phaseName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded bg-slate-800 px-2 py-1.5 text-xs text-slate-100"
            value={day.workoutKey}
            onChange={(e) => onOverride(day.date, e.target.value)}
          >
            {WORKOUT_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {key.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {day.isOverridden && (
            <button className="text-xs text-slate-500 underline hover:text-slate-300" onClick={() => onClearOverride(day.date)}>
              reset
            </button>
          )}
        </div>
      </div>

      {day.earlyDeload && (
        <div className="flex items-center gap-2 rounded-md border border-rose-800 bg-rose-500/10 p-2 text-xs text-rose-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {day.earlyDeloadReason}
        </div>
      )}

      {day.workout.kind === 'rest' && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
          Full rest day. Nutrition, hydration, sleep.
        </div>
      )}

      {day.workout.kind === 'main' && (
        <WorkoutRecapCard
          workoutId={day.workout.id}
          workoutName={day.workout.name}
          currentDate={day.date}
          exercises={day.workout.exercises}
          logs={logs}
        />
      )}

      {day.workout.kind === 'main' && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">Warm-up</h3>
          <div className="space-y-1 rounded-lg border border-amber-900/60 bg-amber-500/5 p-3">
            {WARMUP.map((w) => {
              const meta = EXERCISE_CATALOG[w.id];
              const { bits, plan, label } = describeWarmupItem(w);
              return (
                <TimedRow
                  key={w.id}
                  name={meta.name}
                  bits={bits}
                  plan={plan}
                  label={label}
                  logProps={
                    w.duration_sec !== undefined
                      ? {
                          exerciseId: w.id,
                          workoutId: day.workout.id,
                          date: day.date,
                          targetSeconds: w.duration_sec,
                          logs,
                          onSaveLog,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {day.workout.kind === 'main' && (
        <div className="space-y-2">
          {day.workout.exercises.map((ex) => (
            <ExerciseAccordion
              key={ex.id}
              exercise={ex}
              phaseKey={day.phaseKey}
              date={day.date}
              workoutId={day.workout.id}
              logs={logs}
              onSaveLog={onSaveLog}
            />
          ))}
        </div>
      )}

      {day.workout.kind === 'recovery' && (
        <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900 p-3">
          {day.workout.exercises.map((ex, i) => {
            const meta = EXERCISE_CATALOG[ex.id];
            const { bits, plan, label } = describeRecoveryItem(ex, day.phaseKey);
            return <TimedRow key={`${ex.id}_${i}`} name={meta.name} bits={bits} plan={plan} label={label} />;
          })}
        </div>
      )}
    </div>
  );
}
