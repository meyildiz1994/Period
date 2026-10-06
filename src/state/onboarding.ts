import { useSyncExternalStore } from 'react';

import type { ReminderLead } from '../components/ReminderTiming';

// Answers collected in onboarding (A2–A6). Kept in memory for now; the encrypted
// on-device store in step 9 will persist this and the `done` flag.
export type Goal = 'track' | 'predict' | 'symptoms' | 'irregular';
export type Regularity = 'regular' | 'irregular' | 'unsure';
export type { ReminderLead };

export type OnboardingState = {
  goal: Goal | null;
  /** First day of the last period as YYYY-MM-DD, or null when the user doesn't remember. */
  lastPeriodStart: string | null;
  cycleLength: number;
  periodLength: number;
  regularity: Regularity;
  symptoms: string[];
  reminder: { enabled: boolean; daysBefore: ReminderLead; /** 24 h "HH:MM" */ time: string };
  /** Dashed predicted days on the History calendar (G2 Cycle settings). */
  showPredicted: boolean;
  /** First column of the History calendar: 0 Sunday, 1 Monday (G2). */
  weekStartsOn: 0 | 1;
  /** Shown in the Home greeting and avatar. Not asked in onboarding; set from Me later. */
  name: string | null;
  done: boolean;
  /** False while saved data is being read (B3 loading). Always true until the on-device store in step 9. */
  hydrated: boolean;
};

const initial: OnboardingState = {
  goal: null,
  lastPeriodStart: null,
  cycleLength: 28,
  periodLength: 5,
  regularity: 'regular',
  symptoms: [],
  reminder: { enabled: false, daysBefore: 1, time: '09:00' },
  showPredicted: true,
  weekStartsOn: 0,
  name: null,
  done: false,
  hydrated: true,
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
