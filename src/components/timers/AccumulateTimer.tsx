import { useEffect, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playBeep, vibrate } from '../../lib/beep';

interface Props {
  targetSeconds: number;
  restSeconds?: number;
  onTargetReached?: () => void;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Stopwatch counting up toward a target across multiple attempts (e.g. handstand practice). */
export default function AccumulateTimer({ targetSeconds, restSeconds, onTargetReached }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [hitTarget, setHitTarget] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (!hitTarget && next >= targetSeconds) {
          playBeep();
          vibrate(200);
          setHitTarget(true);
          onTargetReached?.();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, hitTarget, targetSeconds, onTargetReached]);

  const pct = Math.min(100, (elapsed / targetSeconds) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 p-4">
        <div className="flex items-center justify-between self-stretch text-xs font-medium text-slate-400">
          <span>Accumulated practice time</span>
          {hitTarget && <span className="text-emerald-400">goal reached</span>}
        </div>
        <span className="text-center font-mono text-6xl font-extrabold leading-none tabular-nums text-amber-400">
          {formatClock(elapsed)} <span className="text-3xl text-amber-400/50">/ {formatClock(targetSeconds)}</span>
        </span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-slate-800 p-2.5 text-slate-200 hover:bg-slate-700"
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? 'Pause' : 'Start'}
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            className="rounded-full bg-slate-800 p-2.5 text-slate-400 hover:bg-slate-700"
            onClick={() => {
              setRunning(false);
              setElapsed(0);
              setHitTarget(false);
            }}
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
      {restSeconds !== undefined && !running && elapsed > 0 && !hitTarget && (
        <p className="text-center text-[11px] text-slate-500">Resting between attempts? Aim for ~{restSeconds}s before your next one.</p>
      )}
    </div>
  );
}
