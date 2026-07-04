export interface PatternSegment {
  sec: number;
  label: string;
}

/** Parses interval patterns like "20s_fast_10s_slow" into repeatable [{sec, label}] segments. */
export function parsePattern(pattern: string): PatternSegment[] {
  const segments: PatternSegment[] = [];
  const re = /(\d+)s_([a-zA-Z]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pattern))) {
    segments.push({ sec: Number(m[1]), label: m[2][0].toUpperCase() + m[2].slice(1) });
  }
  return segments;
}
