import { useSyncExternalStore } from 'react';

// Answers collected in onboarding (A2–A6). Kept in memory for now; the encrypted
// on-device store in step 9 will persist this and the `done` flag.
export type Goal = 'track' | 'predict' | 'symptoms' | 'irregular';
export type Regularity = 'regular' | 'irregular' | 'unsure';
export type ReminderLead = 1 | 2 | 3;

export type OnboardingState = {
  goal: Goal | null;
  /** First day of the last period as YYYY-MM-DD, or null when the user doesn't remember. */
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  regularity: Regularity;
  symptoms: string[];
  reminder: { enabled: boolean; daysBefore: ReminderLead };
  done: boolean;
};

const initial: OnboardingState = {
  goal: null,
  lastPeriodStart: null,
  cycleLength: 28,
  periodLength: 5,
  regularity: 'regular',
  symptoms: [],
  reminder: { enabled: false, daysBefore: 1 },
  done: false,
};

let state = initial;
const listeners = new Set<() => void>();

export function setOnboarding(patch: Partial<OnboardingState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function resetOnboarding() {
  setOnboarding(initial);
}

export function getOnboarding() {
  return state;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useOnboarding() {
  return useSyncExternalStore(subscribe, getOnboarding, getOnboarding);
}

// Local calendar dates as YYYY-MM-DD (no time zone shifts).
export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
