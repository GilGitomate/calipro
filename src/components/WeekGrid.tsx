import { LogEntry } from '../types';
import { resolveDay } from '../lib/phase';
import { COLOR_CLASSES, workoutColor } from '../lib/format';

interface Props {
  weekDates: string[];
  selectedDate: string;
  logs: LogEntry[];
  overrides: Record<string, string>;
  onSelect: (date: string) => void;
}

export default function WeekGrid({ weekDates, selectedDate, logs, overrides, onSelect }: Props) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDates.map((date) => {
        const day = resolveDay(date, logs, overrides);
        const color = COLOR_CLASSES[workoutColor(day.workoutKey)];
        const isSelected = date === selectedDate;
        return (
          <button
            key={date}
            onClick={() => onSelect(date)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition ${
              isSelected ? 'border-slate-300 bg-slate-800' : `${color.border} ${color.bg} hover:bg-slate-800/80`
            }`}
          >
            <span className="text-[11px] uppercase tracking-wide text-slate-400">{day.dayAbbrev}</span>
            <span className="font-bebas text-xl leading-none tracking-wide text-slate-100">
              {new Date(`${date}T00:00:00`).getDate()}
            </span>
            <span className={`text-[10px] leading-tight ${color.text}`}>{day.workout.name}</span>
            {day.isOverridden && <span className="text-[9px] text-slate-500">edited</span>}
          </button>
        );
      })}
    </div>
  );
}
