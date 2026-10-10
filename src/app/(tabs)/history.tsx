import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBanner, Divider, EmptyState, Icon, IconBadge, MonthCalendar, SectionHeader, TopBar, useTabBarSpace } from '../../components';
import { defineCopy, useCopy, useWeekStart } from '../../i18n';
import { addMonths, formatLong, formatMonthDay, startOfMonth, toISODate } from '../../lib/dates';
import { useCycleSettings } from '../../state/cycle';
import { cycleOf, daySummary, dayState, pastCycles, periodLength } from '../../state/history';
import { useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, radius, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'History',
    emptyTitle: 'No cycles yet',
    emptyBody: 'Your past cycles appear here after you log a period.',
    logPeriod: 'Log period',
    cycleDay: (n: number, inPeriod: boolean) => `Cycle day ${n}${inPeriod ? ' · Period' : ''}`,
    pastCycles: 'Past cycles',
    seeInsights: 'See insights',
    cycleLabel: (from: string, to: string, length: number, periodDays: number) => `${from} to ${to}, ${length} days, ${periodDays}-day period`,
    periodDays: (n: number) => `${n}-day period`,
    length: (n: number) => `${n} days`,
    noFullTitle: 'No full cycles yet',
    noFullBody: 'A cycle appears here once your next period starts.',
  },
  tr: {
    title: 'Geçmiş',
    emptyTitle: 'Henüz döngü yok',
    emptyBody: 'Bir adet kaydettiğinde geçmiş döngülerin burada görünür.',
    logPeriod: 'Adet kaydet',
    cycleDay: (n: number, inPeriod: boolean) => `Döngünün ${n}. günü${inPeriod ? ' · Adet' : ''}`,
    pastCycles: 'Geçmiş döngüler',
    seeInsights: 'Analize git',
    cycleLabel: (from: string, to: string, length: number, periodDays: number) => `${from} – ${to}, ${length} gün, ${periodDays} günlük adet`,
    periodDays: (n: number) => `${n} günlük adet`,
    length: (n: number) => `${n} gün`,
    noFullTitle: 'Henüz tamamlanan döngü yok',
    noFullBody: 'Bir sonraki adetin başladığında döngü burada görünür.',
  },
});

// D1 History, D4 when nothing is logged yet.
export default function History() {
  const c = useCopy(COPY);
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { periods, days } = useLog();
  const { periodLength: usual, showPredicted, name } = useOnboarding();
  const weekStartsOn = useWeekStart();
  const { cycleLength } = useCycleSettings();
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(today);

  const calendar = { periods, days, cycleLength, periodLength: usual, showPredicted };
  const cycles = pastCycles(periods, usual);
  const owner = cycleOf(selected, periods);
  const inPeriod = owner ? owner.cycleDay <= periodLength(owner.period, usual) : false;
  const selectedKey = toISODate(selected);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={c.title} userName={name ?? undefined} onAvatar={() => router.navigate('/me')} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]} showsVerticalScrollIndicator={false}>
        <MonthCalendar
          month={month}
          today={today}
          selected={periods.length ? selected : null}
          stateOf={(d) => dayState(d, calendar, today)}
          onSelect={setSelected}
          onPrev={() => setMonth((m) => addMonths(m, -1))}
          onNext={() => setMonth((m) => addMonths(m, 1))}
          legend={periods.length > 0}
          weekStartsOn={weekStartsOn}
        />

        {periods.length === 0 ? (
          <EmptyState icon="history" title={c.emptyTitle} body={c.emptyBody} action={c.logPeriod} onAction={() => router.push('/log/period')} />
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${formatLong(selected)}. ${daySummary(days[selectedKey])}`}
              onPress={() => router.push(days[selectedKey] ? `/day/${selectedKey}` : `/log/daily?date=${selectedKey}`)}
              style={({ pressed }) => [styles.dayCard, pressed && { backgroundColor: color['surface/strong'] }]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{formatLong(selected)}</Text>
                {owner ? (
                  <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>
                    {c.cycleDay(owner.cycleDay, inPeriod)}
                  </Text>
                ) : null}
                <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{daySummary(days[selectedKey])}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="text/secondary" />
            </Pressable>

            <SectionHeader title={c.pastCycles} action={c.seeInsights} onAction={() => router.navigate('/insights')} />
            {cycles.length ? (
              <View style={styles.list}>
                {cycles.map((cycle, i) => (
                  <View key={cycle.period.start}>
                    {i > 0 ? <Divider inset={0} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={c.cycleLabel(formatMonthDay(cycle.start), formatMonthDay(cycle.end), cycle.length, cycle.periodDays)}
                      onPress={() => router.push(`/cycle/${cycle.period.start}`)}
                      style={({ pressed }) => [styles.row, pressed && { backgroundColor: color['surface/subtle'] }]}
                    >
                      <IconBadge icon="calendar" />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>
                          {formatMonthDay(cycle.start)} – {formatMonthDay(cycle.end)}
                        </Text>
                        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.periodDays(cycle.periodDays)}</Text>
                      </View>
                      <Text style={[type('Body/Large', 'Medium'), { color: color['text/brand'] }]}>{c.length(cycle.length)}</Text>
                      <Icon name="chevron-right" size={20} color="text/secondary" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="history" title={c.noFullTitle} body={c.noFullBody} />
            )}
          </>
        )}
        <AdBanner />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 16 },
  dayCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, borderRadius: radius.xl, backgroundColor: color['surface/muted'] },
  list: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16 },
});
