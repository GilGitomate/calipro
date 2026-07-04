import { TimerPlan } from '../../lib/timerPlan';
import CountdownTimer from './CountdownTimer';
import SetCycleTimer from './SetCycleTimer';
import AccumulateTimer from './AccumulateTimer';
import IntervalTimer from './IntervalTimer';

interface Props {
  plan: TimerPlan;
  label?: string;
  onComplete?: () => void;
}

export default function TimerRunner({ plan, label = 'Work', onComplete }: Props) {
  switch (plan.kind) {
    case 'setCycle':
      return (
        <SetCycleTimer
          workSeconds={plan.workSeconds!}
          restSeconds={plan.restSeconds}
          sets={plan.sets!}
          workLabel={label}
          onAllDone={onComplete}
        />
      );
    case 'accumulate':
      return <AccumulateTimer targetSeconds={plan.workSeconds!} restSeconds={plan.restSeconds} onTargetReached={onComplete} />;
    case 'interval':
      return <IntervalTimer totalSeconds={plan.workSeconds!} pattern={plan.pattern!} onDone={onComplete} />;
    case 'countdown':
      return <CountdownTimer seconds={plan.workSeconds!} label={label} accent="text-emerald-400" onDone={onComplete} />;
    default:
      return null;
  }
}
