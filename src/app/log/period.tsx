import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, DateWheel, FLOW_LEVELS, FlowLevel, Icon, Page, Tag, Toast, type FlowLevelName } from '../../components';
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
    ended: 'Ended',
    ongoing: 'Still going',
    notYet: 'It hasn’t ended yet',
    endError: (date: string) => `End date can’t be before the start date (${date}).`,
    expectedEnd: (date: string) => `Expected to end around ${date} (estimate). Mark it ended from Home, or here.`,
    flowToday: 'Flow today',
  },
  tr: {
    title: 'Adet kaydet',
    intro: 'Kanamanın ne zaman başladığını ve bittiğinde ne zaman bittiğini kaydet.',
    savePeriod: 'Adeti kaydet',
    saveFailed: 'Kaydedilemedi. Girdiklerin bu ekranda duruyor.',
    retry: 'Tekrar dene',
    started: 'Başladı',
    ended: 'Bitti',
    ongoing: 'Devam ediyor',
    notYet: 'Henüz bitmedi',
    endError: (date: string) => `Bitiş tarihi başlangıç tarihinden (${date}) önce olamaz.`,
    expectedEnd: (date: string) => `Tahmini bitiş: ${date} civarı. Bittiğinde ana sayfadan ya da buradan işaretleyebilirsin.`,
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
  // One date wheel open at a time: the start date for a new period, none when editing one.
  const [picking, setPicking] = useState<'start' | 'end' | null>(() => (editing ? null : 'start'));
  // A period always has some flow, so one level is picked (Medium until the user changes it).
  const [flow, setFlow] = useState<FlowLevelName>(() => {
    const saved = getLog().days[todayKey]?.flow;
    return saved && saved !== 'None' ? saved : 'Medium';
  });
  const [failed, setFailed] = useState(false);

  const endError = ended && diffDays(start, end) < 0;
  // Today's flow only belongs to a period that covers today.
  const coversToday = diffDays(start, today) >= 0 && (!ended || diffDays(today, end) >= 0);

  const save = async () => {
    try {
      savePeriod({ start: toISODate(start), end: ended ? toISODate(end) : null }, editing?.start);
      if (coversToday) updateDay(todayKey, { flow });
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
        <DateRow label={c.started} value={formatShort(start)} open={picking === 'start'} onPress={() => setPicking(picking === 'start' ? null : 'start')} />
        {picking === 'start' ? <DateWheel rows={3} value={start} onChange={setStart} max={today} /> : null}
        <View style={styles.divider} />
        <DateRow
          label={c.ended}
          value={ended ? formatShort(end) : null}
          placeholder={c.ongoing}
          error={endError}
          open={picking === 'end'}
          onPress={() => {
            setEnded(true);
            setPicking(picking === 'end' ? null : 'end');
          }}
        />
        {endError ? (
          <View style={styles.error} accessibilityRole="alert">
            <Icon name="alert-circle" size={16} color="feedback/danger" />
            <Text style={[type('Body/Small'), styles.flex, { color: color['feedback/danger'] }]}>{c.endError(formatMonthDay(start))}</Text>
          </View>
        ) : null}
        {picking === 'end' ? (
          <>
            <DateWheel rows={3} value={end} onChange={setEnd} max={today} />
            <Pressable accessibilityRole="button" onPress={() => { setEnded(false); setPicking(null); }} hitSlop={8} style={styles.notYet}>
              <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>{c.notYet}</Text>
            </Pressable>
          </>
        ) : null}
        {!ended ? (
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.expectedEnd(formatShort(addDays(start, periodLength - 1)))}</Text>
        ) : null}
      </View>

      {coversToday ? (
        <>
          <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>{c.flowToday}</Text>
          <View style={styles.flows} accessibilityRole="radiogroup">
            {FLOW_LEVELS.map((f) => (
              <FlowLevel key={f.level} level={f.level} selected={flow === f.level} onPress={() => setFlow(f.level)} />
            ))}
          </View>
        </>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: 1, backgroundColor: color['surface/divider'] },
  error: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notYet: { alignSelf: 'center', paddingVertical: 4 },
  section: { marginTop: 8, color: color['text/primary'] },
  flows: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});

/** "Started  7 Oct Wed ›": a label and the date (or a placeholder) that opens a wheel. */
function DateRow({ label, value, placeholder, error, open, onPress }: {
  label: string; value: string | null; placeholder?: string; error?: boolean; open: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value ?? placeholder}`} accessibilityState={{ expanded: open }} onPress={onPress} style={styles.row}>
      <Text style={[type('Body/Large', 'SemiBold'), styles.flex, { color: color['text/primary'] }]}>{label}</Text>
      {value ? <Tag label={value} tone={error ? 'Danger' : 'Brand'} /> : <Text style={[type('Body/Medium'), { color: color['text/tertiary'] }]}>{placeholder}</Text>}
      <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="text/tertiary" />
    </Pressable>
  );
}
