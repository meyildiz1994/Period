import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { withTick } from '../lib/haptics';
import { addDays, diffDays, formatMonthDay, formatMonthDayLong, fromISODate, toISODate } from '../lib/dates';
import type { CycleSettings } from '../state/cycle';
import type { DayLog, Pain, Period } from '../state/log';
import { color, radius, type } from '../theme';
import { Button } from './Button';
import { Tag } from './Display';
import { Icon } from './Icon';
import { BottomSheet } from './Sheet';

const COPY = defineCopy({
  en: {
    ongoing: 'Period in progress',
    day: (n: number) => `Day ${n}`,
    ended: 'Ended?',
    endedLabel: 'My period ended',
    title: 'Period ended',
    lasted: (range: string, days: string) => `${range} · ${days}`,
    usual: 'About as long as usual.',
    shorter: (days: string) => `${days} shorter than usual.`,
    longer: (days: string) => `${days} longer than usual.`,
    flow: 'Flow',
    noFlow: 'No flow logged',
    logged: 'You logged',
    times: (name: string, n: number) => (n > 1 ? `${name} · ${n} days` : name),
    pain: (level: string) => `Pain up to ${level.toLowerCase()}`,
    nothing: 'No symptoms logged this time. Anything you add in the daily log shows up here next time.',
    next: (date: string) => `Next period around ${date}`,
    nextRange: (from: string, to: string) => `Next period between ${from} and ${to}`,
    estimate: 'Estimate',
    ok: 'Got it',
    changeEnd: 'Change end date',
  },
  tr: {
    ongoing: 'Adetin sürüyor',
    day: (n: number) => `${n}. gün`,
    ended: 'Bitti mi?',
    endedLabel: 'Adetim bitti',
    title: 'Adetin bitti',
    lasted: (range: string, days: string) => `${range} · ${days}`,
    usual: 'Genelde sürdüğü kadar.',
    shorter: (days: string) => `Her zamankinden ${days} kısa.`,
    longer: (days: string) => `Her zamankinden ${days} uzun.`,
    flow: 'Akış',
    noFlow: 'Akış kaydedilmedi',
    logged: 'Kaydettiklerin',
    times: (name: string, n: number) => (n > 1 ? `${name} · ${n} gün` : name),
    pain: (level: string) => `En fazla ${level.toLocaleLowerCase('tr')} ağrı`,
    nothing: 'Bu sefer belirti kaydetmedin. Günlük kayda eklediklerin bir dahaki sefere burada görünür.',
    next: (date: string) => `Sonraki adet ${date} civarı`,
    nextRange: (from: string, to: string) => `Sonraki adet ${from} – ${to} arası`,
    estimate: 'Tahmini',
    ok: 'Tamam',
    changeEnd: 'Bitiş tarihini değiştir',
  },
});

/**
 * While a logged period has no end yet (Home): a slim row the user checks off like a to-do.
 * The circle fills, then `onEnd` runs.
 */
export function PeriodOngoingRow({ day, onEnd }: { day: number; onEnd: () => void }) {
  const c = useCopy(COPY);
  const [checked, setChecked] = useState(false);
  const check = () => {
    setChecked(true);
    setTimeout(() => {
      onEnd();
      setChecked(false);
    }, 350);
  };
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={c.endedLabel}
      accessibilityState={{ checked }}
      disabled={checked}
      onPress={withTick(check)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: color['surface/subtle'] }]}
    >
      <View style={styles.badge}>
        <Icon name="drop-fill" size={16} color="text/brand" />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[type('Body/Default', 'SemiBold'), { color: color['text/primary'] }]}>{c.ongoing}</Text>
        <Text numberOfLines={1} style={[type('Caption'), { color: color['text/secondary'] }]}>{c.day(day)}</Text>
      </View>
      <Text style={[type('Body/Small', 'Medium'), { color: color['text/brand'] }]}>{c.ended}</Text>
      <View style={[styles.check, checked && styles.checked]}>
        {checked ? <Icon name="check" size={16} color="text/on-brand" /> : null}
      </View>
    </Pressable>
  );
}

const PAIN_RANK: Record<Pain, number> = { None: 0, Mild: 1, Moderate: 2, Severe: 3 };
/** Bar height per flow level, as a share of the tallest. */
const FLOW_HEIGHT = { None: 0, Spotting: 0.25, Light: 0.5, Medium: 0.75, Heavy: 1 } as const;
const BAR = 44;

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
  const dates = Array.from({ length }, (_, i) => addDays(start, i));
  const logs = dates.map((d) => days[toISODate(d)]);

  const symptoms = new Map<string, number>();
  let pain: Pain | null = null;
  for (const log of logs) {
    for (const s of log?.symptoms ?? []) symptoms.set(s, (symptoms.get(s) ?? 0) + 1);
    if (log?.pain && log.pain !== 'None' && (!pain || PAIN_RANK[log.pain] > PAIN_RANK[pain])) pain = log.pain;
  }
  const top = [...symptoms].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const anyFlow = logs.some((l) => l?.flow && l.flow !== 'None');

  const diff = length - usualLength;
  const compare = Math.abs(diff) <= 1 ? c.usual : diff < 0 ? c.shorter(common.days(-diff)) : c.longer(common.days(diff));
  const nextStart = addDays(start, settings.window.min);
  const next = settings.irregular
    ? c.nextRange(formatMonthDay(nextStart), formatMonthDay(addDays(start, settings.window.max)))
    : c.next(formatMonthDayLong(nextStart));

  return (
    <BottomSheet visible title={c.title} onClose={onClose}>
      <View style={styles.sheet}>
        <View style={{ gap: 2, marginTop: -16 }}>
          <Text style={[type('Body/Default', 'SemiBold'), { color: color['text/primary'] }]}>
            {c.lasted(`${formatMonthDay(start)} – ${formatMonthDay(end)}`, common.days(length))}
          </Text>
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{compare}</Text>
        </View>

        {anyFlow && length <= 10 ? (
          <View style={styles.block} accessible accessibilityLabel={`${c.flow}: ${logs.map((l, i) => `${c.day(i + 1)} ${l?.flow ? common.flow[l.flow] : '–'}`).join(', ')}`}>
            <Text style={[type('Caption', 'SemiBold'), styles.label]}>{c.flow}</Text>
            <View style={styles.bars}>
              {logs.map((l, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: Math.max(4, BAR * FLOW_HEIGHT[l?.flow ?? 'None']), opacity: l?.flow && l.flow !== 'None' ? 1 : 0.25 }]} />
                  </View>
                  <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{dates[i].getDate()}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.block}>
          <Text style={[type('Caption', 'SemiBold'), styles.label]}>{c.logged}</Text>
          {top.length || pain ? (
            <View style={styles.tags}>
              {top.map(([s, n]) => <Tag key={s} size="Small" label={c.times(common.symptom[s] ?? s, n)} />)}
              {pain ? <Tag size="Small" tone="Neutral" label={c.pain(common.pain[pain])} /> : null}
            </View>
          ) : (
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.nothing}</Text>
          )}
        </View>

        <View style={styles.next}>
          <Icon name="calendar" size={20} color="text/brand" />
          <View style={{ flex: 1 }}>
            <Text style={[type('Body/Default', 'SemiBold'), { color: color['text/primary'] }]}>{next}</Text>
            <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{c.estimate}</Text>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Button label={c.ok} fullWidth onPress={onClose} />
          <Button label={c.changeEnd} type="Ghost" size="Medium" fullWidth onPress={onChangeEnd} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingLeft: 12, paddingRight: 10,
    borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'],
  },
  check: { width: 26, height: 26, borderRadius: 999, borderWidth: 1.5, borderColor: color['border/default'], alignItems: 'center', justifyContent: 'center' },
  checked: { borderWidth: 0, backgroundColor: color['surface/brand'] },
  badge: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  sheet: { gap: 20 },
  block: { gap: 8 },
  label: { color: color['text/secondary'] },
  bars: { flexDirection: 'row', gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 4, maxWidth: 32 },
  barTrack: { height: BAR, justifyContent: 'flex-end' },
  bar: { width: 14, borderRadius: 7, backgroundColor: color['surface/brand'] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: color['surface/subtle'] },
});
