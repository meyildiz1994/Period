import { addDays, diffDays, fromISODate } from '../lib/dates';
import type { Phase } from '../components/Cycle';
import { pastCycles } from './history';
import { latestPeriod, useLog, type LogState } from './log';
import { useOnboarding, type OnboardingState } from './onboarding';

// Calendar estimate of where today sits in the cycle. Not a medical reading: every
// prediction shown from this is labelled "estimate" in the UI.
export type CycleSettings = {
  lastPeriodStart: string | null;
  /** Last day of that period once logged; until then the period length is an estimate. */
  lastPeriodEnd: string | null;
  /** Average of the last six logged cycles once there are two, otherwise the user's setting. */
  cycleLength: number;
  periodLength: number;
  /** Cycles vary too much for a single date: the next period is shown as a window and phases are hidden. */
  irregular: boolean;
  /** Earliest and latest expected cycle length; equal when regular. */
  window: { min: number; max: number };
};

/** Cycles logged before history replaces the user's own answers. */
const HISTORY_MIN = 2;
/** Cycles logged before history alone decides whether cycles are irregular. */
const IRREGULAR_MIN = 3;
const WINDOW = 6;
/** Spread between the shortest and longest recent cycle above which cycles count as irregular. */
const IRREGULAR_SPREAD = 7;
/** Half-width of the window for someone who says their cycles are irregular but hasn't logged enough. */
const UNKNOWN_SPREAD = 5;

/** Length of the latest period: logged when it has ended, otherwise the usual length. */
export function periodSpan(s: CycleSettings) {
  return s.lastPeriodStart && s.lastPeriodEnd ? diffDays(fromISODate(s.lastPeriodStart), fromISODate(s.lastPeriodEnd)) + 1 : s.periodLength;
}

/** Cycle settings from onboarding answers, refined by the logged history. */
export function cycleSettings(o: Pick<OnboardingState, 'cycleLength' | 'periodLength' | 'regularity' | 'goal'>, log: LogState): CycleSettings {
  const latest = latestPeriod(log);
  const lengths = pastCycles(log.periods, o.periodLength).slice(0, WINDOW).map((c) => c.length);
  const fromHistory = lengths.length >= HISTORY_MIN;
  const cycleLength = fromHistory ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : o.cycleLength;
  const min = fromHistory ? Math.min(...lengths) : cycleLength;
  const max = fromHistory ? Math.max(...lengths) : cycleLength;
  const said = o.regularity === 'irregular' || o.goal === 'irregular';
  const irregular = lengths.length >= IRREGULAR_MIN ? max - min > IRREGULAR_SPREAD : said || (fromHistory && max - min > IRREGULAR_SPREAD);
  const window = !irregular
    ? { min: cycleLength, max: cycleLength }
    : fromHistory && max - min > 0
      ? { min, max }
      : { min: cycleLength - UNKNOWN_SPREAD, max: cycleLength + UNKNOWN_SPREAD };
  return { lastPeriodStart: latest?.start ?? null, lastPeriodEnd: latest?.end ?? null, cycleLength, periodLength: o.periodLength, irregular, window };
}

export function useCycleSettings(): CycleSettings {
  return cycleSettings(useOnboarding(), useLog());
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
      /** Earliest expected start; the same as `latestStart` when cycles are regular. */
      nextStart: Date;
      latestStart: Date;
      /** Days until `nextStart`; 0 or less while inside an irregular window. */
      daysUntilNext: number;
      irregular: boolean;
      lastStart: Date;
    }
  /** Latest expected start has come (daysLate 0) or passed without a new period being logged. */
  | { kind: 'late'; daysLate: number; cycleDay: number; expected: Date; lastStart: Date };

export function cycleStatus(s: CycleSettings, today: Date): CycleStatus {
  if (!s.lastPeriodStart) return { kind: 'empty' };
  const lastStart = fromISODate(s.lastPeriodStart);
  const cycleDay = diffDays(lastStart, today) + 1;
  const nextStart = addDays(lastStart, s.window.min);
  const latestStart = addDays(lastStart, s.window.max);
  const daysUntilLatest = diffDays(today, latestStart);
  // Regular cycles are due on one day; an irregular window is only late once it has closed.
  const late = s.irregular ? daysUntilLatest < 0 : daysUntilLatest <= 0;
  if (late) return { kind: 'late', daysLate: -daysUntilLatest, cycleDay, expected: latestStart, lastStart };

  const periodDay = cycleDay <= periodSpan(s) ? cycleDay : null;
  // Phase estimates need a predictable cycle, so irregular cycles only show the period itself.
  const phase: Phase = periodDay !== null ? 'Menstrual' : s.irregular ? 'Neutral' : phaseOf(cycleDay, false, s.cycleLength);
  return {
    kind: 'cycle', cycleDay, periodDay, phase, progress: cycleDay / s.window.max,
    nextStart, latestStart, daysUntilNext: diffDays(today, nextStart), irregular: s.irregular, lastStart,
  };
}

/** Calendar estimate: ovulation is taken as 14 days before the next period, ±1 day. */
export function phaseOf(cycleDay: number, inPeriod: boolean, cycleLength: number): Phase {
  if (inPeriod) return 'Menstrual';
  const ovulation = cycleLength - 14;
  if (cycleDay < ovulation - 1) return 'Follicular';
  if (cycleDay <= ovulation + 1) return 'Ovulation';
  return 'Luteal';
}

export type StripDay = { date: Date; state: 'Default' | 'Period' | 'Predicted' | 'Selected' };

/** Week strip on Home: the seven days of this week, starting on the user's first weekday. */
export function weekStrip(s: CycleSettings, today: Date, weekStartsOn: 0 | 1 = 0): StripDay[] {
  const first = -((today.getDay() - weekStartsOn + 7) % 7);
  const lastStart = s.lastPeriodStart ? fromISODate(s.lastPeriodStart) : null;
  const span = periodSpan(s);
  const inRange = (d: Date, start: Date, length: number) => {
    const i = diffDays(start, d);
    return i >= 0 && i < length;
  };
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const offset = first + i;
    const date = addDays(today, offset);
    if (offset === 0) return { date, state: 'Selected' };
    if (!lastStart) return { date, state: 'Default' };
    if (inRange(date, lastStart, span)) return { date, state: offset < 0 ? 'Period' : 'Predicted' };
    if (offset > 0 && inRange(date, addDays(lastStart, s.cycleLength), s.periodLength)) return { date, state: 'Predicted' };
    return { date, state: 'Default' };
  });
}

/** Days past the usual length that an unfinished period still counts as ongoing on Home. */
const ONGOING_GRACE = 5;

/** The latest period while it has no end yet (and hasn't run implausibly long), else null. */
export function ongoingPeriod(log: LogState, s: CycleSettings, today: Date) {
  const latest = latestPeriod(log);
  if (!latest || latest.end) return null;
  const day = diffDays(fromISODate(latest.start), today) + 1;
  return day >= 1 && day <= s.periodLength + ONGOING_GRACE ? latest : null;
}
