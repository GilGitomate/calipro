import { History } from 'lucide-react';
import { LogEntry, MainWorkoutExercise } from '../types';
import { EXERCISE_CATALOG } from '../constants';
import { formatDateLabel, summarizeLog } from '../lib/format';
import { getLastWorkoutSession } from '../lib/recap';

interface Props {
  workoutId: string;
  workoutName: string;
  currentDate: string;
  exercises: MainWorkoutExercise[];
  logs: LogEntry[];
}

export default function WorkoutRecapCard({ workoutId, workoutName, currentDate, exercises, logs }: Props) {
  const recap = getLastWorkoutSession(logs, workoutId, currentDate);
  if (!recap) return null;

  const order = new Map(exercises.map((e, i) => [e.id, i]));
  const sortedEntries = recap.entries
    .filter((log) => order.has(log.exerciseId))
    .sort((a, b) => (order.get(a.exerciseId) ?? 0) - (order.get(b.exerciseId) ?? 0));
  if (sortedEntries.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <History className="h-3.5 w-3.5" />
        Last time - {workoutName} ({formatDateLabel(recap.date)})
      </div>
      <div className="space-y-1">
        {sortedEntries.map((log) => {
          const meta = EXERCISE_CATALOG[log.exerciseId];
          if (!meta) return null;
          return (
            <div key={log.exerciseId} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">{meta.name}</span>
              <span className={log.painFlag ? 'text-rose-400' : 'text-slate-400'}>{summarizeLog(log, meta.metricType)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
