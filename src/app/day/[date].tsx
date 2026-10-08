import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Dialog, EmptyState, IconBadge, Page, Tag } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { formatMonthDayLong, formatTime, fromISODate } from '../../lib/dates';
import { cycleOf, periodLength } from '../../state/history';
import { deleteDay, useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, fontFamily, overline, radius, type, type IconName } from '../../theme';

const COPY = defineCopy({
  en: {
    editLog: 'Edit log',
    deleteDay: 'Delete this day',
    periodDay: (n: number) => `Period · Day ${n}`,
    cycleDay: (n: number) => `Cycle day ${n}`,
    logged: (time: string) => `Logged ${time}`,
    flow: 'Flow',
    pain: 'Pain',
    mood: 'Mood',
    symptoms: 'Symptoms',
    note: 'Note',
    emptyTitle: 'Nothing logged',
    emptyBody: 'There’s no log for this day.',
    logDay: 'Log this day',
    confirmTitle: 'Delete this day?',
    confirmBody: 'Flow, pain, mood, symptoms and the note for this day are removed. Your period dates stay.',
    delete: 'Delete',
    notLogged: 'not logged',
  },
  tr: {
    editLog: 'Kaydı düzenle',
    deleteDay: 'Bu günü sil',
    periodDay: (n: number) => `Adet · ${n}. gün`,
    cycleDay: (n: number) => `Döngünün ${n}. günü`,
    logged: (time: string) => `Kayıt ${time}`,
    flow: 'Akış',
    pain: 'Ağrı',
    mood: 'Ruh hali',
    symptoms: 'Belirtiler',
    note: 'Not',
    emptyTitle: 'Kayıt yok',
    emptyBody: 'Bu gün için kayıt yok.',
    logDay: 'Bu günü kaydet',
    confirmTitle: 'Bu gün silinsin mi?',
    confirmBody: 'Bu günün akış, ağrı, ruh hali, belirti ve not kayıtları silinir. Adet tarihlerin kalır.',
    delete: 'Sil',
    notLogged: 'kaydedilmedi',
  },
});

const MOOD_ICON: Record<string, IconName> = { Good: 'laugh', Okay: 'meh', Low: 'frown', Irritable: 'angry', Anxious: 'help' };

// D2 Day detail: what was logged on one day. Deleting asks first.
export default function DayDetail() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { date: key } = useLocalSearchParams<{ date: string }>();
  const date = fromISODate(key);
  const { periods, days } = useLog();
  const { periodLength: usual } = useOnboarding();
  const [confirm, setConfirm] = useState(false);
  const log = days[key];

  const owner = cycleOf(date, periods);
  const inPeriod = owner ? owner.cycleDay <= periodLength(owner.period, usual) : false;
  const symptoms = log?.symptoms.length ? `${common.symptom[log.symptoms[0]] ?? log.symptoms[0]}${log.symptoms.length > 1 ? ` +${log.symptoms.length - 1}` : ''}` : null;

  return (
    <Page
      title={formatMonthDayLong(date)}
      onBack={router.back}
      footer={
        log ? (
          <>
            <Button label={c.editLog} type="Secondary" iconLeft="pencil" fullWidth onPress={() => router.push(`/log/daily?date=${key}`)} />
            <Button label={c.deleteDay} type="GhostDanger" iconLeft="trash" fullWidth onPress={() => setConfirm(true)} />
          </>
        ) : null
      }
    >
      {log ? (
        <>
          <View style={styles.head}>
            {owner ? <Tag label={inPeriod ? c.periodDay(owner.cycleDay) : c.cycleDay(owner.cycleDay)} tone={inPeriod ? 'Strong' : 'Brand'} /> : <View />}
            <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.logged(formatTime(new Date(log.loggedAt)))}</Text>
          </View>
          <View style={styles.grid}>
            <Tile icon="drop-fill" label={c.flow} value={log.flow ? common.flow[log.flow] : null} />
            <Tile icon="bandage" label={c.pain} value={log.pain ? common.pain[log.pain] : null} />
            <Tile icon={log.mood ? MOOD_ICON[log.mood] : 'meh'} label={c.mood} value={log.mood ? common.mood[log.mood] : null} />
            <Tile icon="activity" label={c.symptoms} value={symptoms} />
          </View>
          {log.note ? (
            <View style={styles.note}>
              <Text style={[overline(12), { color: color['text/tertiary'] }]}>{c.note}</Text>
              <Text style={[type('Body/Large'), styles.quote]}>“{log.note}”</Text>
            </View>
          ) : null}
        </>
      ) : (
        <EmptyState icon="notes" title={c.emptyTitle} body={c.emptyBody} action={c.logDay} onAction={() => router.replace(`/log/daily?date=${key}`)} />
      )}

      <Dialog
        visible={confirm}
        destructive
        title={c.confirmTitle}
        body={c.confirmBody}
        confirmLabel={c.delete}
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
  const c = useCopy(COPY);
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value ?? c.notLogged}`}>
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
