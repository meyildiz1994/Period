import { getLang } from '../i18n';

// Calendar-day helpers. Dates are local calendar days; times are ignored. Formatting follows
// the app language (Turkish: "14 Kasım", 24-hour clock).
const DAY = 24 * 60 * 60 * 1000;
const NAMES = {
  en: {
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    initials: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  tr: {
    weekdays: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    weekdaysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    initials: ['P', 'P', 'S', 'Ç', 'P', 'C', 'C'],
    months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  },
};
const names = () => NAMES[getLang()];
const tr = () => getLang() === 'tr';

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Whole calendar days from `a` to `b` (b − a). Rounded so DST shifts don't matter. */
export function diffDays(a: Date, b: Date) {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY);
}

export function sameDay(a: Date, b: Date) {
  return diffDays(a, b) === 0;
}

/** YYYY-MM-DD */
export function toISODate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fromISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** "Thu, Dec 10" · "10 Ara Per" */
export function formatShort(d: Date) {
  const n = names();
  return tr() ? `${d.getDate()} ${n.monthsShort[d.getMonth()]} ${n.weekdaysShort[d.getDay()]}` : `${n.weekdaysShort[d.getDay()]}, ${n.monthsShort[d.getMonth()]} ${d.getDate()}`;
}

/** "Saturday, December 12" · "12 Aralık Cumartesi" */
export function formatLong(d: Date) {
  const n = names();
  return tr() ? `${d.getDate()} ${n.months[d.getMonth()]} ${n.weekdays[d.getDay()]}` : `${n.weekdays[d.getDay()]}, ${n.months[d.getMonth()]} ${d.getDate()}`;
}

/** "S", "M", "T"… */
export function weekdayInitial(d: Date) {
  return names().initials[d.getDay()];
}

/** "Saturday, Nov 14" */
export function formatDay(d: Date) {
  const n = names();
  return tr() ? `${d.getDate()} ${n.monthsShort[d.getMonth()]} ${n.weekdays[d.getDay()]}` : `${n.weekdays[d.getDay()]}, ${n.monthsShort[d.getMonth()]} ${d.getDate()}`;
}

/** "Nov 14" */
export function formatMonthDay(d: Date) {
  const n = names();
  return tr() ? `${d.getDate()} ${n.monthsShort[d.getMonth()]}` : `${n.monthsShort[d.getMonth()]} ${d.getDate()}`;
}

/** "November 14" */
export function formatMonthDayLong(d: Date) {
  const n = names();
  return tr() ? `${d.getDate()} ${n.months[d.getMonth()]}` : `${n.months[d.getMonth()]} ${d.getDate()}`;
}

/** "November 2026" */
export function formatMonthYear(d: Date) {
  return `${names().months[d.getMonth()]} ${d.getFullYear()}`;
}

/** "8:42 PM" · "20:42" */
export function formatTime(d: Date) {
  return formatClock(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

/** "09:00" → "9:00 AM" · "09:00" */
export function formatClock(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  if (tr()) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
