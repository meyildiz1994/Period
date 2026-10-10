import { useSyncExternalStore } from 'react';

import type { ReminderLead } from '../components/ReminderTiming';

// Answers collected in onboarding (A2–A6) plus app settings. Saved by persist.ts.
export type Goal = 'track' | 'predict' | 'symptoms' | 'irregular';
export type Regularity = 'regular' | 'irregular' | 'unsure';
export type { ReminderLead };
export type CustomReminder = { id: string; title: string; /** 24 h "HH:MM" */ time: string; enabled: boolean };

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
  /** App language; null follows the phone's language (Welcome corner switch, Me › Language). */
  language: 'en' | 'tr' | null;
  /** Shown in the Home greeting and avatar. Not asked in onboarding; set from Me later. */
  name: string | null;
  done: boolean;
  /** Day onboarding was finished (YYYY-MM-DD); the first week has no ads. */
  startedAt: string | null;
  /** Premium: symptoms the user added, shown after the built-in ones. */
  customSymptoms: string[];
  /** Premium: daily reminders the user set (vitamins, medication, water…). */
  customReminders: CustomReminder[];
  /** Premium: a heads-up before the period that names the symptoms the user usually has then. */
  patternReminder: boolean;
  /** False while saved data is being read at launch (Splash waits, Home shows B3). */
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
  language: null,
  name: null,
  done: false,
  startedAt: null,
  customSymptoms: [],
  customReminders: [],
  patternReminder: false,
  hydrated: false,
};

let state = initial;
const listeners = new Set<() => void>();

export function setOnboarding(patch: Partial<OnboardingState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

/** Back to first-launch answers; the saved data stays loaded. */
export function resetOnboarding() {
  setOnboarding({ ...initial, language: state.language, hydrated: true });
}

export function getOnboarding() {
  return state;
}

export function subscribeOnboarding(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useOnboarding() {
  return useSyncExternalStore(subscribeOnboarding, getOnboarding, getOnboarding);
}
