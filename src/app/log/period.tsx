import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, DateWheel, FLOW_LEVELS, FlowLevel, Icon, Page, Tag, Toast, Toggle, type FlowLevelName } from '../../components';
import { addDays, diffDays, formatShort, fromISODate, toISODate } from '../../lib/dates';
import { getLog, latestPeriod, savePeriod, updateDay } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, radius, type } from '../../theme';

// C2 Log period. Edits the current period while it is still open (no end yet, same cycle);
// otherwise starts a new one today.
export default function LogPeriod() {
  const { cycleLength, periodLength } = useOnboarding();
  const [today] = useState(() => new Date());
  const [editing] = useState(() => {
    const latest = latestPeriod(getLog());
    return latest && !latest.end && diffDays(fromISODate(latest.start), today) < cycleLength ? latest : null;
  });
  const todayKey = toISODate(today);

  const [start, setStart] = useState(() => (editing ? fromISODate(editing.start) : today));
  const [ended, setEnded] = useState(false);
  const [end, setEnd] = useState(today);
  const [pickingEnd, setPickingEnd] = useState(false);
  const [flow, setFlow] = useState<FlowLevelName | null>(() => getLog().days[todayKey]?.flow ?? null);
  const [failed, setFailed] = useState(false);

  const endError = ended && diffDays(start, end) < 0;
  const minYear = today.getFullYear() - 2;

  const save = () => {
    try {
      savePeriod({ start: toISODate(start), end: ended ? toISODate(end) : null }, editing?.start);
      if (flow) updateDay(todayKey, { flow });
      router.back();
    } catch {
      setFailed(true);
    }
  };

  return (
    <Page
      title="Log period"
      onBack={router.back}
      intro="Record when bleeding started and, once it’s over, when it ended."
      footer={<Button label="Save period" iconLeft="check" fullWidth disabled={endError} onPress={save} />}
      overlay={failed ? <Toast kind="Error" message="Couldn’t save. Your entries are kept on this screen." action="Retry" onAction={() => { setFailed(false); save(); }} /> : null}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[type('Body/Large', 'SemiBold'), styles.flex, { color: color['text/primary'] }]}>Started</Text>
          <Tag label={formatShort(start)} />
        </View>
        <DateWheel rows={3} value={start} onChange={setStart} max={today} minYear={minYear} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>Has it ended?</Text>
            <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>
              {ended ? 'Pick the last day of bleeding' : 'Leave off while your period is ongoing'}
            </Text>
          </View>
          <Toggle value={ended} onChange={setEnded} label="Has it ended?" />
        </View>
        {ended ? (
          <View style={styles.endBlock}>
            <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>Ended</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ended ${formatShort(end)}. Change date`}
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
                  End date can’t be before the start date ({formatShort(start).slice(5)}).
                </Text>
              </View>
            ) : null}
            {pickingEnd ? <DateWheel rows={3} value={end} onChange={setEnd} max={today} minYear={minYear} /> : null}
          </View>
        ) : (
          <View style={styles.well}>
            <Icon name="info" size={16} color="text/secondary" />
            <Text style={[type('Body/Small'), styles.flex, { color: color['text/secondary'] }]}>
              Expected to end around {formatShort(addDays(start, periodLength - 1))} (estimate)
            </Text>
          </View>
        )}
      </View>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Flow today</Text>
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
  flows: { flexDirection: 'row', justifyContent: 'space-between' },
});
