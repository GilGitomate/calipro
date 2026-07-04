export type TimerKind = 'none' | 'countdown' | 'setCycle' | 'accumulate' | 'interval';

export interface TimerPlan {
  kind: TimerKind;
  workSeconds?: number;
  restSeconds?: number;
  sets?: number;
  pattern?: string;
}

export function planForDurationItem(opts: {
  durationSeconds?: number;
  sets?: number;
  restSeconds?: number;
  pattern?: string;
  isAccumulateSkill?: boolean;
}): TimerPlan {
  const { durationSeconds, sets, restSeconds, pattern, isAccumulateSkill } = opts;
  if (durationSeconds === undefined) return { kind: 'none' };
  if (pattern) return { kind: 'interval', workSeconds: durationSeconds, pattern };
  if (isAccumulateSkill) return { kind: 'accumulate', workSeconds: durationSeconds, restSeconds };
  if (sets && sets > 1) return { kind: 'setCycle', workSeconds: durationSeconds, restSeconds, sets };
  return { kind: 'countdown', workSeconds: durationSeconds };
}

export function planForRestOnly(restSeconds: number | undefined): TimerPlan {
  return restSeconds ? { kind: 'countdown', workSeconds: restSeconds } : { kind: 'none' };
}
