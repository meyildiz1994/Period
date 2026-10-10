import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner, Banner, Button, IconBadge, SectionHeader, StatTile, TopBar, useTabBarSpace } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { pastCycles } from '../../state/history';
import { insights, MIN_CYCLES, type Insights as Data } from '../../state/insights';
import { useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { usePremium } from '../../state/premium';
import { color, layout, radius, type } from '../../theme';

const BAR_MAX = 140;

const COPY = defineCopy({
  en: {
    title: 'Insights',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    /** Unit after a number: "1 day", "28 days" */
    day: (n: number): string => (n === 1 ? 'day' : 'days'),
    cycle: (n: number): string => (n === 1 ? 'cycle' : 'cycles'),
    basedOn: (n: number) => `Based on ${n} logged ${n === 1 ? 'cycle' : 'cycles'}`,
    avgCycle: 'Average cycle',
    avgPeriod: 'Average period',
    range: 'Cycle range',
    days: 'days',
    logged: 'Logged cycles',
    cycleLength: 'Cycle length',
    last: (n: number) => `Last ${n}`,
    lengthsLabel: (items: string) => `Cycle lengths: ${items}`,
    lengthItem: (month: string, n: number) => `${month} ${n} days`,
    same: 'Your cycle length stayed the same over this period.',
    varied: (n: number, unit: string) => `Your cycle length varied by ${n} ${unit} over this period.`,
    symptoms: 'Most logged symptoms',
    lastCycles: (n: number) => `Last ${n} cycles`,
    banner: 'Insights are estimates from your own logs, not medical advice.',
    need: (n: number) => `Insights need ${n} cycles`,
    keepLogging: 'Keep logging. After two full cycles you’ll see averages and patterns here.',
    progressLabel: (n: number, of: number) => `Cycles logged: ${n} of ${of}`,
    cyclesLogged: 'Cycles logged',
    progress: (n: number, of: number) => `${n} of ${of}`,
    moreTitle: 'See the full picture',
    moreBody: 'Premium adds your cycle range, a chart of recent cycle lengths and your most common symptoms, and removes ads.',
    moreAction: 'See Premium',
  },
  tr: {
    title: 'Analiz',
    months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    day: () => 'gün',
    cycle: () => 'döngü',
    basedOn: (n: number) => `Kaydedilen ${n} döngüye göre`,
    avgCycle: 'Ortalama döngü',
    avgPeriod: 'Ortalama adet',
    range: 'Döngü aralığı',
    days: 'gün',
    logged: 'Kaydedilen döngü',
    cycleLength: 'Döngü süresi',
    last: (n: number) => `Son ${n}`,
    lengthsLabel: (items: string) => `Döngü süreleri: ${items}`,
    lengthItem: (month: string, n: number) => `${month} ${n} gün`,
    same: 'Döngü süren bu dönemde hiç değişmedi.',
    varied: (n: number, unit: string) => `Döngü süren bu dönemde ${n} ${unit} değişti.`,
    symptoms: 'En sık kaydedilen belirtiler',
    lastCycles: (n: number) => `Son ${n} döngü`,
    banner: 'Analizler kendi kayıtlarına dayanan tahminlerdir, tıbbi tavsiye değildir.',
    need: (n: number) => `Analiz için ${n} döngü gerekiyor`,
    keepLogging: 'Kaydetmeye devam et. İki tam döngüden sonra ortalamaları ve örüntüleri burada göreceksin.',
    progressLabel: (n: number, of: number) => `Kaydedilen döngü: ${n}/${of}`,
    cyclesLogged: 'Kaydedilen döngü',
    progress: (n: number, of: number) => `${n}/${of}`,
    moreTitle: 'Resmin tamamını gör',
    moreBody: 'Premium; döngü aralığını, son döngü sürelerinin grafiğini ve en sık belirtilerini açar, reklamları kaldırır.',
    moreAction: 'Premium’a göz at',
  },
});

// E1 Insights once two cycles are complete, E2 before that.
export default function Insights() {
  const c = useCopy(COPY);
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { periods, days } = useLog();
  const { periodLength, name } = useOnboarding();
  const [today] = useState(() => new Date());
  const cycles = pastCycles(periods, periodLength);
  const data = insights(cycles, days, today);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={c.title} userName={name ?? undefined} onAvatar={() => router.navigate('/me')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        {data ? <Filled data={data} /> : <Waiting logged={cycles.length} />}
        <AdBanner />
      </ScrollView>
    </View>
  );
}

function Filled({ data }: { data: Data }) {
  const c = useCopy(COPY);
  const { symptom } = useCommon();
  const d = c.day;
  const spread = data.recent.length ? Math.max(...data.recent.map((c) => c.length)) - Math.min(...data.recent.map((c) => c.length)) : 0;
  // Bars share a floor a few days under the shortest cycle so day-level differences stay visible;
  // each bar carries its value, so the cut baseline doesn't hide the numbers.
  const lengths = data.recent.map((c) => c.length);
  const floor = Math.min(...lengths) - 5;
  const top = Math.max(...lengths);
  const maxSymptom = data.symptoms[0]?.days ?? 0;
  const { premium } = usePremium();

  // Free version: the two averages; the rest is Premium.
  if (!premium) {
    return (
      <>
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
          {c.basedOn(data.count)}
        </Text>
        <View style={styles.tiles}>
          <StatTile label={c.avgCycle} value={String(data.avgCycle)} unit={d(data.avgCycle)} icon="calendar" />
          <StatTile label={c.avgPeriod} value={String(data.avgPeriod)} unit={d(data.avgPeriod)} icon="drop" />
        </View>
        <View style={[styles.card, styles.waiting]}>
          <IconBadge icon="sparkles" size={48} />
          <Text style={[type('Body/Large', 'SemiBold'), styles.center, { color: color['text/primary'] }]}>{c.moreTitle}</Text>
          <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.moreBody}</Text>
          <Button label={c.moreAction} type="Secondary" size="Small" onPress={() => router.push('/premium')} />
        </View>
        <Banner message={c.banner} />
      </>
    );
  }

  return (
    <>
      <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
        {c.basedOn(data.count)}
      </Text>
      <View style={styles.tiles}>
        <StatTile label={c.avgCycle} value={String(data.avgCycle)} unit={d(data.avgCycle)} icon="calendar" />
        <StatTile label={c.avgPeriod} value={String(data.avgPeriod)} unit={d(data.avgPeriod)} icon="drop" />
      </View>
      <View style={styles.tiles}>
        <StatTile label={c.range} value={data.min === data.max ? String(data.min) : `${data.min}–${data.max}`} unit={c.days} icon="arrows-lr" />
        <StatTile label={c.logged} value={String(data.count)} unit={c.cycle(data.count)} icon="history" />
      </View>

      <SectionHeader title={c.cycleLength} action={c.last(data.recent.length)} />
      <View style={styles.card}>
        <View style={styles.chart} accessibilityRole="image" accessibilityLabel={c.lengthsLabel(data.recent.map((cy) => c.lengthItem(c.months[cy.start.getMonth()], cy.length)).join(', '))}>
          {data.recent.map((cy, i) => {
            const latest = i === data.recent.length - 1;
            const h = top === floor ? BAR_MAX : Math.max(24, (BAR_MAX * (cy.length - floor)) / (top - floor));
            return (
              <View key={cy.period.start} style={styles.barCol}>
                <Text style={[type('Body/Small', 'SemiBold'), { color: color[latest ? 'text/brand' : 'text/secondary'] }]}>{cy.length}</Text>
                <View style={[styles.bar, { height: h, backgroundColor: color[latest ? 'surface/brand' : 'surface/strong'] }]} />
                <Text style={[type('Body/Small', latest ? 'SemiBold' : 'Regular'), { color: color[latest ? 'text/brand' : 'text/secondary'] }]}>
                  {c.months[cy.start.getMonth()]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
          {spread === 0
            ? c.same
            : c.varied(spread, d(spread))}
        </Text>
      </View>

      {data.symptoms.length ? (
        <>
          <SectionHeader title={c.symptoms} action={c.lastCycles(data.recent.length)} />
          <View style={[styles.card, { gap: 16 }]}>
            {data.symptoms.map((s) => (
              <View key={s.name} style={{ gap: 8 }} accessible accessibilityLabel={`${symptom[s.name] ?? s.name}, ${s.days} ${d(s.days)}`}>
                <View style={styles.symptomHead}>
                  <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>{symptom[s.name] ?? s.name}</Text>
                  <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{s.days} {d(s.days)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(100 * s.days) / (maxSymptom + 1)}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </>
      ) : null}

      <Banner message={c.banner} />
    </>
  );
}

function Waiting({ logged }: { logged: number }) {
  const c = useCopy(COPY);
  return (
    <>
      <View style={[styles.card, styles.waiting]}>
        <IconBadge icon="chart" size={64} />
        <Text style={[type('Headline', 'SemiBold'), styles.center, { color: color['text/primary'] }]}>{c.need(MIN_CYCLES)}</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.keepLogging}</Text>
      </View>
      <View style={[styles.card, { gap: 16 }]} accessible accessibilityLabel={c.progressLabel(logged, MIN_CYCLES)}>
        <View style={styles.symptomHead}>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{c.cyclesLogged}</Text>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/brand'] }]}>{c.progress(logged, MIN_CYCLES)}</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(100 * logged) / MIN_CYCLES}%`, backgroundColor: color['surface/brand'] }]} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 12 },
  tiles: { flexDirection: 'row', gap: 12 },
  card: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 8 },
  barCol: { alignItems: 'center', gap: 8 },
  bar: { width: 28, borderRadius: radius.md },
  symptomHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 8, borderRadius: 999, backgroundColor: color['surface/muted'], overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999, backgroundColor: color['surface/brand-soft'] },
  waiting: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 12 },
  center: { textAlign: 'center' },
});
