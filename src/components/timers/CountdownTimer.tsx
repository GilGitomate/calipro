import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playBeep, vibrate } from '../../lib/beep';

interface Props {
  seconds: number;
  label: string;
  onDone?: () => void;
  accent?: string;
  autoStart?: boolean;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CountdownTimer({ seconds, label, onDone, accent = 'text-slate-100', autoStart = false }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(autoStart && seconds > 0);
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
    <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 p-4">
      <div className="flex items-center justify-between self-stretch text-xs font-medium text-slate-400">
        <span>{label}</span>
        {remaining === 0 && <span className="text-emerald-400">done</span>}
      </div>
      <span className={`font-mono text-7xl font-extrabold leading-none tabular-nums ${accent}`}>{formatClock(remaining)}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-full bg-slate-800 p-2.5 text-slate-200 hover:bg-slate-700 disabled:opacity-40"
          onClick={() => setRunning((r) => !r)}
          disabled={remaining === 0}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          className="rounded-full bg-slate-800 p-2.5 text-slate-400 hover:bg-slate-700"
          onClick={() => {
            setRunning(false);
            setRemaining(seconds);
          }}
          aria-label="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
