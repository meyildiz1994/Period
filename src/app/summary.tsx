import * as Sharing from 'expo-sharing';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Checkbox, Choice, IconBadge, Page, PremiumOnly } from '../components';
import { defineCopy, useCopy } from '../i18n';
import { useCommon } from '../i18n/common';
import { writeSummary } from '../lib/summary';
import { pastCycles } from '../state/history';
import { latestPeriod, useLog } from '../state/log';
import { useOnboarding } from '../state/onboarding';
import { clearExports } from '../state/persist';
import { color, radius, type } from '../theme';

const RANGES = [3, 6, 12, 0] as const;

const COPY = defineCopy({
  en: {
    title: 'Cycle summary',
    intro: 'A PDF of what you logged, to keep or show your doctor. It lists your entries as they are, without any interpretation.',
    range: 'Cycles',
    last: (n: number) => `Last ${n}`,
    all: 'All',
    notes: 'Include my notes',
    make: 'Create PDF',
    failed: 'The PDF couldn’t be created. Please try again.',
    notEncrypted: 'The PDF isn’t encrypted. Share it only with people you trust.',
    premium: 'Cycle summary is part of Premium.',
    seePremium: 'See Premium',
  },
  tr: {
    title: 'Döngü özeti',
    intro: 'Kaydettiklerinin bir PDF’i; saklamak ya da doktoruna göstermek için. Kayıtlarını olduğu gibi listeler, hiçbir yorum eklemez.',
    range: 'Döngüler',
    last: (n: number) => `Son ${n}`,
    all: 'Tümü',
    notes: 'Notlarımı da ekle',
    make: 'PDF oluştur',
    failed: 'PDF oluşturulamadı. Lütfen tekrar dene.',
    notEncrypted: 'PDF şifreli değil. Yalnızca güvendiğin kişilerle paylaş.',
    premium: 'Döngü özeti Premium’a dahil.',
    seePremium: 'Premium’a göz at',
  },
});

// Premium: Cycle summary PDF (lib/summary.ts). The file is removed from the cache on leaving.
export default function Summary() {
  const c = useCopy(COPY);
  const common = useCommon();
  const log = useLog();
  const { periodLength, name } = useOnboarding();
  const [range, setRange] = useState<(typeof RANGES)[number]>(6);
  const [notes, setNotes] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => () => {
    try {
      clearExports();
    } catch {}
  }, []);

  const all = pastCycles(log.periods, periodLength);
  const cycles = range ? all.slice(0, range) : all;

  const make = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const file = await writeSummary({ cycles, days: log.days, current: latestPeriod(log), name, notes });
      await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: file.name });
    } catch {
      setFailed(true);
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
        footer={<Button label={failed ? common.tryAgain : c.make} iconLeft="file-text" fullWidth loading={busy} disabled={busy} onPress={make} />}
      >
        <View style={styles.hero}>
          <IconBadge icon="file-text" size={56} />
          <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>{c.intro}</Text>
        </View>
        {failed ? <Banner kind="Error" message={c.failed} /> : null}
        <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{c.range}</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {RANGES.map((r) => (
            <Choice key={r} label={r ? c.last(r) : c.all} selected={range === r} onPress={() => setRange(r)} />
          ))}
        </View>
        <View style={styles.card}>
          <Checkbox checked={notes} label={c.notes} onChange={setNotes} />
          <Text style={[type('Body/Large', 'Medium'), { flex: 1, color: color['text/primary'] }]} onPress={() => setNotes(!notes)}>{c.notes}</Text>
        </View>
        <Banner message={c.notEncrypted} />
      </Page>
    </PremiumOnly>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 12, paddingTop: 8 },
  center: { textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
});
