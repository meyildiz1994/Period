import { addDays, toISODate } from '../lib/dates';
import type { PastCycle } from './history';
import type { DayLog } from './log';

// E1 Insights from the user's own logs. Averages are over completed cycles only.
export const MIN_CYCLES = 2;

/** Commonly cited typical ranges for adults, in days. Inside them Insights shows a small "Normal" tag; outside, nothing. */
export const TYPICAL = { cycle: { min: 21, max: 35 }, period: { min: 2, max: 7 } };
export const isTypical = (kind: keyof typeof TYPICAL, days: number) => days >= TYPICAL[kind].min && days <= TYPICAL[kind].max;

const WINDOW = 6;

export type Insights = {
  count: number;
  avgCycle: number;
  avgPeriod: number;
  min: number;
  max: number;
  /** Last six cycles, oldest first, for the bar chart. */
  recent: PastCycle[];
  /** Most logged symptoms over the last six cycles, by days logged. */
  symptoms: { name: string; days: number }[];
};

export function insights(cycles: PastCycle[], days: Record<string, DayLog>, today: Date): Insights | null {
  if (cycles.length < MIN_CYCLES) return null;
  const lengths = cycles.map((c) => c.length);
  const recent = cycles.slice(0, WINDOW).reverse();

  const counts = new Map<string, number>();
  for (let d = recent[0].start; d <= today; d = addDays(d, 1)) {
    for (const s of days[toISODate(d)]?.symptoms ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
  }

  return {
    count: cycles.length,
    avgCycle: Math.round(lengths.reduce((a, b) => a + b, 0) / cycles.length),
    avgPeriod: Math.round(cycles.reduce((a, c) => a + c.periodDays, 0) / cycles.length),
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    recent,
    symptoms: [...counts].map(([name, n]) => ({ name, days: n })).sort((a, b) => b.days - a.days).slice(0, 3),
  };
}
