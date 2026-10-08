import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, CYCLE_RANGE, Divider, LengthRow, ListRow, Page, PERIOD_RANGE } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { pastCycles } from '../../state/history';
import { insights } from '../../state/insights';
import { getLog } from '../../state/log';
import { getOnboarding, setOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Cycle settings',
    intro: 'Used for estimates until you’ve logged enough cycles. After that, your own history takes over.',
    save: 'Save changes',
    cycleLength: 'Cycle length',
    average: (n: number) => `Your average: ${n} days`,
    cycleUsual: 'Most cycles are 21–35 days',
    periodLength: 'Period length',
    periodUsual: 'Usually 3–7 days',
    calendar: 'Calendar',
    showPredicted: 'Show predicted days',
    showPredictedHint: 'Dashed outline on the calendar',
    weekStart: 'Week starts on',
    sunday: 'Sunday',
    monday: 'Monday',
    note: 'Changing these doesn’t edit periods you’ve already logged.',
  },
  tr: {
    title: 'Döngü ayarları',
    intro: 'Yeterince döngü kaydedene kadar tahminlerde bunlar kullanılır. Sonrasında kendi geçmişin devreye girer.',
    save: 'Değişiklikleri kaydet',
    cycleLength: 'Döngü süresi',
    average: (n: number) => `Ortalaman: ${n} gün`,
    cycleUsual: 'Çoğu döngü 21–35 gün sürer',
    periodLength: 'Adet süresi',
    periodUsual: 'Genellikle 3–7 gün',
    calendar: 'Takvim',
    showPredicted: 'Tahmini günleri göster',
    showPredictedHint: 'Takvimde kesikli çerçeve',
    weekStart: 'Hafta başlangıcı',
    sunday: 'Pazar',
    monday: 'Pazartesi',
    note: 'Bunları değiştirmek daha önce kaydettiğin adetleri değiştirmez.',
  },
});

// G2 Cycle settings. Edits a draft; Save changes applies it.
export default function CycleSettings() {
  const c = useCopy(COPY);
  const [draft, setDraft] = useState(() => {
    const s = getOnboarding();
    return { cycleLength: s.cycleLength, periodLength: s.periodLength, showPredicted: s.showPredicted, weekStartsOn: s.weekStartsOn };
  });
  const [avg] = useState(() => {
    const { periods, days } = getLog();
    return insights(pastCycles(periods, draft.periodLength), days, new Date());
  });
  const patch = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }));

  return (
    <Page
      title={c.title}
      onBack={router.back}
      intro={c.intro}
      footer={
        <Button
          label={c.save}
          fullWidth
          onPress={() => {
            setOnboarding(draft);
            router.back();
          }}
        />
      }
    >
      <View style={styles.card}>
        <LengthRow
          title={c.cycleLength}
          subtitle={avg ? c.average(avg.avgCycle) : c.cycleUsual}
          value={draft.cycleLength}
          {...CYCLE_RANGE}
          onChange={(v) => patch({ cycleLength: v })}
        />
        <View style={styles.divider} />
        <LengthRow
          title={c.periodLength}
          subtitle={avg ? c.average(avg.avgPeriod) : c.periodUsual}
          value={draft.periodLength}
          {...PERIOD_RANGE}
          onChange={(v) => patch({ periodLength: v })}
        />
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.calendar}</Text>
      <View style={[styles.card, { overflow: 'hidden' }]}>
        <ListRow
          title={c.showPredicted}
          subtitle={c.showPredictedHint}
          icon="calendar"
          trailing="Toggle"
          toggled={draft.showPredicted}
          onToggle={(v) => patch({ showPredicted: v })}
        />
        <Divider inset={0} />
        <ListRow
          title={c.weekStart}
          icon="calendar-grid"
          trailing="Value"
          value={draft.weekStartsOn === 0 ? c.sunday : c.monday}
          onPress={() => patch({ weekStartsOn: draft.weekStartsOn === 0 ? 1 : 0 })}
        />
      </View>

      <Banner message={c.note} />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: color['surface/divider'] },
  section: { marginTop: 8, color: color['text/primary'] },
});
