import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Dialog, EmptyState, IconBadge, Page, Tag } from '../../components';
import { formatMonthDayLong, formatTime, fromISODate } from '../../lib/dates';
import { cycleOf, periodLength } from '../../state/history';
import { deleteDay, useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, fontFamily, overline, radius, type, type IconName } from '../../theme';

const MOOD_ICON: Record<string, IconName> = { Good: 'laugh', Okay: 'meh', Low: 'frown', Irritable: 'angry', Anxious: 'help' };

// D2 Day detail: what was logged on one day. Deleting asks first.
export default function DayDetail() {
  const { date: key } = useLocalSearchParams<{ date: string }>();
  const date = fromISODate(key);
  const { periods, days } = useLog();
  const { periodLength: usual } = useOnboarding();
  const [confirm, setConfirm] = useState(false);
  const log = days[key];

  const owner = cycleOf(date, periods);
  const inPeriod = owner ? owner.cycleDay <= periodLength(owner.period, usual) : false;
  const symptoms = log?.symptoms.length ? `${log.symptoms[0]}${log.symptoms.length > 1 ? ` +${log.symptoms.length - 1}` : ''}` : null;

  return (
    <Page
      title={formatMonthDayLong(date)}
      onBack={router.back}
      footer={
        log ? (
          <>
            <Button label="Edit log" type="Secondary" iconLeft="pencil" fullWidth onPress={() => router.push(`/log/daily?date=${key}`)} />
            <Button label="Delete this day" type="GhostDanger" iconLeft="trash" fullWidth onPress={() => setConfirm(true)} />
          </>
        ) : null
      }
    >
      {log ? (
        <>
          <View style={styles.head}>
            {owner ? <Tag label={inPeriod ? `Period · Day ${owner.cycleDay}` : `Cycle day ${owner.cycleDay}`} tone={inPeriod ? 'Strong' : 'Brand'} /> : <View />}
            <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>Logged {formatTime(new Date(log.loggedAt))}</Text>
          </View>
          <View style={styles.grid}>
            <Tile icon="drop-fill" label="Flow" value={log.flow} />
            <Tile icon="bandage" label="Pain" value={log.pain} />
            <Tile icon={log.mood ? MOOD_ICON[log.mood] : 'meh'} label="Mood" value={log.mood} />
            <Tile icon="activity" label="Symptoms" value={symptoms} />
          </View>
          {log.note ? (
            <View style={styles.note}>
              <Text style={[overline(12), { color: color['text/tertiary'] }]}>Note</Text>
              <Text style={[type('Body/Large'), styles.quote]}>“{log.note}”</Text>
            </View>
          ) : null}
        </>
      ) : (
        <EmptyState icon="notes" title="Nothing logged" body="There’s no log for this day." action="Log this day" onAction={() => router.replace(`/log/daily?date=${key}`)} />
      )}

      <Dialog
        visible={confirm}
        destructive
        title="Delete this day?"
        body="Flow, pain, mood, symptoms and the note for this day are removed. Your period dates stay."
        confirmLabel="Delete"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          deleteDay(key);
          router.back();
        }}
      />
    </Page>
  );
}

function Tile({ icon, label, value }: { icon: IconName; label: string; value: string | null }) {
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value ?? 'not logged'}`}>
      <IconBadge icon={icon} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[type('Body/Default'), { color: color['text/secondary'] }]}>{label}</Text>
        <Text numberOfLines={1} style={[type('Headline', 'SemiBold'), { color: color[value ? 'text/primary' : 'text/tertiary'] }]}>{value ?? '–'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    flexBasis: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 12,
    borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'],
  },
  note: { padding: 20, gap: 12, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  quote: { fontFamily: fontFamily.Italic, color: color['text/primary'] },
});
