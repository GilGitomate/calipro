import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LogEntry } from '../types';
import { TimerPlan } from '../lib/timerPlan';
import TimerRunner from './timers/TimerRunner';
import WarmupTimeLog from './WarmupTimeLog';

interface LogProps {
  exerciseId: string;
  workoutId: string;
  date: string;
  targetSeconds: number;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
}

interface Props {
  name: string;
  bits: string[];
  plan: TimerPlan;
  label?: string;
  forceExpanded?: boolean;
  onComplete?: () => void;
  logProps?: LogProps;
}

export default function TimedRow({ name, bits, plan, label = 'Work', forceExpanded = false, onComplete, logProps }: Props) {
  const [expanded, setExpanded] = useState(forceExpanded);
  const hasTimer = plan.kind !== 'none';
  const expandable = hasTimer || Boolean(logProps);

  return (
    <div className={expandable ? 'rounded border border-slate-800/80' : ''}>
      <button
        className="flex w-full items-center justify-between gap-2 px-1 py-0.5 text-left text-xs disabled:cursor-default"
        onClick={() => expandable && setExpanded((e) => !e)}
        disabled={!expandable}
      >
        <span className="text-slate-300">{name}</span>
        <span className="flex items-center gap-1.5 text-slate-500">
          {bits.join(' · ')}
          {expandable && (expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
        </span>
      </button>
      {expanded && expandable && (
        <div className="space-y-1 p-1.5 pt-1">
          {hasTimer && <TimerRunner plan={plan} label={label} onComplete={onComplete} />}
          {logProps && <WarmupTimeLog {...logProps} />}
        </div>
      )}
    </div>
  );
}
