import { useState } from 'react';
import { ChevronLeft, ChevronRight, PartyPopper, X } from 'lucide-react';
import { LogEntry, MainWorkoutExercise, RecoveryExercise, WarmupExercise } from '../types';
import { ResolvedDay } from '../lib/phase';
import { WARMUP, EXERCISE_CATALOG } from '../constants';
import { COLOR_CLASSES } from '../lib/format';
import { describeRecoveryItem, describeWarmupItem } from '../lib/describeItem';
import ExerciseAccordion from './ExerciseAccordion';
import TimerRunner from './timers/TimerRunner';

type Step =
  | { kind: 'warmup'; item: WarmupExercise }
  | { kind: 'main'; item: MainWorkoutExercise }
  | { kind: 'recovery'; item: RecoveryExercise };

function buildSteps(day: ResolvedDay): Step[] {
  const steps: Step[] = [];
  if (day.workout.kind === 'main') {
    WARMUP.forEach((w) => steps.push({ kind: 'warmup', item: w }));
    day.workout.exercises.forEach((ex) => steps.push({ kind: 'main', item: ex }));
  } else if (day.workout.kind === 'recovery') {
    day.workout.exercises.forEach((ex) => steps.push({ kind: 'recovery', item: ex }));
  }
  return steps;
}

interface Props {
  day: ResolvedDay;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
  onExit: () => void;
}

export default function GuidedSession({ day, logs, onSaveLog, onExit }: Props) {
  const [steps] = useState(() => buildSteps(day));
  const [index, setIndex] = useState(0);
  const [stepComplete, setStepComplete] = useState(false);

  if (steps.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
        Nothing to run today.
        <div className="mt-3">
          <button className="rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700" onClick={onExit}>
            Back to schedule
          </button>
        </div>
      </div>
    );
  }

  const step = steps[index];
  const meta = EXERCISE_CATALOG[step.item.id];
  const color = COLOR_CLASSES[meta.color];
  const isLast = index === steps.length - 1;

  function goTo(next: number) {
    setStepComplete(false);
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Step {index + 1} of {steps.length}
        </span>
        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400" onClick={onExit}>
          <X className="h-3.5 w-3.5" />
          Exit session
        </button>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>

      {step.kind === 'main' ? (
        <ExerciseAccordion
          key={step.item.id}
          exercise={step.item}
          phaseKey={day.phaseKey}
          date={day.date}
          workoutId={day.workout.id}
          logs={logs}
          onSaveLog={onSaveLog}
          forceExpanded
        />
      ) : (
        <div className={`rounded-lg border ${color.border} ${color.bg} p-3`}>
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${color.chip}`}>{meta.category}</span>
            <span className="font-medium text-slate-100">{meta.name}</span>
          </div>
          {meta.description && <p className="mb-2 text-xs text-slate-400">{meta.description}</p>}
          <StepTimer key={`${step.kind}-${step.item.id}-${index}`} step={step} day={day} onComplete={() => setStepComplete(true)} />
        </div>
      )}

      {stepComplete && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <PartyPopper className="h-3.5 w-3.5" />
          Nice work - tap Next when you're ready.
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <button
          className="flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 disabled:opacity-30"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>
        {isLast ? (
          <button className="rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500" onClick={onExit}>
            Finish session
          </button>
        ) : (
          <button
            className="flex items-center gap-1 rounded bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            onClick={() => goTo(index + 1)}
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function StepTimer({ step, day, onComplete }: { step: Step; day: ResolvedDay; onComplete: () => void }) {
  if (step.kind === 'warmup') {
    const { bits, plan, label } = describeWarmupItem(step.item);
    return (
      <>
        <p className="mb-2 text-[11px] text-slate-500">{bits.join(' · ')}</p>
        {plan.kind !== 'none' ? (
          <TimerRunner plan={plan} label={label} onComplete={onComplete} />
        ) : (
          <p className="text-xs text-slate-500">No timer needed - perform at your own pace, then continue.</p>
        )}
      </>
    );
  }

  const { bits, plan, label } = describeRecoveryItem(step.item, day.phaseKey);
  return (
    <>
      <p className="mb-2 text-[11px] text-slate-500">{bits.join(' · ')}</p>
      {plan.kind !== 'none' ? (
        <TimerRunner plan={plan} label={label} onComplete={onComplete} />
      ) : (
        <p className="text-xs text-slate-500">No timer needed - perform at your own pace, then continue.</p>
      )}
    </>
  );
}
