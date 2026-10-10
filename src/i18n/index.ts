import { getLocales } from 'expo-localization';
import { useSyncExternalStore } from 'react';

import { getOnboarding, subscribeOnboarding, useOnboarding } from '../state/onboarding';

// Turkish and English. Each screen keeps its own copy next to its code (`defineCopy`), and
// shared words (flow, mood, symptoms, "3 days"…) live in ./common. The language is the user's
// choice, or the phone's language until they make one.
export type Lang = 'en' | 'tr';

export const LANGUAGES: { id: Lang; name: string; short: string }[] = [
  { id: 'tr', name: 'Türkçe', short: 'TR' },
  { id: 'en', name: 'English', short: 'EN' },
];

export function deviceLang(): Lang {
  try {
    return getLocales()[0]?.languageCode === 'tr' ? 'tr' : 'en';
  } catch {
    return 'en';
  }
}

export function getLang(): Lang {
  return getOnboarding().language ?? deviceLang();
}

const chosen = () => getOnboarding().language;

export function useLang(): Lang {
  return useSyncExternalStore(subscribeOnboarding, chosen, chosen) ?? deviceLang();
}

/** Copy for one screen. Turkish must have every key English has (checked by TypeScript). */
export function defineCopy<T>(copy: { en: T; tr: NoInfer<T> }) {
  return copy;
}

export function useCopy<T>(copy: { en: T; tr: T }): T {
  return copy[useLang()];
}

/** Outside React (notifications, export). */
export function getCopy<T>(copy: { en: T; tr: T }): T {
  return copy[getLang()];
}

/** First day of the week: always Monday in Turkish, otherwise the user's setting. */
export function useWeekStart(): 0 | 1 {
  const lang = useLang();
  const { weekStartsOn } = useOnboarding();
  return lang === 'tr' ? 1 : weekStartsOn;
}
