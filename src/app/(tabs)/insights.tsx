import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner, Banner, IconBadge, PremiumInsights, SectionHeader, StatTile, TopBar, useTabBarSpace } from '../../components';
import { pastCycles } from '../../state/history';
import { insights, MIN_CYCLES, type Insights as Data } from '../../state/insights';
import { useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, radius, type } from '../../theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BAR_MAX = 140;

// E1 Insights once two cycles are complete, E2 before that.
export default function Insights() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { periods, days } = useLog();
  const { periodLength, name } = useOnboarding();
  const [today] = useState(() => new Date());
  const cycles = pastCycles(periods, periodLength);
  const data = insights(cycles, days, today);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title="Insights" userName={name ?? undefined} onAvatar={() => router.navigate('/me')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        {data ? <Filled data={data} /> : <Waiting logged={cycles.length} />}
        {data ? <PremiumInsights cycles={cycles} days={days} /> : null}
        <AdBanner />
      </ScrollView>
    </View>
  );
}

function Filled({ data }: { data: Data }) {
  const d = (n: number) => (n === 1 ? 'day' : 'days');
  const spread = data.recent.length ? Math.max(...data.recent.map((c) => c.length)) - Math.min(...data.recent.map((c) => c.length)) : 0;
  // Bars share a floor a few days under the shortest cycle so day-level differences stay visible;
  // each bar carries its value, so the cut baseline doesn't hide the numbers.
  const lengths = data.recent.map((c) => c.length);
  const floor = Math.min(...lengths) - 5;
  const top = Math.max(...lengths);
  const maxSymptom = data.symptoms[0]?.days ?? 0;

  return (
    <>
      <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
        Based on {data.count} logged {data.count === 1 ? 'cycle' : 'cycles'}
      </Text>
      <View style={styles.tiles}>
        <StatTile label="Average cycle" value={String(data.avgCycle)} unit={d(data.avgCycle)} icon="calendar" />
        <StatTile label="Average period" value={String(data.avgPeriod)} unit={d(data.avgPeriod)} icon="drop" />
      </View>
      <View style={styles.tiles}>
        <StatTile label="Cycle range" value={data.min === data.max ? String(data.min) : `${data.min}–${data.max}`} unit="days" icon="arrows-lr" />
        <StatTile label="Logged cycles" value={String(data.count)} unit={data.count === 1 ? 'cycle' : 'cycles'} icon="history" />
      </View>

      <SectionHeader title="Cycle length" action={`Last ${data.recent.length}`} />
      <View style={styles.card}>
        <View style={styles.chart} accessibilityRole="image" accessibilityLabel={`Cycle lengths: ${data.recent.map((c) => `${MONTHS[c.start.getMonth()]} ${c.length} days`).join(', ')}`}>
          {data.recent.map((c, i) => {
            const latest = i === data.recent.length - 1;
            const h = top === floor ? BAR_MAX : Math.max(24, (BAR_MAX * (c.length - floor)) / (top - floor));
            return (
              <View key={c.period.start} style={styles.barCol}>
                <Text style={[type('Body/Small', 'SemiBold'), { color: color[latest ? 'text/brand' : 'text/secondary'] }]}>{c.length}</Text>
                <View style={[styles.bar, { height: h, backgroundColor: color[latest ? 'surface/brand' : 'surface/strong'] }]} />
                <Text style={[type('Body/Small', latest ? 'SemiBold' : 'Regular'), { color: color[latest ? 'text/brand' : 'text/secondary'] }]}>
                  {MONTHS[c.start.getMonth()]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
          {spread === 0
            ? 'Your cycle length stayed the same over this period.'
            : `Your cycle length varied by ${spread} ${d(spread)} over this period.`}
        </Text>
      </View>

      {data.symptoms.length ? (
        <>
          <SectionHeader title="Most logged symptoms" action={`Last ${data.recent.length} cycles`} />
          <View style={[styles.card, { gap: 16 }]}>
            {data.symptoms.map((s) => (
              <View key={s.name} style={{ gap: 8 }} accessible accessibilityLabel={`${s.name}, ${s.days} ${d(s.days)}`}>
                <View style={styles.symptomHead}>
                  <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>{s.name}</Text>
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

      <Banner message="Insights are estimates from your own logs, not medical advice." />
    </>
  );
}

function Waiting({ logged }: { logged: number }) {
  return (
    <>
      <View style={[styles.card, styles.waiting]}>
        <IconBadge icon="chart" size={64} />
        <Text style={[type('Headline', 'SemiBold'), styles.center, { color: color['text/primary'] }]}>Insights need {MIN_CYCLES} cycles</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>
          Keep logging. After two full cycles you’ll see averages and patterns here.
        </Text>
      </View>
      <View style={[styles.card, { gap: 16 }]} accessible accessibilityLabel={`Cycles logged: ${logged} of ${MIN_CYCLES}`}>
        <View style={styles.symptomHead}>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>Cycles logged</Text>
          <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/brand'] }]}>{logged} of {MIN_CYCLES}</Text>
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
