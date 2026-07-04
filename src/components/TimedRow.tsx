import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TimerPlan } from '../lib/timerPlan';
import TimerRunner from './timers/TimerRunner';

interface Props {
  name: string;
  bits: string[];
  plan: TimerPlan;
  label?: string;
  forceExpanded?: boolean;
  onComplete?: () => void;
}

export default function TimedRow({ name, bits, plan, label = 'Work', forceExpanded = false, onComplete }: Props) {
  const [expanded, setExpanded] = useState(forceExpanded);
  const hasTimer = plan.kind !== 'none';

  return (
    <div className={hasTimer ? 'rounded border border-slate-800/80' : ''}>
      <button
        className="flex w-full items-center justify-between gap-2 px-1 py-0.5 text-left text-xs disabled:cursor-default"
        onClick={() => hasTimer && setExpanded((e) => !e)}
        disabled={!hasTimer}
      >
        <span className="text-slate-300">{name}</span>
        <span className="flex items-center gap-1.5 text-slate-500">
          {bits.join(' · ')}
          {hasTimer && (expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </span>
      </button>
      {expanded && hasTimer && (
        <div className="p-1.5 pt-1">
          <TimerRunner plan={plan} label={label} onComplete={onComplete} />
        </div>
      )}
    </div>
  );
}
