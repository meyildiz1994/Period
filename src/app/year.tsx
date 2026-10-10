import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { Banner, Button, Choice, LogoMark, Page, PremiumOnly } from '../components';
import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { pastCycles, type PastCycle } from '../state/history';
import { useLog, type DayLog } from '../state/log';
import { useOnboarding } from '../state/onboarding';
import { color, radius, type } from '../theme';

const COPY = defineCopy({
  en: {
    title: 'Year in review',
    heading: (y: number) => `Your ${y} cycle`,
    cycles: 'cycles',
    avgCycle: 'average cycle',
    avgPeriod: 'average period',
    logged: 'days logged',
    days: 'days',
    topSymptom: 'Most logged symptom',
    topMood: 'Most logged mood',
    share: 'Share image',
    note: 'The image shows cycle details. Share it only where you want to.',
    empty: 'No cycles logged in this year yet.',
    premium: 'Year in review is part of Premium.',
    seePremium: 'See Premium',
  },
  tr: {
    title: 'Yıllık özet',
    heading: (y: number) => `${y} döngün`,
    cycles: 'döngü',
    avgCycle: 'ortalama döngü',
    avgPeriod: 'ortalama adet',
    logged: 'gün kayıt',
    days: 'gün',
    topSymptom: 'En sık belirti',
    topMood: 'En sık ruh hali',
    share: 'Görseli paylaş',
    note: 'Görsel döngü bilgilerini içerir. Yalnızca istediğin yerde paylaş.',
    empty: 'Bu yıl henüz kaydedilmiş döngü yok.',
    premium: 'Yıllık özet Premium’a dahil.',
    seePremium: 'Premium’a göz at',
  },
});

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const top = (xs: string[]) => {
  const counts = new Map<string, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

function yearStats(year: number, cycles: PastCycle[], days: Record<string, DayLog>) {
  const inYear = cycles.filter((c) => c.start.getFullYear() === year);
  const logs = Object.entries(days).filter(([k]) => k.startsWith(`${year}-`)).map(([, l]) => l);
  return {
    cycles: inYear.length,
    avgCycle: avg(inYear.map((c) => c.length)),
    avgPeriod: avg(inYear.map((c) => c.periodDays)),
    logged: logs.length,
    symptom: top(logs.flatMap((l) => l.symptoms)),
    mood: top(logs.flatMap((l) => (l.mood ? [l.mood] : []))),
  };
}

// Premium: a shareable card with the year's numbers, captured as an image on the phone.
export default function Year() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { periods, days } = useLog();
  const { periodLength } = useOnboarding();
  const cycles = pastCycles(periods, periodLength);
  const years = [...new Set([new Date().getFullYear(), ...cycles.map((cy) => cy.start.getFullYear())])].sort((a, b) => b - a);
  const [year, setYear] = useState(years[0]);
  const [busy, setBusy] = useState(false);
  const card = useRef<View>(null);
  const s = yearStats(year, cycles, days);

  const share = async () => {
    setBusy(true);
    try {
      const uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile' });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
    } catch {
      // Cancelled or unavailable: nothing to show.
    } finally {
      setBusy(false);
    }
  };

  return (
    <PremiumOnly
      fallback={
        <Page title={c.title} onBack={router.back} footer={<Button label={c.seePremium} fullWidth onPress={() => router.replace('/premium')} />}>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.premium}</Text>
        </Page>
      }
    >
      <Page
        title={c.title}
        onBack={router.back}
        footer={<Button label={c.share} iconLeft="share" fullWidth loading={busy} disabled={busy || !s.cycles} onPress={share} />}
      >
        {years.length > 1 ? (
          <View style={styles.chips}>
            {years.map((y) => <Choice key={y} label={String(y)} selected={year === y} onPress={() => setYear(y)} />)}
          </View>
        ) : null}
        {s.cycles ? (
          <View ref={card} collapsable={false} style={styles.card}>
            <View style={styles.brand}>
              <View style={styles.mark}><LogoMark size={18} /></View>
              <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/on-brand'] }]}>Nilemy</Text>
            </View>
            <Text style={[type('Title/Medium', 'Bold'), { color: color['text/on-brand'] }]}>{c.heading(year)}</Text>
            <View style={styles.grid}>
              <Stat value={String(s.cycles)} label={c.cycles} />
              <Stat value={`${s.avgCycle} ${c.days}`} label={c.avgCycle} />
              <Stat value={`${s.avgPeriod} ${c.days}`} label={c.avgPeriod} />
              <Stat value={String(s.logged)} label={c.logged} />
            </View>
            {s.symptom ? <Line label={c.topSymptom} value={common.symptom[s.symptom] ?? s.symptom} /> : null}
            {s.mood ? <Line label={c.topMood} value={common.mood[s.mood as keyof typeof common.mood] ?? s.mood} /> : null}
          </View>
        ) : (
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.empty}</Text>
        )}
        <Banner message={c.note} />
      </Page>
    </PremiumOnly>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[type('Title/Small', 'Bold'), { color: color['text/on-brand'] }]}>{value}</Text>
      <Text style={[type('Body/Small'), { color: color['text/soft'] }]}>{label}</Text>
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text style={[type('Body/Small'), { color: color['text/soft'] }]}>{label}</Text>
      <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/on-brand'] }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { padding: 24, gap: 20, borderRadius: radius['2xl'], backgroundColor: color['surface/brand'] },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 28, height: 28, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/default'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  stat: { width: '50%', gap: 2 },
  line: { gap: 2, paddingTop: 12, borderTopWidth: 1, borderTopColor: color['surface/brand-soft'] },
});
