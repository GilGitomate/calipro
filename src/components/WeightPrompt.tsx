import { useState } from 'react';
import { Play, Weight } from 'lucide-react';

interface Props {
  workoutName: string;
  onSubmit: (kg: number) => void;
  onSkip: () => void;
}

/** Asked once before a session starts. The value flows into every exercise's Load field for that day. */
export default function WeightPrompt({ workoutName, onSubmit, onSkip }: Props) {
  const [kg, setKg] = useState('');
  const parsed = Number(kg);
  const valid = kg.trim() !== '' && parsed > 0;

  return (
    <div className="mx-auto flex max-w-xs flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
        <Weight className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-100">Log today's weight</p>
      <p className="text-xs text-slate-400">Used as the starting load for every exercise in {workoutName}.</p>
      <input
        type="number"
        min={0}
        step={0.1}
        inputMode="decimal"
        autoFocus
        placeholder="kg"
        className="w-24 rounded bg-slate-800 px-2 py-1.5 text-center text-lg font-semibold text-slate-100"
        value={kg}
        onChange={(e) => setKg(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && valid) onSubmit(parsed);
        }}
      />
      <button
        className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
        onClick={() => onSubmit(parsed)}
        disabled={!valid}
      >
        <Play className="h-4 w-4" />
        Start {workoutName}
      </button>
      <button className="text-xs text-slate-500 underline hover:text-slate-300" onClick={onSkip}>
        Skip for today
      </button>
    </div>
  );
}
