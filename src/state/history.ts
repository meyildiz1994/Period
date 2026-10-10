import type { DayState, FlowLevelName } from '../components/Cycle';
import { defineCopy, getCopy } from '../i18n';
import { getCommon } from '../i18n/common';
import { addDays, diffDays, fromISODate, toISODate } from '../lib/dates';
import type { DayLog, Period } from './log';

const COPY = defineCopy({
  en: {
    flow: (level: string) => `${level} flow`,
    pain: (level: string) => `${level} pain`,
    nothing: 'Nothing logged',
    note: 'Note',
    energy: 'Energy',
    flowDays: (level: string, n: number) => `${level} ${n}d`,
  },
  tr: {
    flow: (level: string) => `Akış: ${level}`,
    pain: (level: string) => `Ağrı: ${level}`,
    nothing: 'Kayıt yok',
    note: 'Not',
    energy: 'Enerji',
    flowDays: (level: string, n: number) => `${level} ${n} gün`,
  },
});

// Derived views for History (D1–D3). Periods come newest first from the log store.

/** Days a period covers: logged when ended, otherwise the usual length. */
export function periodLength(p: Period, usual: number) {
  return p.end ? diffDays(fromISODate(p.start), fromISODate(p.end)) + 1 : usual;
}

export type PastCycle = {
  /** 1 = oldest logged cycle. */
  number: number;
  period: Period;
  start: Date;
  /** Last day of the cycle (the day before the next period). */
  end: Date;
  length: number;
  periodDays: number;
};

/** Completed cycles, newest first: each runs from one period start to the day before the next. */
export function pastCycles(periods: Period[], usualPeriod: number): PastCycle[] {
  const cycles: PastCycle[] = [];
  for (let i = 1; i < periods.length; i++) {
    const period = periods[i];
    const start = fromISODate(period.start);
    const next = fromISODate(periods[i - 1].start);
    cycles.push({
      number: periods.length - i,
      period,
      start,
      end: addDays(next, -1),
      length: diffDays(start, next),
      periodDays: periodLength(period, usualPeriod),
    });
  }
  return cycles;
}

/** The period a day belongs to (the latest one starting on or before it), with the 1-based cycle day. */
export function cycleOf(date: Date, periods: Period[]) {
  const key = toISODate(date);
  const period = periods.find((p) => p.start <= key);
  return period ? { period, cycleDay: diffDays(fromISODate(period.start), date) + 1 } : null;
}

export type CalendarSettings = { periods: Period[]; days: Record<string, DayLog>; cycleLength: number; periodLength: number; showPredicted: boolean };

/** Calendar state for a day, before selection and today are applied. */
export function dayState(date: Date, s: CalendarSettings, today: Date): DayState {
  const key = toISODate(date);
  const owner = cycleOf(date, s.periods);
  if (owner) {
    const span = periodLength(owner.period, s.periodLength);
    // An open period's remaining estimated days show as predicted, not logged.
    if (owner.cycleDay <= span) return diffDays(today, date) > 0 && !owner.period.end ? 'Predicted' : 'Period';
  }
  const latest = s.periods[0];
  if (s.showPredicted && latest && diffDays(today, date) > 0) {
    const i = diffDays(addDays(fromISODate(latest.start), s.cycleLength), date);
    if (i >= 0 && i < s.periodLength) return 'Predicted';
  }
  return s.days[key] ? 'Logged' : 'Default';
}

/** "Medium flow · Mild pain · Okay" */
export function daySummary(log: DayLog | undefined) {
  const c = getCopy(COPY);
  if (!log) return c.nothing;
  // Values are stored in English; translate only for display.
  const common = getCommon();
  const parts = [
    log.flow && log.flow !== 'None' ? c.flow(common.flow[log.flow]) : null,
    log.pain && log.pain !== 'None' ? c.pain(common.pain[log.pain]) : null,
    log.mood ? common.mood[log.mood] : null,
    log.energy ? `${c.energy}: ${common.energy[log.energy]}` : null,
    ...log.symptoms.map((s) => common.symptom[s] ?? s),
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : log.note ? c.note : c.nothing;
}

/** "Medium 2d · Light 2d · Spotting 1d" for the logged flow inside a period. */
export function flowBreakdown(period: Period, days: Record<string, DayLog>, usual: number) {
  const counts = new Map<FlowLevelName, number>();
  const start = fromISODate(period.start);
  for (let i = 0; i < periodLength(period, usual); i++) {
    const flow = days[toISODate(addDays(start, i))]?.flow;
    if (flow && flow !== 'None') counts.set(flow, (counts.get(flow) ?? 0) + 1);
  }
  const order: FlowLevelName[] = ['Heavy', 'Medium', 'Light', 'Spotting'];
  const c = getCopy(COPY);
  const { flow } = getCommon();
  return order.filter((f) => counts.has(f)).map((f) => c.flowDays(flow[f], counts.get(f)!)).join(' · ');
}
