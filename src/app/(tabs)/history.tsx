import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Divider, EmptyState, Icon, IconBadge, MonthCalendar, SectionHeader, TopBar, useTabBarSpace } from '../../components';
import { addMonths, formatLong, formatMonthDay, startOfMonth, toISODate } from '../../lib/dates';
import { cycleOf, daySummary, dayState, pastCycles, periodLength } from '../../state/history';
import { useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, radius, type } from '../../theme';

// D1 History, D4 when nothing is logged yet.
export default function History() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const { periods, days } = useLog();
  const { cycleLength, periodLength: usual, showPredicted, name } = useOnboarding();
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
      <TopBar kind="Root" title="History" userName={name ?? undefined} onAvatar={() => router.navigate('/me')} />
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
        />

        {periods.length === 0 ? (
          <EmptyState icon="history" title="No cycles yet" body="Your past cycles appear here after you log a period." action="Log period" onAction={() => router.push('/log/period')} />
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
                    Cycle day {owner.cycleDay}{inPeriod ? ' · Period' : ''}
                  </Text>
                ) : null}
                <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{daySummary(days[selectedKey])}</Text>
              </View>
              <Icon name="chevron-right" size={20} color="text/secondary" />
            </Pressable>

            <SectionHeader title="Past cycles" action="See insights" onAction={() => router.navigate('/insights')} />
            {cycles.length ? (
              <View style={styles.list}>
                {cycles.map((c, i) => (
                  <View key={c.period.start}>
                    {i > 0 ? <Divider inset={0} /> : null}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${formatMonthDay(c.start)} to ${formatMonthDay(c.end)}, ${c.length} days, ${c.periodDays}-day period`}
                      onPress={() => router.push(`/cycle/${c.period.start}`)}
                      style={({ pressed }) => [styles.row, pressed && { backgroundColor: color['surface/subtle'] }]}
                    >
                      <IconBadge icon="calendar" />
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={[type('Body/Large', 'Medium'), { color: color['text/primary'] }]}>
                          {formatMonthDay(c.start)} – {formatMonthDay(c.end)}
                        </Text>
                        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.periodDays}-day period</Text>
                      </View>
                      <Text style={[type('Body/Large', 'Medium'), { color: color['text/brand'] }]}>{c.length} days</Text>
                      <Icon name="chevron-right" size={20} color="text/secondary" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState icon="history" title="No full cycles yet" body="A cycle appears here once your next period starts." />
            )}
          </>
        )}
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
