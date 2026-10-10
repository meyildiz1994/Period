import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, IconBadge, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { addDays, diffDays, formatMonthDay, formatShort, fromISODate, toISODate } from '../../lib/dates';
import { useCycleSettings } from '../../state/cycle';
import { useLog, type Pain } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Period ended',
    heading: 'Done for this cycle',
    lasted: (days: string) => `It lasted ${days}.`,
    usual: 'About as long as usual.',
    shorter: (days: string) => `${days} shorter than usual.`,
    longer: (days: string) => `${days} longer than usual.`,
    summary: 'This period',
    symptoms: 'What you logged',
    /** "Cramps (3 days)" */
    symptomDays: (name: string, days: string) => `${name} (${days})`,
    pain: 'Strongest pain',
    heaviest: 'Heaviest flow',
    heaviestOn: (level: string, day: number) => `${level}, day ${day}`,
    nothing: 'Nothing logged for these days. Add symptoms in the daily log and they’ll show up here next time.',
    next: 'Next period',
    around: (date: string) => `Around ${date} · estimate`,
    range: (from: string, to: string) => `${from} – ${to} · estimate`,
    done: 'Done',
    changeEnd: 'Change end date',
  },
  tr: {
    title: 'Adet bitti',
    heading: 'Bu dönem tamam',
    lasted: (days: string) => `${days} sürdü.`,
    usual: 'Genelde sürdüğü kadar.',
    shorter: (days: string) => `Her zamankinden ${days} kısa.`,
    longer: (days: string) => `Her zamankinden ${days} uzun.`,
    summary: 'Bu adet',
    symptoms: 'Kaydettiklerin',
    symptomDays: (name: string, days: string) => `${name} (${days})`,
    pain: 'En güçlü ağrı',
    heaviest: 'En yoğun akış',
    heaviestOn: (level: string, day: number) => `${level}, ${day}. gün`,
    nothing: 'Bu günler için kayıt yok. Günlük kayıtta belirti eklersen bir dahaki sefere burada özetlenir.',
    next: 'Sonraki adet',
    around: (date: string) => `${date} civarı · tahmini`,
    range: (from: string, to: string) => `${from} – ${to} · tahmini`,
    done: 'Tamam',
    changeEnd: 'Bitiş tarihini değiştir',
  },
});

const PAIN_RANK: Record<Pain, number> = { None: 0, Mild: 1, Moderate: 2, Severe: 3 };
const FLOW_RANK = { None: 0, Spotting: 1, Light: 2, Medium: 3, Heavy: 4 } as const;

// C6 Period ended: shown after "My period ended" on Home. A short summary of the period that
// just ended (from the daily logs) and the next estimate.
export default function PeriodEnded() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { start: startKey } = useLocalSearchParams<{ start: string }>();
  const log = useLog();
  const settings = useCycleSettings();
  const { periodLength } = useOnboarding();
  const period = log.periods.find((p) => p.start === startKey);
  if (!period?.end) return null;

  const start = fromISODate(period.start);
  const end = fromISODate(period.end);
  const length = diffDays(start, end) + 1;

  const symptoms = new Map<string, number>();
  let pain: Pain | null = null;
  let heaviest: { level: keyof typeof FLOW_RANK; day: number } | null = null;
  for (let i = 0; i < length; i++) {
    const day = log.days[toISODate(addDays(start, i))];
    if (!day) continue;
    for (const s of day.symptoms) symptoms.set(s, (symptoms.get(s) ?? 0) + 1);
    if (day.pain && day.pain !== 'None' && (!pain || PAIN_RANK[day.pain] > PAIN_RANK[pain])) pain = day.pain;
    if (day.flow && day.flow !== 'None' && (!heaviest || FLOW_RANK[day.flow] > FLOW_RANK[heaviest.level])) heaviest = { level: day.flow, day: i + 1 };
  }
  const top = [...symptoms].sort((a, b) => b[1] - a[1]).slice(0, 3);

  const diff = length - periodLength;
  const compare = Math.abs(diff) <= 1 ? c.usual : diff < 0 ? c.shorter(common.days(-diff)) : c.longer(common.days(diff));
  const nextStart = addDays(start, settings.window.min);
  const next = settings.irregular
    ? c.range(formatMonthDay(nextStart), formatMonthDay(addDays(start, settings.window.max)))
    : c.around(formatShort(nextStart));

  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={
        <View style={styles.footer}>
          <Button label={c.done} fullWidth onPress={router.back} />
          <Button label={c.changeEnd} type="Ghost" fullWidth onPress={() => router.replace({ pathname: '/log/period', params: { start: period.start } })} />
        </View>
      }
    >
      <View style={styles.hero}>
        <IconBadge icon="check" tone="Brand" size={64} />
        <Text accessibilityRole="header" style={[type('Title/Medium', 'Bold'), styles.center, { color: color['text/primary'] }]}>{c.heading}</Text>
        <Text style={[type('Body/Default'), styles.center, { color: color['text/secondary'] }]}>{`${c.lasted(common.days(length))} ${compare}`}</Text>
      </View>

      <View style={styles.card}>
        <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{c.summary}</Text>
        {top.length || pain || heaviest ? (
          <>
            {top.length ? <Row label={c.symptoms} value={top.map(([s, n]) => c.symptomDays(common.symptom[s] ?? s, common.days(n))).join(', ')} /> : null}
            {pain ? <Row label={c.pain} value={common.pain[pain]} /> : null}
            {heaviest ? <Row label={c.heaviest} value={c.heaviestOn(common.flow[heaviest.level], heaviest.day)} /> : null}
          </>
        ) : (
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.nothing}</Text>
        )}
      </View>

      <View style={[styles.card, styles.next]}>
        <Text style={[type('Body/Small'), { color: color['text/softest'] }]}>{c.next}</Text>
        <Text style={[type('Headline', 'SemiBold'), { color: color['text/on-brand'] }]}>{next}</Text>
      </View>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{label}</Text>
      <Text style={[type('Body/Default', 'Medium'), { color: color['text/primary'] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  center: { textAlign: 'center' },
  card: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  next: { gap: 4, borderWidth: 0, backgroundColor: color['surface/brand'] },
  row: { gap: 2 },
  footer: { gap: 4 },
});
