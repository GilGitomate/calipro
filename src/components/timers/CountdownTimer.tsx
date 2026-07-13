import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { playBeep, vibrate } from '../../lib/beep';
import { useWakeLock } from '../../lib/useWakeLock';
import { usePrepCountdown } from '../../lib/usePrepCountdown';

interface Props {
  seconds: number;
  label: string;
  onDone?: () => void;
  accent?: string;
  autoStart?: boolean;
  /** Seconds of "get ready" countdown shown before this timer actually starts, triggered the
   * moment play is pressed (or on mount when autoStart is set). Pass 0 to skip it - used when a
   * segment auto-chains from one that just finished, so the flow doesn't pause again. */
  prepSeconds?: number;
}

function formatClock(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CountdownTimer({
  seconds,
  label,
  onDone,
  accent = 'text-slate-100',
  autoStart = false,
  prepSeconds = 3,
}: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  /** Wall-clock timestamp the countdown should hit zero at - lets us recompute the true
   * remaining time from Date.now() instead of trusting interval ticks, which browsers
   * throttle or suspend entirely while a phone's screen is off or the tab is backgrounded. */
  const endAtRef = useRef<number | null>(null);
  const prep = usePrepCountdown(prepSeconds);
  /** Only the first start gets the "get ready" prep - resuming from pause jumps straight back in. */
  const startedRef = useRef(false);

  function begin() {
    if (startedRef.current) {
      setRunning(true);
      return;
    }
    startedRef.current = true;
    prep.start(() => setRunning(true));
  }

  useEffect(() => {
    if (autoStart && seconds > 0) begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useWakeLock(running || prep.active);

  useEffect(() => {
    if (!running) {
      endAtRef.current = null;
      return;
    }
    endAtRef.current = Date.now() + remaining * 1000;

    function tick() {
      if (endAtRef.current == null) return;
      const secLeft = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setRemaining(secLeft);
      if (secLeft <= 0) {
        endAtRef.current = null;
        setRunning(false);
        playBeep();
        vibrate(200);
        onDoneRef.current?.();
      }
    }

    tick();
    const id = setInterval(tick, 250);
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const pct = seconds > 0 ? ((seconds - remaining) / seconds) * 100 : 0;

  if (prep.active) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-900/80 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-sky-400">Get ready</span>
        <span className="font-mono text-7xl font-extrabold leading-none tabular-nums text-sky-400 animate-pulse">
          {prep.remaining}
        </span>
        <span className="text-xs text-slate-400">{label} starts in {prep.remaining}...</span>
      </div>
    );
  }

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
          onClick={() => (running ? setRunning(false) : begin())}
          disabled={remaining === 0}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          className="rounded-full bg-slate-800 p-2.5 text-slate-400 hover:bg-slate-700"
          onClick={() => {
            setRunning(false);
            startedRef.current = false;
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
