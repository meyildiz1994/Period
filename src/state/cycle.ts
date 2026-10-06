import { addDays, diffDays, fromISODate } from '../lib/dates';
import type { Phase } from '../components/Cycle';
import { latestPeriod, useLog } from './log';
import { useOnboarding } from './onboarding';

// Calendar estimate of where today sits in the cycle. Not a medical reading: every
// prediction shown from this is labelled "estimate" in the UI.
export type CycleSettings = {
  lastPeriodStart: string | null;
  /** Last day of that period once logged; until then the period length is an estimate. */
  lastPeriodEnd: string | null;
  cycleLength: number;
  periodLength: number;
};

/** Length of the latest period: logged when it has ended, otherwise the usual length. */
export function periodSpan(s: CycleSettings) {
  return s.lastPeriodStart && s.lastPeriodEnd ? diffDays(fromISODate(s.lastPeriodStart), fromISODate(s.lastPeriodEnd)) + 1 : s.periodLength;
}

/** Cycle settings from onboarding plus the latest logged period. */
export function useCycleSettings(): CycleSettings {
  const { cycleLength, periodLength } = useOnboarding();
  const latest = latestPeriod(useLog());
  return { lastPeriodStart: latest?.start ?? null, lastPeriodEnd: latest?.end ?? null, cycleLength, periodLength };
}

export type CycleStatus =
  | { kind: 'empty' }
  | {
      kind: 'cycle';
      cycleDay: number;
      /** 1-based day of the period, or null outside the period. */
      periodDay: number | null;
      phase: Phase;
      progress: number;
      nextStart: Date;
      daysUntilNext: number;
      lastStart: Date;
    }
  /** Expected start has come (daysLate 0) or passed without a new period being logged. */
  | { kind: 'late'; daysLate: number; expected: Date; lastStart: Date };

export function cycleStatus(s: CycleSettings, today: Date): CycleStatus {
  if (!s.lastPeriodStart) return { kind: 'empty' };
  const lastStart = fromISODate(s.lastPeriodStart);
  const cycleDay = diffDays(lastStart, today) + 1;
  const nextStart = addDays(lastStart, s.cycleLength);
  const daysUntilNext = diffDays(today, nextStart);

  if (daysUntilNext <= 0) return { kind: 'late', daysLate: -daysUntilNext, expected: nextStart, lastStart };

  const periodDay = cycleDay <= periodSpan(s) ? cycleDay : null;
  const phase: Phase = periodDay ? 'Menstrual' : cycleDay <= s.cycleLength - 14 ? 'Follicular' : 'Luteal';
  return { kind: 'cycle', cycleDay, periodDay, phase, progress: cycleDay / s.cycleLength, nextStart, daysUntilNext, lastStart };
}

export type StripDay = { date: Date; state: 'Default' | 'Period' | 'Predicted' | 'Selected' };

/** Week strip on Home: three days back, today, two ahead. */
export function weekStrip(s: CycleSettings, today: Date): StripDay[] {
  const lastStart = s.lastPeriodStart ? fromISODate(s.lastPeriodStart) : null;
  const span = periodSpan(s);
  const inRange = (d: Date, start: Date, length: number) => {
    const i = diffDays(start, d);
    return i >= 0 && i < length;
  };
  return [-3, -2, -1, 0, 1, 2].map((offset) => {
    const date = addDays(today, offset);
    if (offset === 0) return { date, state: 'Selected' };
    if (!lastStart) return { date, state: 'Default' };
    if (inRange(date, lastStart, span)) return { date, state: offset < 0 ? 'Period' : 'Predicted' };
    if (offset > 0 && inRange(date, addDays(lastStart, s.cycleLength), s.periodLength)) return { date, state: 'Predicted' };
    return { date, state: 'Default' };
  });
}
