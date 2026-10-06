import { File, Paths } from 'expo-file-system';

import type { DayLog, Period } from '../state/log';
import { toISODate } from './dates';

// H2–H4 Export: builds a CSV or JSON copy of the logs and writes it to the cache folder
// so it can be shared. The file is not encrypted; the screen says so.
export type ExportFormat = 'csv' | 'json';
export type ExportInclude = { periods: boolean; days: boolean; notes: boolean };

function rows(periods: Period[], days: Record<string, DayLog>, inc: ExportInclude) {
  const out: Record<string, string>[] = [];
  if (inc.periods) {
    for (const p of [...periods].reverse()) out.push({ type: 'period', date: p.start, end: p.end ?? '' });
  }
  if (inc.days || inc.notes) {
    for (const date of Object.keys(days).sort()) {
      const d = days[date];
      const row: Record<string, string> = { type: 'day', date };
      if (inc.days) Object.assign(row, { flow: d.flow ?? '', pain: d.pain ?? '', mood: d.mood ?? '', symptoms: d.symptoms.join('; ') });
      if (inc.notes) row.note = d.note;
      if (inc.days || d.note) out.push(row);
    }
  }
  return out;
}

const COLUMNS = ['type', 'date', 'end', 'flow', 'pain', 'mood', 'symptoms', 'note'];
const csvCell = (v = '') => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function buildExport(periods: Period[], days: Record<string, DayLog>, inc: ExportInclude, format: ExportFormat) {
  const data = rows(periods, days, inc);
  if (format === 'json') return JSON.stringify({ app: 'Period', exportedAt: new Date().toISOString(), records: data }, null, 2);
  return [COLUMNS.join(','), ...data.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\n');
}

/** Writes the export and returns the file to share. Throws when the file can't be written. */
export function writeExport(content: string, format: ExportFormat) {
  const file = new File(Paths.cache, `period-export-${toISODate(new Date())}.${format}`);
  if (file.exists) file.delete();
  file.create();
  file.write(content);
  return { uri: file.uri, name: file.name, size: file.size ?? content.length, mimeType: format === 'csv' ? 'text/csv' : 'application/json' };
}

export function formatSize(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
