import { useSyncExternalStore } from 'react';

import type { FlowLevelName } from '../components/Cycle';

// Logged periods and daily logs. Saved by persist.ts; screens await `flush()` so a failed
// write can be shown (C4/C5).
export type Period = { start: string; end: string | null };
export type Pain = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type Mood = 'Good' | 'Okay' | 'Low' | 'Irritable' | 'Anxious';
export type Energy = 'High' | 'Medium' | 'Low';
export type DayLog = {
  flow: FlowLevelName | null;
  pain: Pain | null;
  mood: Mood | null;
  /** Added in 1.1; missing on older logs. */
  energy?: Energy | null;
  symptoms: string[];
  note: string;
  /** ISO timestamp of the last save. */
  loggedAt: string;
};

export type LogState = {
  /** Newest first. Dates are YYYY-MM-DD. */
  periods: Period[];
  days: Record<string, DayLog>;
};

const initial: LogState = { periods: [], days: {} };
let state = initial;
const listeners = new Set<() => void>();

function set(next: LogState) {
  state = next;
  listeners.forEach((l) => l());
}

const byStartDesc = (a: Period, b: Period) => (a.start < b.start ? 1 : a.start > b.start ? -1 : 0);

/** Adds a period, or replaces the one that started on `replaceStart`. */
export function savePeriod(period: Period, replaceStart?: string) {
  const rest = state.periods.filter((p) => p.start !== (replaceStart ?? period.start));
  set({ ...state, periods: [...rest, period].sort(byStartDesc) });
}

export function saveDay(date: string, log: Omit<DayLog, 'loggedAt'>) {
  set({ ...state, days: { ...state.days, [date]: { ...log, loggedAt: new Date().toISOString() } } });
}

const EMPTY_DAY: Omit<DayLog, 'loggedAt'> = { flow: null, pain: null, mood: null, energy: null, symptoms: [], note: '' };

/** Changes some fields of a day's log, creating it if needed. */
export function updateDay(date: string, patch: Partial<Omit<DayLog, 'loggedAt'>>) {
  const { loggedAt: _, ...current } = state.days[date] ?? { ...EMPTY_DAY, loggedAt: '' };
  saveDay(date, { ...current, ...patch });
}

export function deletePeriod(start: string) {
  set({ ...state, periods: state.periods.filter((p) => p.start !== start) });
}

export function deleteDay(date: string) {
  const { [date]: _, ...days } = state.days;
  set({ ...state, days });
}

/** Replaces everything at once (loading saved data). */
export function replaceLog(next: LogState) {
  set(next);
}

export function resetLog() {
  set(initial);
}

export function getLog() {
  return state;
}

export function latestPeriod(s: LogState = state): Period | null {
  return s.periods[0] ?? null;
}

export function subscribeLog(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLog() {
  return useSyncExternalStore(subscribeLog, getLog, getLog);
}
