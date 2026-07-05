import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Play, RotateCcw } from 'lucide-react';
import { AppState, LogEntry } from './types';
import { PROGRAM_META } from './constants';
import { loadState, resetState, saveState } from './lib/storage';
import { addDays, getDayAbbrev, resolveDay, todayISO } from './lib/phase';
import WeekGrid from './components/WeekGrid';
import DayPanel from './components/DayPanel';
import GuidedSession from './components/GuidedSession';
import WeightPrompt from './components/WeightPrompt';

const DAY_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekStart(date: string): string {
  return addDays(date, -DAY_ORDER.indexOf(getDayAbbrev(date)));
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [selectedDate, setSelectedDate] = useState<string>(() => todayISO());
  const [sessionActive, setSessionActive] = useState(false);
  const [showWeightPrompt, setShowWeightPrompt] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    setSessionActive(false);
    setShowWeightPrompt(false);
  }, [selectedDate]);

  const weekStart = useMemo(() => getWeekStart(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const resolvedDay = useMemo(
    () => resolveDay(selectedDate, state.logs, state.scheduleOverrides),
    [selectedDate, state.logs, state.scheduleOverrides],
  );

  function handleSaveLog(log: LogEntry) {
    setState((prev) => ({
      ...prev,
      logs: [...prev.logs.filter((l) => !(l.date === log.date && l.exerciseId === log.exerciseId && l.workoutId === log.workoutId)), log],
    }));
  }

  function handleOverride(date: string, workoutKey: string) {
    setState((prev) => ({ ...prev, scheduleOverrides: { ...prev.scheduleOverrides, [date]: workoutKey } }));
  }

  function handleClearOverride(date: string) {
    setState((prev) => {
      const next = { ...prev.scheduleOverrides };
      delete next[date];
      return { ...prev, scheduleOverrides: next };
    });
  }

  function handleReset() {
    if (confirm('Reset all logged sessions and schedule overrides? This cannot be undone.')) {
      setState(resetState());
    }
  }

  function handleSaveBodyweight(date: string, kg: number) {
    setState((prev) => ({ ...prev, bodyweightByDate: { ...prev.bodyweightByDate, [date]: kg } }));
  }

  function handleStartClick() {
    if (state.bodyweightByDate[selectedDate] === undefined) {
      setShowWeightPrompt(true);
    } else {
      setSessionActive(true);
    }
  }

  const canStart = resolvedDay.workout.kind !== 'rest';
  const todaysWeight = state.bodyweightByDate[selectedDate];

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      {sessionActive ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <GuidedSession
            day={resolvedDay}
            logs={state.logs}
            onSaveLog={handleSaveLog}
            onExit={() => setSessionActive(false)}
            defaultLoadKg={todaysWeight}
          />
        </div>
      ) : (
        <>
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-emerald-400" />
              <div>
                <h1 className="font-bebas text-2xl tracking-wide text-slate-100">CaliPro</h1>
                <p className="text-[11px] text-slate-500">{PROGRAM_META.programName}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 rounded border border-slate-800 px-2 py-1.5 text-xs text-slate-400 hover:border-rose-800 hover:text-rose-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </header>

          <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
            <button className="hover:text-slate-200" onClick={() => setSelectedDate(addDays(weekStart, -7))}>
              ← prev week
            </button>
            <button className="hover:text-slate-200" onClick={() => setSelectedDate(todayISO())}>
              today
            </button>
            <button className="hover:text-slate-200" onClick={() => setSelectedDate(addDays(weekStart, 7))}>
              next week →
            </button>
          </div>

          <div className="mb-4">
            <WeekGrid
              weekDates={weekDates}
              selectedDate={selectedDate}
              logs={state.logs}
              overrides={state.scheduleOverrides}
              onSelect={setSelectedDate}
            />
          </div>

          <div className="mb-6 flex flex-col items-center gap-2">
            {canStart ? (
              showWeightPrompt ? (
                <WeightPrompt
                  workoutName={resolvedDay.workout.name}
                  onSubmit={(kg) => {
                    handleSaveBodyweight(selectedDate, kg);
                    setShowWeightPrompt(false);
                    setSessionActive(true);
                  }}
                  onSkip={() => {
                    setShowWeightPrompt(false);
                    setSessionActive(true);
                  }}
                />
              ) : (
                <>
                  <button
                    onClick={handleStartClick}
                    className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    <Play className="h-4 w-4" />
                    Start {resolvedDay.workout.name}
                  </button>
                  {todaysWeight !== undefined && (
                    <button className="text-xs text-slate-500 hover:text-slate-300" onClick={() => setShowWeightPrompt(true)}>
                      Today's weight: {todaysWeight} kg · edit
                    </button>
                  )}
                </>
              )
            ) : (
              <p className="text-xs text-slate-500">Rest day - nothing to start.</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <DayPanel
              day={resolvedDay}
              logs={state.logs}
              onSaveLog={handleSaveLog}
              onOverride={handleOverride}
              onClearOverride={handleClearOverride}
              defaultLoadKg={state.bodyweightByDate[resolvedDay.date]}
            />
          </div>
        </>
      )}
    </div>
  );
}
