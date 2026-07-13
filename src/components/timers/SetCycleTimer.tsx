import { useState } from 'react';
import CountdownTimer from './CountdownTimer';

interface Props {
  workSeconds: number;
  restSeconds?: number;
  sets: number;
  workLabel?: string;
  onAllDone?: () => void;
}

/** Cycles work -> rest -> work ... for `sets` rounds, no rest after the final round. */
export default function SetCycleTimer({ workSeconds, restSeconds, sets, workLabel = 'Work', onAllDone }: Props) {
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<'work' | 'rest' | 'done'>('work');

  if (phase === 'done') {
    return (
      <div className="rounded-md bg-emerald-500/10 p-2 text-center text-xs text-emerald-400">
        All {sets} set{sets > 1 ? 's' : ''} complete.
      </div>
    );
  }

  function handleDone() {
    if (phase === 'work') {
      if (currentSet < sets && restSeconds) {
        setPhase('rest');
      } else if (currentSet < sets) {
        setCurrentSet((s) => s + 1);
      } else {
        setPhase('done');
        onAllDone?.();
      }
    } else {
      setCurrentSet((s) => s + 1);
      setPhase('work');
    }
  }

  return (
    <div className="space-y-1">
      <div className="text-[11px] text-slate-500">
        Set {currentSet} of {sets} · {phase === 'work' ? workLabel : 'Rest'}
      </div>
      <CountdownTimer
        key={`${phase}-${currentSet}`}
        seconds={phase === 'work' ? workSeconds : (restSeconds ?? 0)}
        label={phase === 'work' ? workLabel : 'Rest'}
        onDone={handleDone}
        accent={phase === 'work' ? 'text-emerald-400' : 'text-amber-400'}
        prepSeconds={phase === 'work' ? 3 : 0}
      />
    </div>
  );
}
