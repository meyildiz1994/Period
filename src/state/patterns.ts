import { addDays, diffDays, toISODate } from '../lib/dates';
import type { PastCycle } from './history';
import type { DayLog, Energy, Mood, Pain } from './log';

// Premium insights from the user's own logs: all-time trends, when symptoms usually show up and
// a day-by-day map of mood, energy or pain. Plain counting, no medical reading: nothing here
// says what is normal, only what the logs show.

/** Free Insights shows this many recent cycles; Premium shows every logged cycle. */
export const FREE_CYCLES = 6;
/** A pattern needs the symptom in at least this many different cycles. */
const PATTERN_MIN_CYCLES = 3;
/** Share of a symptom's days that must fall in the same window to call it a pattern. */
const PATTERN_SHARE = 0.6;
/** "Before your period" covers this many days before the next start. */
const BEFORE_DAYS = 7;
const LOW_MOODS: Mood[] = ['Low', 'Irritable', 'Anxious'];

export type AllTime = {
  count: number;
  avgCycle: number;
  avgPeriod: number;
  shortest: number;
  longest: number;
  /** Average distance of a cycle from the average, in days. */
  variation: number;
  /** Per calendar year of the cycle start, newest first. */
  years: { year: number; count: number; avgCycle: number; avgPeriod: number }[];
};

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

export function allTime(cycles: PastCycle[]): AllTime | null {
  if (!cycles.length) return null;
  const lengths = cycles.map((c) => c.length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const byYear = new Map<number, PastCycle[]>();
  for (const c of cycles) byYear.set(c.start.getFullYear(), [...(byYear.get(c.start.getFullYear()) ?? []), c]);
  return {
    count: cycles.length,
    avgCycle: Math.round(mean),
    avgPeriod: avg(cycles.map((c) => c.periodDays)),
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    variation: Math.round(lengths.reduce((a, l) => a + Math.abs(l - mean), 0) / lengths.length),
    years: [...byYear]
      .sort((a, b) => b[0] - a[0])
      .map(([year, cs]) => ({ year, count: cs.length, avgCycle: avg(cs.map((c) => c.length)), avgPeriod: avg(cs.map((c) => c.periodDays)) })),
  };
}

/** Each logged day of a completed cycle with where it falls: cycle day and days until the next period. */
function* cycleDays(cycles: PastCycle[], days: Record<string, DayLog>) {
  for (const c of cycles) {
    for (let d = c.start, day = 1; d <= c.end; d = addDays(d, 1), day++) {
      const log = days[toISODate(d)];
      if (log) yield { cycle: c, log, cycleDay: day, untilNext: diffDays(d, addDays(c.end, 1)) };
    }
  }
}

export type Pattern =
  | { name: string; kind: 'during'; day: number; cycles: number }
  | { name: string; kind: 'before'; days: number; cycles: number };

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) / 2)];
};

/**
 * Symptoms (and low moods) that keep showing up at the same point of the cycle: during the
 * period ("usually on day 1") or in the week before it ("usually 2 days before").
 */
export function patterns(cycles: PastCycle[], days: Record<string, DayLog>): Pattern[] {
  const seen = new Map<string, { during: number[]; before: number[]; total: number; cycles: Set<number> }>();
  const note = (name: string, cycle: PastCycle, cycleDay: number, untilNext: number) => {
    const s = seen.get(name) ?? { during: [], before: [], total: 0, cycles: new Set<number>() };
    s.total++;
    s.cycles.add(cycle.number);
    if (cycleDay <= cycle.periodDays) s.during.push(cycleDay);
    else if (untilNext <= BEFORE_DAYS) s.before.push(untilNext);
    seen.set(name, s);
  };
  for (const { cycle, log, cycleDay, untilNext } of cycleDays(cycles, days)) {
    for (const s of log.symptoms) note(s, cycle, cycleDay, untilNext);
    if (log.mood && LOW_MOODS.includes(log.mood)) note(`mood:${log.mood}`, cycle, cycleDay, untilNext);
  }
  const out: Pattern[] = [];
  for (const [name, s] of seen) {
    if (s.cycles.size < PATTERN_MIN_CYCLES) continue;
    if (s.during.length >= s.before.length && s.during.length / s.total >= PATTERN_SHARE) {
      out.push({ name, kind: 'during', day: median(s.during), cycles: s.cycles.size });
    } else if (s.before.length / s.total >= PATTERN_SHARE) {
      out.push({ name, kind: 'before', days: median(s.before), cycles: s.cycles.size });
    }
  }
  return out.sort((a, b) => b.cycles - a.cycles);
}


/** Symptoms that usually come in the days before a period, for the pattern reminder. */
export function beforePeriodSymptoms(cycles: PastCycle[], days: Record<string, DayLog>) {
  return patterns(cycles, days).filter((p): p is Extract<Pattern, { kind: 'before' }> => p.kind === 'before' && !p.name.startsWith('mood:'));
}

export type Metric = 'mood' | 'energy' | 'pain';
/** 0 = nothing logged, then 1 (best) … 3 (hardest), so one colour scale works for every metric. */
export type Level = 0 | 1 | 2 | 3;

const LEVEL: { mood: Record<Mood, Level>; energy: Record<Energy, Level>; pain: Record<Pain, Level> } = {
  mood: { Good: 1, Okay: 2, Low: 3, Irritable: 3, Anxious: 3 },
  energy: { High: 1, Medium: 2, Low: 3 },
  pain: { None: 1, Mild: 2, Moderate: 3, Severe: 3 },
};

export function level(log: DayLog | undefined, metric: Metric): Level {
  const v = log?.[metric];
  if (!v) return 0;
  return (LEVEL[metric] as Record<string, Level>)[v] ?? 0;
}

/** One row per cycle (newest first): the level of each cycle day, plus the period length. */
export function heatmap(cycles: PastCycle[], days: Record<string, DayLog>, metric: Metric) {
  return cycles.map((c) => ({
    cycle: c,
    cells: Array.from({ length: c.length }, (_, i) => level(days[toISODate(addDays(c.start, i))], metric)),
  }));
}
