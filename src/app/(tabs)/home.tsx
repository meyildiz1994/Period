import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Banner, Button, CycleRing, EmptyState, HomeSkeleton, NextPeriodCard, TodayLogCard, TopBar, WeekStrip, useTabBarSpace,
} from '../../components';
import { formatLong, formatShort } from '../../lib/dates';
import { cycleStatus, weekStrip } from '../../state/cycle';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, type } from '../../theme';

const days = (n: number) => (n === 1 ? '1 day' : `${n} days`);

// B1 Home (in cycle), B2 empty, B3 loading, B4 late. Designed to fit 844 without scrolling;
// the ScrollView only matters on shorter phones or with large text.
export default function Home() {
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const settings = useOnboarding();
  const today = new Date();
  const status = cycleStatus(settings, today);
  // Daily logs arrive with C3 in step 5; until then Today's log shows dashes.
  // Log period / Edit / the + button open the Log screens built in step 5.
  const openLog = () => {};

  let body;
  if (!settings.hydrated) {
    body = <HomeSkeleton />;
  } else if (status.kind === 'empty') {
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing phase="Empty" progress={0} size={220} label="No cycle data yet" day="–" caption="Log your last period to begin" />
        </View>
        <EmptyState
          icon="drop-plus"
          title="Log your last period"
          body="One date is enough. Period estimates your next one from there."
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
            label="Period expected"
            day={late === 0 ? 'Today' : `${days(late)} late`}
            caption="Log it when it starts"
          />
        </View>
        {late > 0 ? (
          <Banner message={`Your period is ${days(late)} later than estimated. Cycles often vary by a few days. Stress, travel and sleep can shift them.`} />
        ) : null}
        <Button label="Log period" type="Secondary" iconLeft="drop-plus" fullWidth onPress={openLog} />
      </>
    );
  } else {
    const s = status;
    const next = s.daysUntilNext === 1 ? 'Tomorrow' : `In ${days(s.daysUntilNext)}`;
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing
            phase={s.phase}
            progress={s.progress}
            size={220}
            label={s.periodDay ? 'Period' : 'Today'}
            day={`Day ${s.cycleDay}`}
            caption={s.periodDay ? `Period day ${s.periodDay} of ${settings.periodLength}` : `Next period ${s.daysUntilNext === 1 ? 'tomorrow' : `in ${days(s.daysUntilNext)}`}`}
          />
        </View>
        <WeekStrip days={weekStrip(settings, today)} />
        <NextPeriodCard title={next} subtitle={`Around ${formatShort(s.nextStart)} · estimate`} onCalendar={() => router.navigate('/history')} />
        <TodayLogCard
          onEdit={openLog}
          items={[
            { label: 'Flow', value: null, icon: 'drop-fill' },
            { label: 'Pain', value: null, icon: 'bandage' },
            { label: 'Mood', value: null, icon: 'meh' },
          ]}
        />
      </>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={settings.name ? `Hi, ${settings.name}` : 'Hi there'} userName={settings.name ?? undefined} onAvatar={() => router.navigate('/me')} />
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
  lateRing: { marginTop: 12, marginBottom: 12 },
});
