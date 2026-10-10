import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { withTick } from '../lib/haptics';
import { addDays, diffDays, formatMonthDay, formatMonthDayLong, fromISODate, toISODate } from '../lib/dates';
import type { CycleSettings } from '../state/cycle';
import type { DayLog, Period } from '../state/log';
import { color, elevation, type } from '../theme';
import { Button } from './Button';
import { Tag } from './Display';
import { Icon } from './Icon';
import { BottomSheet } from './Sheet';

const COPY = defineCopy({
  en: {
    ended: 'My period ended',
    endedLabel: 'Mark my period as ended',
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
    endedLabel: 'Adetimi bitti olarak işaretle',
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
 * While a logged period has no end yet (Home, floating bottom right): a pill the user checks off
 * like a to-do. The circle fills, then `onEnd` runs.
 */
export function PeriodOngoingPill({ onEnd }: { onEnd: () => void }) {
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
      hitSlop={8}
      style={({ pressed }) => [styles.pill, elevation.brand, pressed && { opacity: 0.9 }]}
    >
      <View style={[styles.check, checked && styles.checked]}>
        {checked ? <Icon name="check" size={14} color="text/brand" /> : null}
      </View>
      <Text style={[type('Body/Default', 'SemiBold'), { color: color['text/on-brand'] }]}>{c.ended}</Text>
    </Pressable>
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
        <View style={styles.badge}>
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
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingLeft: 16, paddingRight: 20,
    borderRadius: 999, backgroundColor: color['surface/brand'],
  },
  check: { width: 22, height: 22, borderRadius: 999, borderWidth: 1.5, borderColor: color['text/on-brand'], alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: color['surface/default'] },
  sheet: { alignItems: 'center', gap: 16, marginTop: -24 },
  badge: { width: 64, height: 64, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  center: { alignItems: 'center', gap: 4 },
  text: { textAlign: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  next: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999, backgroundColor: color['surface/subtle'] },
  actions: { alignSelf: 'stretch', gap: 4, marginTop: 8 },
});
