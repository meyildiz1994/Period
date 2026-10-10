import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';

import { defineCopy, getCopy } from '../i18n';
import { getCommon } from '../i18n/common';
import type { PastCycle } from '../state/history';
import type { DayLog, Period } from '../state/log';
import { EXPORT_PREFIX } from '../state/persist';
import { addDays, formatMonthDay, toISODate } from './dates';

// Premium: Cycle summary (PDF). A plain listing of what the user logged, made on the phone to
// show a doctor or keep. On purpose it has no interpretation: no "normal"/"irregular", no
// colours or warnings, no estimates. Every page carries the same "not a medical assessment" line.
const COPY = defineCopy({
  en: {
    title: 'Cycle summary',
    made: (date: string) => `Made with Nilemy on ${date}`,
    for: (name: string) => `For ${name}`,
    overview: 'Overview',
    cycles: 'Completed cycles',
    avgCycle: 'Average cycle length',
    avgPeriod: 'Average period length',
    range: 'Shortest / longest cycle',
    days: (n: number) => (n === 1 ? '1 day' : `${n} days`),
    list: 'Cycles',
    start: 'Period start',
    cycleLen: 'Cycle',
    periodLen: 'Period',
    flow: 'Flow logged',
    flowShort: 'Flow',
    symptoms: 'Symptoms logged',
    daily: 'Daily logs',
    date: 'Date',
    pain: 'Pain',
    mood: 'Mood',
    energy: 'Energy',
    note: 'Note',
    none: '—',
    disclaimer: 'This summary was created from entries the user made in the Nilemy app. It is not a medical assessment and must not be used for diagnosis or treatment.',
  },
  tr: {
    title: 'Döngü özeti',
    made: (date: string) => `Nilemy ile ${date} tarihinde oluşturuldu`,
    for: (name: string) => `${name} için`,
    overview: 'Genel bakış',
    cycles: 'Tamamlanan döngü',
    avgCycle: 'Ortalama döngü süresi',
    avgPeriod: 'Ortalama adet süresi',
    range: 'En kısa / en uzun döngü',
    days: (n: number) => `${n} gün`,
    list: 'Döngüler',
    start: 'Adet başlangıcı',
    cycleLen: 'Döngü',
    periodLen: 'Adet',
    flow: 'Kaydedilen akış',
    flowShort: 'Akış',
    symptoms: 'Kaydedilen belirtiler',
    daily: 'Günlük kayıtlar',
    date: 'Tarih',
    pain: 'Ağrı',
    mood: 'Ruh hali',
    energy: 'Enerji',
    note: 'Not',
    none: '—',
    disclaimer: 'Bu özet, kullanıcının Nilemy uygulamasına girdiği kayıtlardan oluşturulmuştur. Tıbbi bir değerlendirme değildir; tanı veya tedavi için kullanılmamalıdır.',
  },
});

const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

export type SummaryOptions = { cycles: PastCycle[]; days: Record<string, DayLog>; current: Period | null; name: string | null; notes: boolean };

export function buildSummaryHtml({ cycles, days, current, name, notes }: SummaryOptions) {
  const c = getCopy(COPY);
  const common = getCommon();
  const today = new Date();
  const label = (d: Date) => `${formatMonthDay(d)} ${d.getFullYear()}`;
  const sym = (s: string) => common.symptom[s] ?? s;

  // Oldest first reads like a diary.
  const ordered = [...cycles].reverse();
  const from = ordered[0]?.start ?? (current ? new Date(current.start) : today);
  const logged = Object.keys(days)
    .filter((k) => k >= toISODate(from))
    .sort()
    .map((k) => ({ key: k, log: days[k] }));

  const rows = ordered
    .map((cy) => {
      const flows = new Set<string>();
      const symptoms = new Set<string>();
      for (let d = cy.start; d <= cy.end; d = addDays(d, 1)) {
        const log = days[toISODate(d)];
        if (log?.flow && log.flow !== 'None') flows.add(common.flow[log.flow]);
        for (const s of log?.symptoms ?? []) symptoms.add(sym(s));
      }
      return `<tr><td>${esc(label(cy.start))}</td><td>${esc(c.days(cy.length))}</td><td>${esc(c.days(cy.periodDays))}</td><td>${esc([...flows].join(', ') || c.none)}</td><td>${esc([...symptoms].join(', ') || c.none)}</td></tr>`;
    })
    .join('');

  const daily = logged
    .map(({ key, log }) => {
      const d = new Date(key + 'T00:00:00');
      const cells = [
        label(d),
        log.flow && log.flow !== 'None' ? common.flow[log.flow] : c.none,
        log.pain ? common.pain[log.pain] : c.none,
        log.mood ? common.mood[log.mood] : c.none,
        log.energy ? common.energy[log.energy] : c.none,
        log.symptoms.map(sym).join(', ') || c.none,
        ...(notes ? [log.note || c.none] : []),
      ];
      return `<tr>${cells.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`;
    })
    .join('');

  const lengths = cycles.map((cy) => cy.length);
  const overview = cycles.length
    ? `<table class="kv">
        <tr><td>${c.cycles}</td><td>${cycles.length}</td></tr>
        <tr><td>${c.avgCycle}</td><td>${esc(c.days(avg(lengths)))}</td></tr>
        <tr><td>${c.avgPeriod}</td><td>${esc(c.days(avg(cycles.map((cy) => cy.periodDays))))}</td></tr>
        <tr><td>${c.range}</td><td>${esc(`${c.days(Math.min(...lengths))} / ${c.days(Math.max(...lengths))}`)}</td></tr>
      </table>`
    : '';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { margin: 18mm 14mm 22mm; }
    body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #2A1520; font-size: 10.5pt; }
    h1 { font-size: 20pt; margin: 0 0 2pt; color: #80244E; }
    h2 { font-size: 12.5pt; margin: 18pt 0 6pt; }
    .meta { color: #8A7680; font-size: 9.5pt; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; vertical-align: top; padding: 4pt 6pt; border-bottom: 0.5pt solid #F5E4EA; }
    th { font-size: 9pt; color: #4D3943; border-bottom: 1pt solid #CCA4B3; }
    .kv td:first-child { color: #4D3943; width: 55%; }
    tr { page-break-inside: avoid; }
    .foot { position: fixed; bottom: -14mm; left: 0; right: 0; font-size: 8.5pt; color: #8A7680; border-top: 0.5pt solid #F5E4EA; padding-top: 4pt; }
  </style></head><body>
    <div class="foot">${esc(c.disclaimer)}</div>
    <h1>${c.title}</h1>
    <div class="meta">${esc(c.made(label(today)))}${name ? ` · ${esc(c.for(name))}` : ''}</div>
    ${overview ? `<h2>${c.overview}</h2>${overview}` : ''}
    ${rows ? `<h2>${c.list}</h2><table><tr><th>${c.start}</th><th>${c.cycleLen}</th><th>${c.periodLen}</th><th>${c.flow}</th><th>${c.symptoms}</th></tr>${rows}</table>` : ''}
    ${daily ? `<h2>${c.daily}</h2><table><tr><th>${c.date}</th><th>${c.flowShort}</th><th>${c.pain}</th><th>${c.mood}</th><th>${c.energy}</th><th>${c.symptoms}</th>${notes ? `<th>${c.note}</th>` : ''}</tr>${daily}</table>` : ''}
  </body></html>`;
}

/** Renders the PDF on the phone and returns it, named like the other exports so it's cleaned up. */
export async function writeSummary(options: SummaryOptions) {
  const { uri } = await printToFileAsync({ html: buildSummaryHtml(options), width: 595, height: 842 });
  const made = new File(uri);
  const file = new File(Paths.cache, `${EXPORT_PREFIX}summary-${toISODate(new Date())}.pdf`);
  await made.move(file, { overwrite: true });
  return { uri: file.uri, name: file.name };
}
