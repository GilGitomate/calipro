import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, PartyPopper, SkipForward, X } from 'lucide-react';
import { LogEntry, MainWorkoutExercise, PhaseKey, RecoveryExercise, WarmupExercise } from '../types';
import { ResolvedDay, getRecoveryDuration } from '../lib/phase';
import { WARMUP, EXERCISE_CATALOG } from '../constants';
import { COLOR_CLASSES, formatSeconds } from '../lib/format';
import { categoryIcon } from '../lib/categoryIcon';
import { getPrescription } from '../lib/progression';
import { describeRecoveryItem, describeWarmupItem } from '../lib/describeItem';
import ExerciseAccordion from './ExerciseAccordion';
import TimerRunner from './timers/TimerRunner';
import CountdownTimer from './timers/CountdownTimer';
import WarmupTimeLog from './WarmupTimeLog';

type Step =
  | { kind: 'warmup'; item: WarmupExercise; workoutId: string }
  | { kind: 'main'; item: MainWorkoutExercise }
  | { kind: 'recovery'; item: RecoveryExercise };

function buildSteps(day: ResolvedDay): Step[] {
  const steps: Step[] = [];
  if (day.workout.kind === 'main') {
    WARMUP.forEach((w) => steps.push({ kind: 'warmup', item: w, workoutId: day.workout.id }));
    day.workout.exercises.forEach((ex) => steps.push({ kind: 'main', item: ex }));
  } else if (day.workout.kind === 'recovery') {
    day.workout.exercises.forEach((ex) => steps.push({ kind: 'recovery', item: ex }));
  }
  return steps;
}

function stepName(step: Step): string {
  return EXERCISE_CATALOG[step.item.id].name;
}

/** Rest to show before moving on to the next step. Only main/warmup items carry a rest value. */
function restSecondsFor(step: Step, phaseKey: PhaseKey): number | undefined {
  if (step.kind === 'warmup') return step.item.rest_sec;
  if (step.kind === 'main') {
    const p = getPrescription(step.item, phaseKey);
    return p.rest_sec ?? p.rest_between_attempts_sec;
  }
  return undefined;
}

function stepBits(step: Step, phaseKey: PhaseKey): string[] {
  return step.kind === 'warmup' ? describeWarmupItem(step.item).bits : describeRecoveryItem(step.item, phaseKey).bits;
}

/** The big "what's coming" number for warmup/recovery steps (main steps get theirs from ExerciseAccordion). */
function stepTargetBig(step: Step, phaseKey: PhaseKey): string {
  if (step.kind === 'warmup') {
    const w = step.item;
    if (w.duration_sec !== undefined) return formatSeconds(w.duration_sec);
    if (w.reps !== undefined) return w.sets ? `${w.sets}×${w.reps}` : `${w.reps}`;
    return '—';
  }
  if (step.kind === 'recovery') {
    const ex = step.item;
    const duration = getRecoveryDuration(ex, phaseKey);
    if (duration !== undefined) return formatSeconds(duration);
    if (ex.reps !== undefined) return `${ex.reps}`;
  }
  return '—';
}

interface Props {
  day: ResolvedDay;
  logs: LogEntry[];
  onSaveLog: (log: LogEntry) => void;
  onExit: () => void;
  /** Today's logged bodyweight (kg), prefilled as the starting Load for each exercise step. */
  defaultLoadKg?: number;
  /** Manual target overrides, keyed by exerciseId. */
  targetOverrides: Record<string, number>;
  onAdjustTargetOverride: (exerciseId: string, baselineTarget: number, delta: number, minStep: number) => void;
  onClearTargetOverride: (exerciseId: string) => void;
}

export default function GuidedSession({
  day,
  logs,
  onSaveLog,
  onExit,
  defaultLoadKg,
  targetOverrides,
  onAdjustTargetOverride,
  onClearTargetOverride,
}: Props) {
  const [steps] = useState(() => buildSteps(day));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'active' | 'rest'>('active');
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
  const Icon = categoryIcon(meta.category);
  const isLast = index === steps.length - 1;
  const isFirst = index === 0;

  function goToStep(next: number) {
    setIndex(next);
    setPhase('active');
    setStepComplete(false);
  }

  function advance() {
    goToStep(index + 1);
  }

  function handleBack() {
    if (phase === 'rest') {
      setPhase('active');
      return;
    }
    if (!isFirst) goToStep(index - 1);
  }

  function handleFinish() {
    if (isLast) {
      onExit();
      return;
    }
    const rest = restSecondsFor(step, day.phaseKey);
    if (rest) {
      setPhase('rest');
    } else {
      advance();
    }
  }

  return (
    <div className="space-y-4 md:flex md:items-start md:gap-4 md:space-y-0">
      <div className="min-w-0 space-y-4 md:flex-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Step {index + 1} of {steps.length}
          </span>
          <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-400" onClick={onExit}>
            <X className="h-3.5 w-3.5" />
            Exit session
          </button>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.6)] transition-all"
            style={{ width: `${((index + 1) / steps.length) * 100}%` }}
          />
        </div>

        {phase === 'active' ? (
          <>
            {step.kind === 'main' ? (
              <ExerciseAccordion
                key={step.item.id}
                exercise={step.item}
                phaseKey={day.phaseKey}
                date={day.date}
                workoutId={day.workout.id}
                logs={logs}
                onSaveLog={onSaveLog}
                defaultLoadKg={defaultLoadKg}
                onAutoAdvance={handleFinish}
                forceExpanded
                compact
                glow
                targetOverride={targetOverrides[step.item.id]}
                onAdjustTargetOverride={(delta, baselineTarget, minStep) =>
                  onAdjustTargetOverride(step.item.id, baselineTarget, delta, minStep)
                }
                onClearTargetOverride={() => onClearTargetOverride(step.item.id)}
              />
            ) : (
              <div className={`rounded-2xl border ${color.border} ${color.bg} ${color.glow} p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{meta.category}</span>
                      <span className="text-base font-semibold text-slate-100">{meta.name}</span>
                      <span className="text-xs text-slate-400">{stepBits(step, day.phaseKey).join(' · ')}</span>
                    </div>
                  </div>
                  <span className={`text-4xl font-extrabold tabular-nums ${color.text}`}>{stepTargetBig(step, day.phaseKey)}</span>
                </div>
                <div className="mt-3">
                  <StepTimer key={`${step.kind}-${step.item.id}-${index}`} step={step} day={day} onComplete={() => setStepComplete(true)} />
                </div>
                {step.kind === 'warmup' && step.item.duration_sec !== undefined && (
                  <WarmupTimeLog
                    exerciseId={step.item.id}
                    workoutId={step.workoutId}
                    date={day.date}
                    targetSeconds={step.item.duration_sec}
                    logs={logs}
                    onSaveLog={onSaveLog}
                  />
                )}
              </div>
            )}

            {stepComplete && step.kind !== 'main' && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <PartyPopper className="h-3.5 w-3.5" />
                Nice work - tap {isLast ? 'Finish routine' : 'Finish'} when you're ready.
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                className="flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-30"
                onClick={handleBack}
                disabled={isFirst}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500"
                onClick={handleFinish}
              >
                {isLast ? 'Finish routine' : 'Finish'}
                {!isLast && <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </>
        ) : (
          <RestScreen
            seconds={restSecondsFor(step, day.phaseKey) ?? 0}
            upNextName={steps[index + 1] ? stepName(steps[index + 1]) : undefined}
            onDone={advance}
            onSkip={advance}
            onBack={handleBack}
          />
        )}
      </div>

      <StepList steps={steps} currentIndex={index} onSelect={goToStep} />
    </div>
  );
}

function StepList({ steps, currentIndex, onSelect }: { steps: Step[]; currentIndex: number; onSelect: (i: number) => void }) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 md:sticky md:top-4 md:w-64 md:shrink-0">
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Today's steps</p>
      <div className="max-h-64 space-y-0.5 overflow-y-auto md:max-h-[70vh]">
        {steps.map((s, i) => {
          const m = EXERCISE_CATALOG[s.item.id];
          const Icon = categoryIcon(m.category);
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition ${
                isCurrent
                  ? 'bg-emerald-500/15 font-semibold text-emerald-300'
                  : isDone
                    ? 'text-slate-500 hover:bg-slate-800/60'
                    : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isCurrent ? 'text-emerald-300' : 'text-slate-500'}`} />
              )}
              <span className="truncate">{m.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function RestScreen({
  seconds,
  upNextName,
  onDone,
  onSkip,
  onBack,
}: {
  seconds: number;
  upNextName?: string;
  onDone: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-amber-900/60 bg-gradient-to-b from-amber-500/10 to-transparent p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">Rest</p>
      <CountdownTimer seconds={seconds} label="Rest" accent="text-amber-400" onDone={onDone} autoStart prepSeconds={0} />
      {upNextName && <p className="text-xs text-slate-400">Up next: {upNextName}</p>}
      <div className="flex items-center justify-center gap-2">
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
          onClick={onBack}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
          onClick={onSkip}
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip rest
        </button>
      </div>
    </div>
  );
}

function StepTimer({ step, day, onComplete }: { step: Step; day: ResolvedDay; onComplete: () => void }) {
  if (step.kind === 'warmup') {
    const { plan, label } = describeWarmupItem(step.item);
    return plan.kind !== 'none' ? (
      <TimerRunner plan={plan} label={label} onComplete={onComplete} />
    ) : (
      <p className="text-xs text-slate-500">No timer needed - perform at your own pace, then continue.</p>
    );
  }

  const { plan, label } = describeRecoveryItem(step.item, day.phaseKey);
  return plan.kind !== 'none' ? (
    <TimerRunner plan={plan} label={label} onComplete={onComplete} />
  ) : (
    <p className="text-xs text-slate-500">No timer needed - perform at your own pace, then continue.</p>
  );
}
