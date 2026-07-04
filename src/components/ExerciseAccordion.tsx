import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TriangleAlert } from 'lucide-react';
import { LogEntry, MainWorkoutExercise, PhaseKey } from '../types';
import { EXERCISE_CATALOG } from '../constants';
import { computeProgression, getPrescription, getTargetValue, isDurationBased } from '../lib/progression';
import { COLOR_CLASSES, formatPrescription, formatSeconds } from '../lib/format';
import { planForDurationItem, planForRestOnly } from '../lib/timerPlan';
import TimerRunner from './timers/TimerRunner';

interface Props {
  exercise: MainWorkoutExercise;
  phaseKey: PhaseKey;
  date: string;
  workoutId: string;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
  forceExpanded?: boolean;
}

export default function ExerciseAccordion({ exercise, phaseKey, date, workoutId, logs, onSaveLog, forceExpanded = false }: Props) {
  const meta = EXERCISE_CATALOG[exercise.id];
  const prescription = getPrescription(exercise, phaseKey);
  const target = getTargetValue(prescription) ?? 0;
  const durationBased = isDurationBased(prescription);
  const color = COLOR_CLASSES[meta.color];

  const sortedHistory = useMemo(
    () => logs.filter((l) => l.exerciseId === exercise.id).slice().sort((a, b) => b.date.localeCompare(a.date)),
    [logs, exercise.id],
  );
  const todayLog = sortedHistory.find((l) => l.date === date);
  const priorHistory = todayLog ? sortedHistory.filter((l) => l.date !== date) : sortedHistory;
  const lastSession = priorHistory[0];
  const progression = computeProgression(exercise, phaseKey, sortedHistory);

  const timerPlan = durationBased
    ? planForDurationItem({
        durationSeconds: target,
        sets: prescription.sets,
        restSeconds: prescription.rest_sec ?? prescription.rest_between_attempts_sec,
        pattern: prescription.pattern,
        isAccumulateSkill: exercise.driver_type === 'skill',
      })
    : planForRestOnly(prescription.rest_sec);

  const [expanded, setExpanded] = useState(forceExpanded);
  const [showForm, setShowForm] = useState(false);

  const [sets, setSets] = useState(todayLog?.setsCompleted ?? prescription.sets ?? 1);
  const [reps, setReps] = useState<number[]>(
    todayLog?.repsCompleted?.length ? todayLog.repsCompleted : Array(prescription.sets ?? 1).fill(target),
  );
  const [duration, setDuration] = useState(todayLog?.durationSecCompleted ?? target);
  const [load, setLoad] = useState(todayLog?.loadKg ?? prescription.load_kg ?? 0);
  const [rpe, setRpe] = useState(todayLog?.rpe ?? 7);
  const [painFlag, setPainFlag] = useState(todayLog?.painFlag ?? false);
  const [painLocation, setPainLocation] = useState(todayLog?.painLocation ?? '');
  const [skipped, setSkipped] = useState(todayLog?.skipped ?? false);
  const [skippedReason, setSkippedReason] = useState(todayLog?.skippedReason ?? '');

  function handleSetsChange(n: number) {
    const clamped = Math.max(1, n);
    setSets(clamped);
    setReps((prev) => {
      const next = prev.slice(0, clamped);
      while (next.length < clamped) next.push(target);
      return next;
    });
  }

  function handleSave() {
    const log: LogEntry = {
      id: todayLog?.id ?? crypto.randomUUID(),
      date,
      workoutId,
      exerciseId: exercise.id,
      setsCompleted: sets,
      repsCompleted: durationBased ? [] : reps,
      loadKg: load,
      durationSecCompleted: durationBased ? duration : undefined,
      rpe,
      painFlag,
      painLocation: painFlag ? painLocation : undefined,
      skipped,
      skippedReason: skipped ? skippedReason : undefined,
    };
    onSaveLog(log);
    setShowForm(false);
  }

  function summarizeLog(log: LogEntry): string {
    if (log.skipped) return 'Skipped';
    const parts: string[] = [];
    if (durationBased) {
      parts.push(formatSeconds(log.durationSecCompleted ?? 0));
    } else {
      parts.push(`${log.setsCompleted} x ${log.repsCompleted.join('/')}`);
    }
    if (log.loadKg > 0) parts.push(`${log.loadKg}kg`);
    parts.push(`RPE ${log.rpe}`);
    if (log.painFlag) parts.push('pain');
    return parts.join(' · ');
  }

  return (
    <div className={`rounded-lg border ${color.border} ${color.bg}`}>
      <button className="flex w-full items-center justify-between gap-2 p-3 text-left" onClick={() => setExpanded((e) => !e)}>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${color.chip}`}>{meta.category}</span>
            <span className="font-medium text-slate-100">{meta.name}</span>
            {todayLog && <span className="text-[10px] text-emerald-400">logged</span>}
          </div>
          <span className="text-xs text-slate-400">{formatPrescription(prescription)}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-800 p-3">
          {meta.description && <p className="text-xs text-slate-400">{meta.description}</p>}

          {timerPlan.kind !== 'none' && (
            <TimerRunner plan={timerPlan} label={durationBased ? 'Work' : 'Rest between sets'} />
          )}

          <div className="rounded-md bg-slate-900/60 p-2 text-xs">
            <div className="mb-1 flex items-center gap-1 font-semibold text-slate-300">
              {progression.progressionAction === 'flag_pain_rest' ? (
                <TriangleAlert className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              )}
              Next session guidance
            </div>
            <p className="text-slate-400">{progression.messageToUser}</p>
          </div>

          <div className="text-xs text-slate-400">
            {lastSession ? (
              <span>
                Last session ({lastSession.date}): <span className="text-slate-200">{summarizeLog(lastSession)}</span>
              </span>
            ) : (
              <span>No previous log for this exercise yet.</span>
            )}
          </div>

          {!showForm && (
            <button
              className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-700"
              onClick={() => setShowForm(true)}
            >
              {todayLog ? 'Edit today’s log' : 'Log this session'}
            </button>
          )}

          {showForm && (
            <div className="space-y-2 rounded-md border border-slate-700 bg-slate-900/80 p-3">
              {!durationBased && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-slate-400">Sets</label>
                  <input
                    type="number"
                    min={1}
                    className="w-14 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={sets}
                    onChange={(e) => handleSetsChange(Number(e.target.value))}
                  />
                  <label className="text-xs text-slate-400">Reps/set</label>
                  {reps.map((r, i) => (
                    <input
                      key={i}
                      type="number"
                      min={0}
                      className="w-14 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                      value={r}
                      onChange={(e) =>
                        setReps((prev) => prev.map((v, idx) => (idx === i ? Number(e.target.value) : v)))
                      }
                    />
                  ))}
                </div>
              )}

              {durationBased && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Duration (sec)</label>
                  <input
                    type="number"
                    min={0}
                    className="w-20 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Load (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-16 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">RPE</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-14 rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={rpe}
                    onChange={(e) => setRpe(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input type="checkbox" checked={painFlag} onChange={(e) => setPainFlag(e.target.checked)} />
                  Pain during this exercise
                </label>
                {painFlag && (
                  <input
                    type="text"
                    placeholder="Where?"
                    className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={painLocation}
                    onChange={(e) => setPainLocation(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-slate-400">
                  <input type="checkbox" checked={skipped} onChange={(e) => setSkipped(e.target.checked)} />
                  Skipped
                </label>
                {skipped && (
                  <input
                    type="text"
                    placeholder="Why?"
                    className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100"
                    value={skippedReason}
                    onChange={(e) => setSkippedReason(e.target.value)}
                  />
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500" onClick={handleSave}>
                  Save log
                </button>
                <button className="rounded px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {priorHistory.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-300">History</div>
              <div className="space-y-1">
                {priorHistory.slice(0, 6).map((log) => (
                  <div key={log.id} className="flex justify-between text-xs text-slate-400">
                    <span>{log.date}</span>
                    <span className={log.painFlag ? 'text-rose-400' : 'text-slate-300'}>{summarizeLog(log)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
