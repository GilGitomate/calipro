import { AppState } from '../types';

const STORAGE_KEY = 'calipro_v2_state';

const EMPTY_STATE: AppState = {
  logs: [],
  scheduleOverrides: {},
  bodyweightByDate: {},
  targetOverrides: {},
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_STATE };
    const parsed = JSON.parse(raw);
    return {
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      scheduleOverrides: parsed.scheduleOverrides ?? {},
      bodyweightByDate: parsed.bodyweightByDate ?? {},
      targetOverrides: parsed.targetOverrides ?? {},
    };
  } catch {
    return { ...EMPTY_STATE };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return { ...EMPTY_STATE };
}
