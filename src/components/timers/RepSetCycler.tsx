import { useState } from 'react';
import { Check, PartyPopper } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface Props {
  sets: number;
  targetLabel: string;
  restSeconds?: number;
  onAllDone?: () => void;
}

/** Walks bodyweight multi-set work one set at a time: perform the set at your own pace, tap
 * done, rest, then the next set's target is shown. No timer runs during the work itself. */
export default function RepSetCycler({ sets, targetLabel, restSeconds, onAllDone }: Props) {
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work');

  if (phase === 'done') {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-center text-sm font-semibold text-emerald-400">
        <PartyPopper className="h-5 w-5" />
        All {sets} set{sets > 1 ? 's' : ''} complete.
      </div>
    );
  }

  function handleSetDone() {
    if (currentSet < sets && restSeconds) {
      setPhase('rest');
    } else if (currentSet < sets) {
      setCurrentSet((s) => s + 1);
    } else {
      setPhase('done');
      onAllDone?.();
    }
  }

  function handleRestDone() {
    setCurrentSet((s) => s + 1);
    setPhase('work');
  }

  if (phase === 'rest') {
    return (
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-400">
          Rest before set {currentSet + 1} of {sets}
        </div>
        <CountdownTimer seconds={restSeconds ?? 0} label="Rest" onDone={handleRestDone} accent="text-amber-400" autoStart />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-slate-900/80 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Set {currentSet} of {sets}
        </div>
        <div className="text-xs text-slate-400">Do this set at your own pace, then tap done.</div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-6xl font-extrabold leading-none tabular-nums text-slate-50 drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]">
          {targetLabel}
        </span>
        <button
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
          onClick={handleSetDone}
        >
          <Check className="h-5 w-5" />
          Done
        </button>
      </div>
    </div>
  );
}
