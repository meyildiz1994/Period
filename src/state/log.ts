import { useSyncExternalStore } from 'react';

import type { FlowLevelName } from '../components/Cycle';

// Logged periods and daily logs. In memory for now; step 9 moves this into the
// encrypted on-device store, so callers already treat saves as fallible.
export type Period = { start: string; end: string | null };
export type Pain = 'None' | 'Mild' | 'Moderate' | 'Severe';
export type Mood = 'Good' | 'Okay' | 'Low' | 'Irritable' | 'Anxious';
export type DayLog = {
  flow: FlowLevelName | null;
  pain: Pain | null;
  mood: Mood | null;
  symptoms: string[];
  note: string;
  /** ISO timestamp of the last save. */
  loggedAt: string;
};

type LogState = {
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

const EMPTY_DAY: Omit<DayLog, 'loggedAt'> = { flow: null, pain: null, mood: null, symptoms: [], note: '' };

/** Changes some fields of a day's log, creating it if needed. */
export function updateDay(date: string, patch: Partial<Omit<DayLog, 'loggedAt'>>) {
  const { loggedAt: _, ...current } = state.days[date] ?? { ...EMPTY_DAY, loggedAt: '' };
  saveDay(date, { ...current, ...patch });
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

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLog() {
  return useSyncExternalStore(subscribe, getLog, getLog);
}
