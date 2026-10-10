import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import type { PastCycle } from '../state/history';
import type { DayLog } from '../state/log';
import { allTime, heatmap, patterns, type Level, type Metric, type Pattern } from '../state/patterns';
import { usePremium } from '../state/premium';
import { color, radius, type, type ColorToken } from '../theme';
import { Button } from './Button';
import { Choice } from './Controls';
import { IconBadge, SectionHeader, StatTile } from './Display';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: {
    lockedTitle: 'More with Premium',
    locked: [
      'All-time trends across every cycle you log',
      'When your symptoms usually show up',
      'A day-by-day map of mood, energy and pain',
      'A cycle summary PDF and your year in review',
    ],
    lockedAction: 'See Premium',
    allTime: 'All time',
    cycles: (n: number) => `${n} cycles`,
    avgCycle: 'Average cycle',
    avgPeriod: 'Average period',
    range: 'Shortest – longest',
    variation: 'Typical difference',
    days: 'days',
    variationValue: (n: number) => `± ${n}`,
    year: (y: number, n: number, cycle: number, period: number) => `${y} · ${n} ${n === 1 ? 'cycle' : 'cycles'} · cycle ${cycle} d · period ${period} d`,
    patterns: 'Your patterns',
    patternsEmpty: 'Patterns show up once a symptom is logged in three or more cycles.',
    during: (name: string, day: number) => `${name}: usually on day ${day} of your period`,
    before: (name: string, days: number) => `${name}: usually ${days === 1 ? '1 day' : `${days} days`} before your period`,
    seenIn: (n: number) => `Seen in ${n} cycles`,
    moodWord: (m: string) => `Feeling ${m.toLowerCase()}`,
    map: 'Cycle map',
    mapHint: 'Each row is a cycle, each square a day. Darker means a harder day.',
    metric: { mood: 'Mood', energy: 'Energy', pain: 'Pain' } as Record<Metric, string>,
    legendNone: 'Not logged',
    legendEasy: 'Easier',
    legendHard: 'Harder',
    summary: 'Cycle summary (PDF)',
    yearCard: 'Your year in review',
    notMedical: 'These are counts from your own logs, not a medical assessment.',
  },
  tr: {
    lockedTitle: 'Premium ile daha fazlası',
    locked: [
      'Kaydettiğin tüm döngülerin uzun dönem eğilimleri',
      'Belirtilerinin genelde ne zaman başladığı',
      'Ruh hali, enerji ve ağrının gün gün haritası',
      'Döngü özeti PDF’i ve yıllık özetin',
    ],
    lockedAction: 'Premium’a göz at',
    allTime: 'Tüm zamanlar',
    cycles: (n: number) => `${n} döngü`,
    avgCycle: 'Ortalama döngü',
    avgPeriod: 'Ortalama adet',
    range: 'En kısa – en uzun',
    variation: 'Olağan fark',
    days: 'gün',
    variationValue: (n: number) => `± ${n}`,
    year: (y: number, n: number, cycle: number, period: number) => `${y} · ${n} döngü · döngü ${cycle} gün · adet ${period} gün`,
    patterns: 'Örüntülerin',
    patternsEmpty: 'Bir belirti üç ya da daha fazla döngüde kaydedilince örüntüler burada görünür.',
    during: (name: string, day: number) => `${name}: genelde adetinin ${day}. gününde`,
    before: (name: string, days: number) => `${name}: genelde adetinden ${days} gün önce`,
    seenIn: (n: number) => `${n} döngüde görüldü`,
    moodWord: (m: string) => `${m} hissetmek`,
    map: 'Döngü haritası',
    mapHint: 'Her satır bir döngü, her kare bir gün. Koyu renk daha zor bir gün demek.',
    metric: { mood: 'Ruh hali', energy: 'Enerji', pain: 'Ağrı' },
    legendNone: 'Kayıt yok',
    legendEasy: 'Daha kolay',
    legendHard: 'Daha zor',
    summary: 'Döngü özeti (PDF)',
    yearCard: 'Yıllık özetin',
    notMedical: 'Bunlar kendi kayıtlarından yapılan sayımlardır, tıbbi bir değerlendirme değildir.',
  },
});

const SHADE: Record<Level, ColorToken> = { 0: 'surface/subtle', 1: 'surface/strong', 2: 'surface/accent', 3: 'surface/brand' };
const METRICS: Metric[] = ['mood', 'energy', 'pain'];
/** Rows shown in the cycle map. */
const MAP_ROWS = 12;

// Premium part of E1 Insights. Free users see one card listing what Premium adds.
export function PremiumInsights({ cycles, days }: { cycles: PastCycle[]; days: Record<string, DayLog> }) {
  const { premium } = usePremium();
  const c = useCopy(COPY);
  if (!premium) {
    return (
      <View style={[styles.card, styles.locked]}>
        <View style={styles.row}>
          <IconBadge icon="sparkles" />
          <Text style={[type('Body/Large', 'SemiBold'), { flex: 1, color: color['text/primary'] }]}>{c.lockedTitle}</Text>
        </View>
        {c.locked.map((line) => (
          <View key={line} style={styles.row}>
            <Icon name="check" size={18} color="text/brand" />
            <Text style={[type('Body/Medium'), { flex: 1, color: color['text/secondary'] }]}>{line}</Text>
          </View>
        ))}
        <Button label={c.lockedAction} type="Secondary" size="Small" onPress={() => router.push('/premium')} />
      </View>
    );
  }
  return (
    <>
      <AllTimeSection cycles={cycles} />
      <PatternsSection cycles={cycles} days={days} />
      <MapSection cycles={cycles} days={days} />
      <View style={{ gap: 8 }}>
        <Button label={c.summary} iconLeft="file-text" type="Secondary" fullWidth onPress={() => router.push('/summary')} />
        <Button label={c.yearCard} iconLeft="sparkles" type="Secondary" fullWidth onPress={() => router.push('/year')} />
      </View>
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.notMedical}</Text>
    </>
  );
}

function AllTimeSection({ cycles }: { cycles: PastCycle[] }) {
  const c = useCopy(COPY);
  const data = allTime(cycles);
  if (!data) return null;
  return (
    <>
      <SectionHeader title={c.allTime} action={c.cycles(data.count)} />
      <View style={styles.tiles}>
        <StatTile label={c.avgCycle} value={String(data.avgCycle)} unit={c.days} icon="calendar" />
        <StatTile label={c.avgPeriod} value={String(data.avgPeriod)} unit={c.days} icon="drop" />
      </View>
      <View style={styles.tiles}>
        <StatTile label={c.range} value={data.shortest === data.longest ? String(data.shortest) : `${data.shortest}–${data.longest}`} unit={c.days} icon="arrows-lr" />
        <StatTile label={c.variation} value={c.variationValue(data.variation)} unit={c.days} icon="waves" />
      </View>
      {data.years.length > 1 ? (
        <View style={[styles.card, { gap: 8 }]}>
          {data.years.map((y) => (
            <Text key={y.year} style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.year(y.year, y.count, y.avgCycle, y.avgPeriod)}</Text>
          ))}
        </View>
      ) : null}
    </>
  );
}

function PatternsSection({ cycles, days }: { cycles: PastCycle[]; days: Record<string, DayLog> }) {
  const c = useCopy(COPY);
  const common = useCommon();
  const found = patterns(cycles, days);
  const name = (p: Pattern) => {
    if (p.name.startsWith('mood:')) {
      const m = p.name.slice(5) as keyof typeof common.mood;
      return c.moodWord(common.mood[m] ?? m);
    }
    return common.symptom[p.name] ?? p.name;
  };
  return (
    <>
      <SectionHeader title={c.patterns} />
      <View style={[styles.card, { gap: 14 }]}>
        {found.length ? (
          found.slice(0, 6).map((p) => (
            <View key={p.name} style={{ gap: 2 }}>
              <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>
                {p.kind === 'during' ? c.during(name(p), p.day) : c.before(name(p), p.days)}
              </Text>
              <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.seenIn(p.cycles)}</Text>
            </View>
          ))
        ) : (
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.patternsEmpty}</Text>
        )}
      </View>
    </>
  );
}

function MapSection({ cycles, days }: { cycles: PastCycle[]; days: Record<string, DayLog> }) {
  const c = useCopy(COPY);
  const [metric, setMetric] = useState<Metric>('mood');
  const rows = heatmap(cycles.slice(0, MAP_ROWS), days, metric);
  const longest = Math.max(...rows.map((r) => r.cells.length));
  return (
    <>
      <SectionHeader title={c.map} />
      <View style={[styles.card, { gap: 12 }]}>
        <View style={styles.chips}>
          {METRICS.map((m) => <Choice key={m} label={c.metric[m]} selected={metric === m} onPress={() => setMetric(m)} />)}
        </View>
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.mapHint}</Text>
        <View style={{ gap: 3 }} accessibilityRole="image" accessibilityLabel={`${c.map}, ${c.metric[metric]}`}>
          {rows.map((r) => (
            <View key={r.cycle.period.start} style={styles.mapRow}>
              {r.cells.map((lv, i) => (
                <View
                  key={i}
                  style={[
                    styles.cell,
                    { width: `${100 / longest}%`, backgroundColor: color[SHADE[lv]] },
                    i < r.cycle.periodDays && styles.periodCell,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          {([[0, c.legendNone], [1, c.legendEasy], [3, c.legendHard]] as [Level, string][]).map(([lv, label]) => (
            <View key={lv} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: color[SHADE[lv]] }]} />
              <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  locked: { gap: 10, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tiles: { flexDirection: 'row', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mapRow: { flexDirection: 'row', height: 10 },
  cell: { height: 10, borderRightWidth: 1, borderColor: color['surface/default'] },
  periodCell: { borderBottomWidth: 2, borderBottomColor: color['surface/deep'] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
});
