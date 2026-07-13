import { useState } from 'react';
import CountdownTimer from './CountdownTimer';
import { parsePattern } from '../../lib/pattern';

interface Props {
  totalSeconds: number;
  pattern: string;
  onDone?: () => void;
}

/** Cycles fast/slow (or similar) phases parsed from a pattern string until totalSeconds elapse. */
export default function IntervalTimer({ totalSeconds, pattern, onDone }: Props) {
  const segments = parsePattern(pattern);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [segIdx, setSegIdx] = useState(0);
  const [done, setDone] = useState(false);

  if (!segments.length) {
    return (
      <CountdownTimer
        seconds={totalSeconds}
        label="Work"
        onDone={() => {
          setDone(true);
          onDone?.();
        }}
        accent="text-emerald-400"
      />
    );
  }

  if (done) {
    return <div className="rounded-md bg-emerald-500/10 p-2 text-center text-xs text-emerald-400">Interval finished.</div>;
  }

  const current = segments[segIdx % segments.length];
  const isFast = current.label.toLowerCase().includes('fast');

  function handleSegDone() {
    const nextElapsed = elapsedTotal + current.sec;
    if (nextElapsed >= totalSeconds) {
      setDone(true);
      onDone?.();
      return;
    }
    setElapsedTotal(nextElapsed);
    setSegIdx((i) => i + 1);
  }

  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500">
        {elapsedTotal}s / {totalSeconds}s total
      </div>
      <div className="flex items-center justify-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isFast ? 'animate-[pulse_0.6s_ease-in-out_infinite] bg-rose-400' : 'animate-[pulse_1.8s_ease-in-out_infinite] bg-slate-300'
          }`}
        />
        <span className={`text-xs font-bold uppercase tracking-widest ${isFast ? 'text-rose-400' : 'text-slate-300'}`}>
          {isFast ? 'Pace: fast' : 'Pace: slow'}
        </span>
      </div>
      <CountdownTimer
        // Auto-chain into each new segment - only the very first one (segIdx 0, started by the
        // user's play tap) gets the 3s "get ready" prep; later segments continue immediately.
        key={segIdx}
        seconds={current.sec}
        label={current.label}
        onDone={handleSegDone}
        accent={isFast ? 'text-rose-400' : 'text-slate-300'}
        autoStart={segIdx > 0}
        prepSeconds={segIdx > 0 ? 0 : undefined}
      />
    </div>
  );
}
