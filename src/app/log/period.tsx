import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, DateWheel, FLOW_LEVELS, FlowLevel, Icon, Page, Tag, Toast, Toggle, type FlowLevelName } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { addDays, diffDays, formatMonthDay, formatShort, fromISODate, toISODate } from '../../lib/dates';
import { getLog, latestPeriod, savePeriod, updateDay } from '../../state/log';
import { flush } from '../../state/persist';
import { useOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Log period',
    intro: 'Record when bleeding started and, once it’s over, when it ended.',
    savePeriod: 'Save period',
    saveFailed: 'Couldn’t save. Your entries are kept on this screen.',
    retry: 'Retry',
    started: 'Started',
    hasEnded: 'Has it ended?',
    pickLast: 'Pick the last day of bleeding',
    leaveOff: 'Leave off while your period is ongoing',
    ended: 'Ended',
    endedLabel: (date: string) => `Ended ${date}. Change date`,
    endError: (date: string) => `End date can’t be before the start date (${date}).`,
    expectedEnd: (date: string) => `Expected to end around ${date} (estimate)`,
    flowToday: 'Flow today',
  },
  tr: {
    title: 'Adet kaydet',
    intro: 'Kanamanın ne zaman başladığını ve bittiğinde ne zaman bittiğini kaydet.',
    savePeriod: 'Adeti kaydet',
    saveFailed: 'Kaydedilemedi. Girdiklerin bu ekranda duruyor.',
    retry: 'Tekrar dene',
    started: 'Başladı',
    hasEnded: 'Bitti mi?',
    pickLast: 'Kanamanın son gününü seç',
    leaveOff: 'Adetin sürerken kapalı bırak',
    ended: 'Bitti',
    endedLabel: (date: string) => `Bitiş ${date}. Tarihi değiştir`,
    endError: (date: string) => `Bitiş tarihi başlangıç tarihinden (${date}) önce olamaz.`,
    expectedEnd: (date: string) => `Tahmini bitiş: ${date} civarı`,
    flowToday: 'Bugünkü akış',
  },
});

// C2 Log period. With `?start=` (D3 Edit dates) it edits that period; otherwise it edits the
// current period while it is still open (no end yet, same cycle) or starts a new one today.
export default function LogPeriod() {
  const c = useCopy(COPY);
  const params = useLocalSearchParams<{ start?: string }>();
  const { cycleLength, periodLength } = useOnboarding();
  const [today] = useState(() => new Date());
  const [editing] = useState(() => {
    const log = getLog();
    if (params.start) return log.periods.find((p) => p.start === params.start) ?? null;
    const latest = latestPeriod(log);
    return latest && !latest.end && diffDays(fromISODate(latest.start), today) < cycleLength ? latest : null;
  });
  const todayKey = toISODate(today);

  const [start, setStart] = useState(() => (editing ? fromISODate(editing.start) : today));
  const [ended, setEnded] = useState(() => !!editing?.end);
  const [end, setEnd] = useState(() => (editing?.end ? fromISODate(editing.end) : today));
  const [pickingEnd, setPickingEnd] = useState(false);
  const [flow, setFlow] = useState<FlowLevelName | null>(() => getLog().days[todayKey]?.flow ?? null);
  const [failed, setFailed] = useState(false);

  const endError = ended && diffDays(start, end) < 0;

  const save = async () => {
    try {
      savePeriod({ start: toISODate(start), end: ended ? toISODate(end) : null }, editing?.start);
      if (flow) updateDay(todayKey, { flow });
      await flush();
      router.back();
    } catch {
      setFailed(true);
    }
  };

  return (
    <Page
      title={c.title}
      onBack={router.back}
      intro={c.intro}
      footer={<Button label={c.savePeriod} iconLeft="check" fullWidth disabled={endError} onPress={save} />}
      overlay={failed ? <Toast kind="Error" message={c.saveFailed} action={c.retry} onAction={() => { setFailed(false); save(); }} /> : null}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[type('Body/Large', 'SemiBold'), styles.flex, { color: color['text/primary'] }]}>{c.started}</Text>
          <Tag label={formatShort(start)} />
        </View>
        <DateWheel rows={3} value={start} onChange={setStart} max={today} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{c.hasEnded}</Text>
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>
              {ended ? c.pickLast : c.leaveOff}
            </Text>
          </View>
          <Toggle value={ended} onChange={setEnded} label={c.hasEnded} />
        </View>
        {ended ? (
          <View style={styles.endBlock}>
            <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{c.ended}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={c.endedLabel(formatShort(end))}
              onPress={() => setPickingEnd((v) => !v)}
              style={[styles.field, endError ? styles.fieldError : null]}
            >
              <Icon name="calendar" size={20} color={endError ? 'feedback/danger' : 'text/brand'} />
              <Text style={[type('Body/Large'), { color: color['text/primary'] }]}>{formatShort(end)}</Text>
            </Pressable>
            {endError ? (
              <View style={styles.error} accessibilityRole="alert">
                <Icon name="alert-circle" size={16} color="feedback/danger" />
                <Text style={[type('Body/Small'), styles.flex, { color: color['feedback/danger'] }]}>
                  {c.endError(formatMonthDay(start))}
                </Text>
              </View>
            ) : null}
            {pickingEnd ? <DateWheel rows={3} value={end} onChange={setEnd} max={today} /> : null}
          </View>
        ) : (
          <View style={styles.well}>
            <Icon name="info" size={16} color="text/secondary" />
            <Text style={[type('Body/Small'), styles.flex, { color: color['text/secondary'] }]}>
              {c.expectedEnd(formatShort(addDays(start, periodLength - 1)))}
            </Text>
          </View>
        )}
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.flowToday}</Text>
      <View style={styles.flows} accessibilityRole="radiogroup">
        {FLOW_LEVELS.map((f) => (
          <FlowLevel key={f.level} level={f.level} selected={flow === f.level} onPress={() => setFlow(flow === f.level ? null : f.level)} />
        ))}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: 1, backgroundColor: color['surface/divider'] },
  well: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.lg, backgroundColor: color['surface/subtle'] },
  endBlock: { gap: 8 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16,
    borderRadius: radius.lg, borderWidth: 1, borderColor: color['border/subtle'],
  },
  fieldError: { borderWidth: 2, borderColor: color['feedback/danger'] },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  section: { marginTop: 8, color: color['text/primary'] },
  flows: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
