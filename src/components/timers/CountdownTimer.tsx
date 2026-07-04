import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playBeep, vibrate } from '../../lib/beep';

interface Props {
  seconds: number;
  label: string;
  onDone?: () => void;
  accent?: string;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CountdownTimer({ seconds, label, onDone, accent = 'text-slate-100' }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          playBeep();
          vibrate(200);
          onDoneRef.current?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0;

  return (
    <div className="flex items-center gap-3 rounded-md bg-slate-900/80 p-2">
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{label}</span>
          {remaining === 0 && <span className="text-emerald-400">done</span>}
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className={`w-14 text-center font-mono text-lg tabular-nums ${accent}`}>{formatClock(remaining)}</span>
      <button
        className="rounded bg-slate-800 p-1.5 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
        onClick={() => setRunning((r) => !r)}
        disabled={remaining === 0}
        aria-label={running ? 'Pause' : 'Start'}
      >
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
      <button
        className="rounded bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700"
        onClick={() => {
          setRunning(false);
          setRemaining(seconds);
        }}
        aria-label="Reset"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
