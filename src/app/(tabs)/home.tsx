import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button, CycleRing, EmptyState, HomeSkeleton, NextPeriodCard, TodayLogCard, TopBar, WeekStrip, useTabBarSpace,
} from '../../components';
import { diffDays, formatLong, formatMonthDay, formatShort, toISODate } from '../../lib/dates';
import { cycleStatus, useCycleSettings, weekStrip } from '../../state/cycle';
import { useLog } from '../../state/log';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, type } from '../../theme';

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`);

// B1 Home (in cycle), B2 empty, B3 loading, B4 late. Designed to fit 844 without scrolling;
// the ScrollView only matters on shorter phones or with large text.
export default function Home() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const profile = useOnboarding();
  const settings = useCycleSettings();
  const { days: logs } = useLog();
  const today = new Date();
  const status = cycleStatus(settings, today);
  const todayLog = logs[toISODate(today)];
  const openLog = () => router.push('/log/period');

  let body;
  if (!profile.hydrated) {
    body = <HomeSkeleton />;
  } else if (status.kind === 'empty') {
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing phase="Empty" progress={0} size={220} label="No cycle data yet" day="–" />
        </View>
        <EmptyState
          icon="drop-plus"
          title="Log your last period"
          body="One date is enough. Nilemy estimates your next one from there."
          action="Log period"
          onAction={openLog}
        />
      </>
    );
  } else if (status.kind === 'late') {
    const late = status.daysLate;
    body = (
      <>
        <Text style={[type('Body/Medium'), styles.date]}>{formatLong(today)}</Text>
        <View style={[styles.ring, styles.lateRing]}>
          <CycleRing
            phase="Late"
            progress={1}
            label={late === 0 ? 'Period expected today' : 'Period expected'}
            day={`Day ${status.cycleDay}`}
            note={late === 0 ? undefined : `${days(late)} past estimate`}
          />
        </View>
        {/* Plain reassurance, not a banner: a late period shouldn't feel like an alert. */}
        {late > 0 ? (
          <Text style={[type('Body/Medium'), styles.lateNote]}>
            Cycles often shift by a few days. Stress, travel and sleep can all play a part. Log it whenever it starts.
          </Text>
        ) : null}
        <Button label="Log period" type="Secondary" iconLeft="drop-plus" fullWidth onPress={openLog} />
      </>
    );
  } else {
    const s = status;
    const untilLatest = s.daysUntilNext + diffDays(s.nextStart, s.latestStart);
    const next = !s.irregular
      ? { title: s.daysUntilNext === 1 ? 'Tomorrow' : `In ${days(s.daysUntilNext)}`, subtitle: `Around ${formatShort(s.nextStart)} · estimate` }
      : s.daysUntilNext <= 0
        ? { title: 'Any day now', subtitle: `Expected by ${formatShort(s.latestStart)} · estimate` }
        : { title: `In ${s.daysUntilNext}–${days(untilLatest)}`, subtitle: `${formatMonthDay(s.nextStart)} – ${formatMonthDay(s.latestStart)} · estimate` };
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing
            phase={s.phase}
            progress={s.progress}
            size={220}
            label={s.phase === 'Neutral' ? 'Irregular cycle' : undefined}
            day={`Day ${s.cycleDay}`}
          />
        </View>
        <WeekStrip days={weekStrip(settings, today)} />
        <NextPeriodCard title={next.title} subtitle={next.subtitle} onCalendar={() => router.navigate('/history')} />
        <TodayLogCard
          onEdit={() => router.push('/log/daily')}
          items={[
            { label: 'Flow', value: todayLog?.flow ?? null, icon: 'drop-fill' },
            { label: 'Pain', value: todayLog?.pain ?? null, icon: 'bandage' },
            { label: 'Mood', value: todayLog?.mood ?? null, icon: 'meh' },
          ]}
        />
      </>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={profile.name ? `Hi, ${profile.name}` : 'Hi there'} userName={profile.name ?? undefined} onAvatar={() => router.navigate('/me')} />
      <ScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottom }]}>
        {body}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 12 },
  ring: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  date: { marginTop: 8, color: color['text/secondary'] },
  lateNote: { textAlign: 'center', color: color['text/secondary'], paddingHorizontal: 8 },
  lateRing: { marginTop: 12, marginBottom: 12 },
});
