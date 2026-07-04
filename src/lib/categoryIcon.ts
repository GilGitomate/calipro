import { Activity, Anchor, CircleDot, Dumbbell, Flame, Footprints, HeartPulse, Sparkles, Wind, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  Warmup: Flame,
  Skill: Sparkles,
  Push: Dumbbell,
  Pull: Anchor,
  Legs: Footprints,
  Core: CircleDot,
  Finisher: Zap,
  LISS: HeartPulse,
  Stretch: Wind,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON[category] ?? Activity;
}
