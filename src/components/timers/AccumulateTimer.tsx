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
    <div className="space-y-1">
      <div className="flex items-center gap-3 rounded-md bg-slate-900/80 p-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>Accumulated practice time</span>
            {hitTarget && <span className="text-emerald-400">goal reached</span>}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="w-24 text-center font-mono text-lg tabular-nums text-amber-400">
          {formatClock(elapsed)} / {formatClock(targetSeconds)}
        </span>
        <button
          className="rounded bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700"
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          className="rounded bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
            setHitTarget(false);
          }}
          aria-label="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      {restSeconds !== undefined && !running && elapsed > 0 && !hitTarget && (
        <p className="text-[10px] text-slate-500">Resting between attempts? Aim for ~{restSeconds}s before your next one.</p>
      )}
    </div>
  );
}
