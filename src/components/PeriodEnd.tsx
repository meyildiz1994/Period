import { StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { addDays, diffDays, formatMonthDay, formatMonthDayLong, fromISODate, toISODate } from '../lib/dates';
import type { CycleSettings } from '../state/cycle';
import type { DayLog, Period } from '../state/log';
import { color, radius, type } from '../theme';
import { Button } from './Button';
import { Tag } from './Display';
import { Icon } from './Icon';
import { BottomSheet } from './Sheet';

const COPY = defineCopy({
  en: {
    ended: 'My period ended',
    today: 'Today',
    periodDay: (n: number) => `Day ${n} of your period`,
    longerThanUsual: (n: number, usual: number) => `Day ${n} · usually ${usual} days`,
    logToday: 'Log today',
    edit: 'Edit today',
    title: 'Period ended',
    lasted: (range: string, days: string) => `${range} · ${days}`,
    next: (date: string) => `Next one around ${date}`,
    nextRange: (from: string, to: string) => `Next one ${from} – ${to}`,
    estimate: 'estimate',
    ok: 'Got it',
    changeEnd: 'Change end date',
  },
  tr: {
    ended: 'Adetim bitti',
    today: 'Bugün',
    periodDay: (n: number) => `Adetinin ${n}. günü`,
    longerThanUsual: (n: number, usual: number) => `${n}. gün · genelde ${usual} gün sürüyor`,
    logToday: 'Bugünü kaydet',
    edit: 'Bugünü düzenle',
    title: 'Adetin bitti',
    lasted: (range: string, days: string) => `${range} · ${days}`,
    next: (date: string) => `Sonraki adet ${date}`,
    nextRange: (from: string, to: string) => `Sonraki adet ${from} – ${to} arası`,
    estimate: 'tahmini',
    ok: 'Tamam',
    changeEnd: 'Bitiş tarihini değiştir',
  },
});

/**
 * Home's "today" card while a period is open: the day of the period, what was logged today and a
 * button to log it. Ending the period lives in the + menu.
 */
export function PeriodTodayCard({ day, usual, values, onLog }: { day: number; usual: number; values: string[]; onLog: () => void }) {
  const c = useCopy(COPY);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.badge}>
          <Icon name="drop-fill" size={16} color="text/brand" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{c.today}</Text>
          <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{day > usual ? c.longerThanUsual(day, usual) : c.periodDay(day)}</Text>
        </View>
        {values.length ? (
          <View style={styles.values}>
            {values.slice(0, 2).map((v) => <Tag key={v} size="Small" label={v} />)}
          </View>
        ) : null}
      </View>
      <Button label={values.length ? c.edit : c.logToday} iconLeft={values.length ? 'pencil' : 'plus'} size="Medium" fullWidth onPress={onLog} />
    </View>
  );
}

/** Shown on Home right after "It ended": the period at a glance and the next estimate. */
export function PeriodEndSheet({ period, days, settings, usualLength, onClose, onChangeEnd }: {
  period: Period | null; days: Record<string, DayLog>; settings: CycleSettings; usualLength: number; onClose: () => void; onChangeEnd: () => void;
}) {
  const c = useCopy(COPY);
  const common = useCommon();
  if (!period?.end) return <BottomSheet visible={false} title="" onClose={onClose}>{null}</BottomSheet>;

  const start = fromISODate(period.start);
  const end = fromISODate(period.end);
  const length = diffDays(start, end) + 1;

  // The symptoms logged most during the period, as tags. None logged: no tags, nothing else.
  const counts = new Map<string, number>();
  for (let i = 0; i < length; i++) {
    for (const s of days[toISODate(addDays(start, i))]?.symptoms ?? []) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  const symptoms = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s]) => common.symptom[s] ?? s);

  const nextStart = addDays(start, settings.window.min);
  const next = settings.irregular
    ? c.nextRange(formatMonthDay(nextStart), formatMonthDay(addDays(start, settings.window.max)))
    : c.next(formatMonthDayLong(nextStart));

  return (
    <BottomSheet visible title="" onClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.bigBadge}>
          <Icon name="drop-fill" size={28} color="text/brand" />
        </View>
        <View style={styles.center}>
          <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.text, { color: color['text/primary'] }]}>{c.title}</Text>
          <Text style={[type('Body/Default'), styles.text, { color: color['text/secondary'] }]}>
            {c.lasted(`${formatMonthDay(start)} – ${formatMonthDay(end)}`, common.days(length))}
          </Text>
        </View>
        {symptoms.length ? (
          <View style={styles.tags}>
            {symptoms.map((s) => <Tag key={s} label={s} />)}
          </View>
        ) : null}
        <View style={styles.next}>
          <Icon name="calendar" size={18} color="text/brand" />
          <Text style={[type('Body/Default', 'Medium'), { color: color['text/primary'] }]}>{next}</Text>
          <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{c.estimate}</Text>
        </View>
        <View style={styles.actions}>
          <Button label={c.ok} fullWidth onPress={onClose} />
          <Button label={c.changeEnd} type="Ghost" size="Medium" fullWidth onPress={onChangeEnd} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  values: { flexDirection: 'row', flexShrink: 1, justifyContent: 'flex-end', gap: 6 },
  sheet: { alignItems: 'center', gap: 16, marginTop: -24 },
  bigBadge: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  center: { alignItems: 'center', gap: 4 },
  text: { textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: color['surface/subtle'] },
  actions: { alignSelf: 'stretch', gap: 4, marginTop: 8 },
});
