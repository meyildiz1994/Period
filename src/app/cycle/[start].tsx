import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, CycleRing, Dialog, Divider, EmptyState, Page, Tag } from '../../components';
import { addDays, formatMonthDay } from '../../lib/dates';
import { flowBreakdown, pastCycles } from '../../state/history';
import { deletePeriod, useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`);

// D3 Cycle details for the completed cycle that began with the period starting on `start`.
export default function CycleDetails() {
  const { start } = useLocalSearchParams<{ start: string }>();
  const { periods, days: logs } = useLog();
  const { periodLength: usual } = useOnboarding();
  const [confirm, setConfirm] = useState(false);
  const cycles = pastCycles(periods, usual);
  const c = cycles.find((x) => x.period.start === start);

  if (!c) {
    return (
      <Page title="Cycle details" onBack={router.back}>
        <EmptyState icon="calendar" title="Cycle not found" body="This cycle may have been edited or deleted." />
      </Page>
    );
  }

  const average = Math.round(cycles.reduce((sum, x) => sum + x.length, 0) / cycles.length);
  const diff = c.length - average;
  const flow = flowBreakdown(c.period, logs, usual);
  const periodEnd = addDays(c.start, c.periodDays - 1);
  const rows: [string, string][] = [
    ['Cycle length', days(c.length)],
    ['Period', `${formatMonthDay(c.start)} – ${formatMonthDay(periodEnd)}`],
    ['Period length', days(c.periodDays)],
    ...(flow ? [['Flow', flow] as [string, string]] : []),
  ];

  return (
    <Page
      title="Cycle details"
      onBack={router.back}
      footer={
        <>
          <Button label="Edit dates" type="Outline" iconLeft="calendar-edit" fullWidth onPress={() => router.push(`/log/period?start=${c.period.start}`)} />
          <Button label="Delete cycle" type="GhostDanger" iconLeft="trash" fullWidth onPress={() => setConfirm(true)} />
        </>
      }
    >
      <View style={[styles.card, styles.summary]}>
        <Tag label={`Cycle ${c.number}`} icon="calendar" />
        <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>
          {formatMonthDay(c.start)} – {formatMonthDay(c.end)}, {c.end.getFullYear()}
        </Text>
        <CycleRing phase="Menstrual" progress={c.periodDays / c.length} size={200} knob={false} day={String(c.length)} caption="days" dayRole="Display" />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color['surface/brand'] }]} />
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>Period ({days(c.periodDays)})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color['surface/strong'] }]} />
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>Rest of cycle</Text>
          </View>
        </View>
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Breakdown</Text>
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
              ? `This cycle matched your ${cycles.length}-cycle average of ${days(average)}.`
              : `This cycle was ${days(Math.abs(diff))} ${diff > 0 ? 'longer' : 'shorter'} than your ${cycles.length}-cycle average of ${days(average)}.`
          }
        />
      ) : null}

      <Dialog
        visible={confirm}
        destructive
        title="Delete this cycle?"
        body="The period that starts this cycle is removed and estimates are recalculated. Daily logs stay."
        confirmLabel="Delete cycle"
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
