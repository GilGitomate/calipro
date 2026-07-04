import { useMemo, useState } from 'react';
import { LogEntry } from '../types';
import { formatSeconds } from '../lib/format';

interface Props {
  exerciseId: string;
  workoutId: string;
  date: string;
  targetSeconds: number;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
}

/** Minimal held-time logger for warmup holds (e.g. Straight Arm Plank) so you can see the trend over sessions. */
export default function WarmupTimeLog({ exerciseId, workoutId, date, targetSeconds, logs, onSaveLog }: Props) {
  const history = useMemo(
    () => logs.filter((l) => l.exerciseId === exerciseId).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [logs, exerciseId],
  );
  const todayLog = history.find((l) => l.date === date);
  const priorHistory = todayLog ? history.filter((l) => l.date !== date) : history;
  const lastSession = priorHistory[0];

  const [showForm, setShowForm] = useState(false);
  const [heldSeconds, setHeldSeconds] = useState(todayLog?.durationSecCompleted ?? targetSeconds);

  function handleSave() {
    onSaveLog({
      id: todayLog?.id ?? crypto.randomUUID(),
      date,
      workoutId,
      exerciseId,
      setsCompleted: 1,
      repsCompleted: [],
      loadKg: 0,
      durationSecCompleted: heldSeconds,
      rpe: 0,
      painFlag: false,
      skipped: false,
    });
    setShowForm(false);
  }

  const trend = priorHistory
    .slice(0, 5)
    .reverse()
    .map((l) => formatSeconds(l.durationSecCompleted ?? 0));

  return (
    <div className="mt-2 space-y-1.5 text-xs">
      {lastSession && (
        <p className="text-slate-400">
          Last time: <span className="font-semibold text-slate-200">{formatSeconds(lastSession.durationSecCompleted ?? 0)}</span> (
          {lastSession.date})
        </p>
      )}

      {!showForm ? (
        <button
          className="rounded bg-slate-800 px-2.5 py-1 font-medium text-slate-100 hover:bg-slate-700"
          onClick={() => setShowForm(true)}
        >
          {todayLog ? `Logged ${formatSeconds(todayLog.durationSecCompleted ?? 0)} - edit` : 'Log held time'}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-700 bg-slate-900/80 p-2">
          <label className="text-slate-400">Held (sec)</label>
          <input
            type="number"
            min={0}
            className="w-20 rounded bg-slate-800 px-2 py-1 text-base font-semibold text-slate-100"
            value={heldSeconds}
            onChange={(e) => setHeldSeconds(Number(e.target.value))}
          />
          <button className="rounded bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-500" onClick={handleSave}>
            Save
          </button>
          <button className="text-slate-400 hover:text-slate-200" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {trend.length > 0 && <p className="text-[11px] text-slate-500">Trend: {trend.join(' → ')}</p>}
    </div>
  );
}
