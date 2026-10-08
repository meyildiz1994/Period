import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, CycleRing, Dialog, Divider, EmptyState, Page, Tag } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { addDays, formatMonthDay } from '../../lib/dates';
import { flowBreakdown, pastCycles } from '../../state/history';
import { deletePeriod, useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Cycle details',
    notFound: 'Cycle not found',
    notFoundBody: 'This cycle may have been edited or deleted.',
    cycleLength: 'Cycle length',
    period: 'Period',
    periodLength: 'Period length',
    flow: 'Flow',
    editDates: 'Edit dates',
    deleteCycle: 'Delete cycle',
    cycle: (n: number) => `Cycle ${n}`,
    daysCaption: 'days',
    periodLegend: (days: string) => `Period (${days})`,
    rest: 'Rest of cycle',
    breakdown: 'Breakdown',
    matched: (count: number, avg: string) => `This cycle matched your ${count}-cycle average of ${avg}.`,
    compared: (diff: string, longer: boolean, count: number, avg: string) =>
      `This cycle was ${diff} ${longer ? 'longer' : 'shorter'} than your ${count}-cycle average of ${avg}.`,
    confirmTitle: 'Delete this cycle?',
    confirmBody: 'The period that starts this cycle is removed and estimates are recalculated. Daily logs stay.',
  },
  tr: {
    title: 'Döngü ayrıntıları',
    notFound: 'Döngü bulunamadı',
    notFoundBody: 'Bu döngü düzenlenmiş ya da silinmiş olabilir.',
    cycleLength: 'Döngü süresi',
    period: 'Adet',
    periodLength: 'Adet süresi',
    flow: 'Akış',
    editDates: 'Tarihleri düzenle',
    deleteCycle: 'Döngüyü sil',
    cycle: (n: number) => `${n}. döngü`,
    daysCaption: 'gün',
    periodLegend: (days: string) => `Adet (${days})`,
    rest: 'Döngünün geri kalanı',
    breakdown: 'Ayrıntılar',
    matched: (count: number, avg: string) => `Bu döngü, son ${count} döngünün ${avg} olan ortalamasıyla aynı.`,
    compared: (diff: string, longer: boolean, count: number, avg: string) =>
      `Bu döngü, son ${count} döngünün ${avg} olan ortalamasından ${diff} ${longer ? 'daha uzun' : 'daha kısa'} sürdü.`,
    confirmTitle: 'Bu döngü silinsin mi?',
    confirmBody: 'Bu döngüyü başlatan adet kaydı silinir ve tahminler yeniden hesaplanır. Günlük kayıtların kalır.',
  },
});

// D3 Cycle details for the completed cycle that began with the period starting on `start`.
export default function CycleDetails() {
  const t = useCopy(COPY);
  const { days } = useCommon();
  const { start } = useLocalSearchParams<{ start: string }>();
  const { periods, days: logs } = useLog();
  const { periodLength: usual } = useOnboarding();
  const [confirm, setConfirm] = useState(false);
  const cycles = pastCycles(periods, usual);
  const c = cycles.find((x) => x.period.start === start);

  if (!c) {
    return (
      <Page title={t.title} onBack={router.back}>
        <EmptyState icon="calendar" title={t.notFound} body={t.notFoundBody} />
      </Page>
    );
  }

  const average = Math.round(cycles.reduce((sum, x) => sum + x.length, 0) / cycles.length);
  const diff = c.length - average;
  const flow = flowBreakdown(c.period, logs, usual);
  const periodEnd = addDays(c.start, c.periodDays - 1);
  const rows: [string, string][] = [
    [t.cycleLength, days(c.length)],
    [t.period, `${formatMonthDay(c.start)} – ${formatMonthDay(periodEnd)}`],
    [t.periodLength, days(c.periodDays)],
    ...(flow ? [[t.flow, flow] as [string, string]] : []),
  ];

  return (
    <Page
      title={t.title}
      onBack={router.back}
      footer={
        <>
          <Button label={t.editDates} type="Outline" iconLeft="calendar-edit" fullWidth onPress={() => router.push(`/log/period?start=${c.period.start}`)} />
          <Button label={t.deleteCycle} type="GhostDanger" iconLeft="trash" fullWidth onPress={() => setConfirm(true)} />
        </>
      }
    >
      <View style={[styles.card, styles.summary]}>
        <Tag label={t.cycle(c.number)} icon="calendar" />
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
          {formatMonthDay(c.start)} – {formatMonthDay(c.end)}, {c.end.getFullYear()}
        </Text>
        <CycleRing phase="Menstrual" progress={c.periodDays / c.length} size={200} knob={false} icon={false} label="" day={String(c.length)} caption={t.daysCaption} dayRole="Display" />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color['surface/brand'] }]} />
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{t.periodLegend(days(c.periodDays))}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color['surface/strong'] }]} />
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{t.rest}</Text>
          </View>
        </View>
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{t.breakdown}</Text>
      <View style={styles.card}>
        {rows.map(([label, value], i) => (
          <View key={label}>
            {i > 0 ? <Divider inset={0} /> : null}
            <View style={styles.row}>
              <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{label}</Text>
              <Text style={[type('Body/Medium', 'SemiBold'), styles.value]}>{value}</Text>
            </View>
          </View>
        ))}
      </View>

      {cycles.length > 1 ? (
        <Banner
          message={
            diff === 0
              ? t.matched(cycles.length, days(average))
              : t.compared(days(Math.abs(diff)), diff > 0, cycles.length, days(average))
          }
        />
      ) : null}

      <Dialog
        visible={confirm}
        destructive
        title={t.confirmTitle}
        body={t.confirmBody}
        confirmLabel={t.deleteCycle}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          deletePeriod(c.period.start);
          router.back();
        }}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], paddingHorizontal: 20 },
  summary: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  legend: { flexDirection: 'row', gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 999 },
  section: { marginTop: 8, color: color['text/primary'] },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, paddingVertical: 16 },
  value: { flexShrink: 1, textAlign: 'right', color: color['text/primary'] },
});
