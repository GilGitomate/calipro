import { useEffect, useState } from 'react';
import { Flag, Pause, Play, RotateCcw } from 'lucide-react';
import { playBeep, vibrate } from '../../lib/beep';
import { formatSeconds } from '../../lib/format';

interface Props {
  targetSeconds: number;
  initialAttempts?: number[];
  onAttemptsChange: (attempts: number[]) => void;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Stopwatch you tap once per hold: "Log attempt" captures the elapsed time and resets to
 * zero for the next one, so nobody has to type attempt durations by hand. The overall total
 * (logged attempts + whatever is currently running) ticks live every second regardless. */
export default function AttemptLogger({ targetSeconds, initialAttempts = [], onAttemptsChange }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState<number[]>(initialAttempts);
  const [hitTarget, setHitTarget] = useState(false);

  const loggedTotal = attempts.reduce((sum, a) => sum + a, 0);
  const overallElapsed = loggedTotal + elapsed;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!hitTarget && overallElapsed >= targetSeconds) {
      setHitTarget(true);
      playBeep();
      vibrate(200);
    }
  }, [overallElapsed, targetSeconds, hitTarget]);

  function logAttempt() {
    if (elapsed <= 0) return;
    const next = [...attempts, elapsed];
    setAttempts(next);
    onAttemptsChange(next);
    setElapsed(0);
    setRunning(false);
    playBeep();
    vibrate(200);
  }

  function reset() {
    setRunning(false);
    setElapsed(0);
    setAttempts([]);
    setHitTarget(false);
    onAttemptsChange([]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 p-4">
        <div className="flex items-center justify-between self-stretch text-xs font-medium text-slate-400">
          <span>Current attempt</span>
          {hitTarget && <span className="text-emerald-400">goal reached</span>}
        </div>
        <span className="font-mono text-7xl font-extrabold leading-none tabular-nums text-amber-400">{formatClock(elapsed)}</span>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-slate-800 p-2.5 text-slate-200 hover:bg-slate-700"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pause' : 'Start'}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 disabled:opacity-40"
            onClick={logAttempt}
            disabled={elapsed <= 0}
          >
            <Flag className="h-4 w-4" />
            Log attempt
          </button>
          <button className="rounded-full bg-slate-800 p-2.5 text-slate-400 hover:bg-slate-700" onClick={reset} aria-label="Reset all">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-2 text-xs">
        <span className="text-slate-400">
          {attempts.length} attempt{attempts.length === 1 ? '' : 's'} logged
        </span>
        <span className="font-semibold text-slate-100">
          Overall: {formatSeconds(overallElapsed)} / {formatSeconds(targetSeconds)}
        </span>
      </div>
      {attempts.length > 0 && (
        <p className="text-[11px] text-slate-500">Summary: {attempts.map((a) => formatSeconds(a)).join(', ')}</p>
      )}
    </div>
  );
}
