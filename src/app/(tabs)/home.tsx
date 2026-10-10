import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AdBanner, Button, CycleRing, EmptyState, HomeSkeleton, NextPeriodCard, PeriodEndButton, TipCard, TodayLogCard, TopBar, WeekStrip, useTabBarSpace,
} from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { useTip } from '../../i18n/tips';
import { diffDays, formatLong, formatMonthDay, formatShort, toISODate } from '../../lib/dates';
import { cycleStatus, useCycleSettings, weekStrip } from '../../state/cycle';
import { latestPeriod, savePeriod, useLog } from '../../state/log';
import { flush } from '../../state/persist';
import { useOnboarding } from '../../state/onboarding';
import { color, layout, type } from '../../theme';

const COPY = defineCopy({
  en: {
    emptyTitle: 'Log your last period',
    emptyBody: 'One date is enough. Nilemy estimates your next one from there.',
    logPeriod: 'Log period',
    expectedToday: 'Period expected today',
    expected: 'Period expected',
    /** "3 days past estimate" */
    late: (days: string) => `${days} past estimate`,
    lateNote: 'Cycles often shift by a few days. Stress, travel and sleep can all play a part. Log it whenever it starts.',
    tomorrow: 'Tomorrow',
    inDays: (days: string) => `In ${days}`,
    around: (date: string) => `Around ${date} · estimate`,
    anyDay: 'Any day now',
    expectedBy: (date: string) => `Expected by ${date} · estimate`,
    /** "In 3–5 days" */
    inRange: (from: number, to: string) => `In ${from}–${to}`,
    range: (from: string, to: string) => `${from} – ${to} · estimate`,
    flow: 'Flow',
    pain: 'Pain',
    mood: 'Mood',
    hi: (name: string) => `Hi, ${name}`,
    hiThere: 'Hi there',
  },
  tr: {
    emptyTitle: 'Son adetini kaydet',
    emptyBody: 'Tek bir tarih yeterli. Nilemy bir sonrakini buradan tahmin eder.',
    logPeriod: 'Adet kaydet',
    expectedToday: 'Adetin bugün bekleniyor',
    expected: 'Adet bekleniyor',
    late: (days: string) => `Tahminden ${days} sonra`,
    lateNote: 'Döngüler sık sık birkaç gün kayabilir. Stres, seyahat ve uyku etkili olabilir. Başladığında kaydetmen yeterli.',
    tomorrow: 'Yarın',
    inDays: (days: string) => `${days} içinde`,
    around: (date: string) => `${date} civarı · tahmini`,
    anyDay: 'Her an başlayabilir',
    expectedBy: (date: string) => `En geç ${date} · tahmini`,
    inRange: (from: number, to: string) => `${from}–${to} içinde`,
    range: (from: string, to: string) => `${from} – ${to} · tahmini`,
    flow: 'Akış',
    pain: 'Ağrı',
    mood: 'Ruh hali',
    hi: (name: string) => `Merhaba ${name}`,
    hiThere: 'Merhaba',
  },
});

// B1 Home (in cycle), B2 empty, B3 loading, B4 late. Fits an 844 pt phone (with the status bar
// and home indicator) without scrolling: the ring is 184 and the tip card has a fixed height.
// The ScrollView only matters on shorter phones or with large text.
const RING = 184;
/** Days past the usual length that an unfinished period still offers "My period ended". */
const ONGOING_GRACE = 5;
export default function Home() {
  const c = useCopy(COPY);
  const common = useCommon();
  const { days } = common;
  const insets = useSafeAreaInsets();
  const bottom = useTabBarSpace();
  const profile = useOnboarding();
  const settings = useCycleSettings();
  const log = useLog();
  const { days: logs } = log;
  const today = new Date();
  const status = cycleStatus(settings, today);
  const todayLog = logs[toISODate(today)];
  const tip = useTip(status.kind === 'cycle' ? status.phase : 'Empty', today);
  const openLog = () => router.push('/log/period');
  const latest = latestPeriod(log);
  const ongoing = status.kind === 'cycle' && latest && !latest.end && status.cycleDay <= profile.periodLength + ONGOING_GRACE ? latest : null;
  const endPeriod = () => {
    if (!ongoing) return;
    savePeriod({ start: ongoing.start, end: toISODate(today) }, ongoing.start);
    flush().catch((e) => console.warn('Nilemy: saving failed', e));
    router.push({ pathname: '/log/ended', params: { start: ongoing.start } });
  };

  let body;
  if (!profile.hydrated) {
    body = <HomeSkeleton />;
  } else if (status.kind === 'empty') {
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing phase="Empty" progress={0} size={220} label={common.phase.Empty} day="–" />
        </View>
        <EmptyState
          icon="drop-plus"
          title={c.emptyTitle}
          body={c.emptyBody}
          action={c.logPeriod}
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
            label={late === 0 ? c.expectedToday : c.expected}
            day={common.day(status.cycleDay)}
            note={late === 0 ? undefined : c.late(days(late))}
          />
        </View>
        {/* Plain reassurance, not a banner: a late period shouldn't feel like an alert. */}
        {late > 0 ? (
          <Text style={[type('Body/Medium'), styles.lateNote]}>{c.lateNote}</Text>
        ) : null}
        <Button label={c.logPeriod} type="Secondary" iconLeft="drop-plus" fullWidth onPress={openLog} />
      </>
    );
  } else {
    const s = status;
    const untilLatest = s.daysUntilNext + diffDays(s.nextStart, s.latestStart);
    const next = !s.irregular
      ? { title: s.daysUntilNext === 1 ? c.tomorrow : c.inDays(days(s.daysUntilNext)), subtitle: c.around(formatShort(s.nextStart)) }
      : s.daysUntilNext <= 0
        ? { title: c.anyDay, subtitle: c.expectedBy(formatShort(s.latestStart)) }
        : { title: c.inRange(s.daysUntilNext, days(untilLatest)), subtitle: c.range(formatMonthDay(s.nextStart), formatMonthDay(s.latestStart)) };
    body = (
      <>
        <View style={styles.ring}>
          <CycleRing
            phase={s.phase}
            progress={s.progress}
            size={RING}
            label={s.phase === 'Neutral' ? common.phase.Neutral : undefined}
            day={common.day(s.cycleDay)}
          />
        </View>
        {ongoing ? <PeriodEndButton onEnd={endPeriod} /> : null}
        {tip ? <TipCard heading={tip.heading(common.phase[s.phase])} text={tip.text} /> : null}
        <WeekStrip days={weekStrip(settings, today)} />
        <NextPeriodCard title={next.title} subtitle={next.subtitle} onCalendar={() => router.navigate('/history')} />
        <TodayLogCard
          onEdit={() => router.push('/log/daily')}
          items={[
            // Logged values are stored in English; show them in the app language.
            { label: c.flow, value: todayLog?.flow ? common.flow[todayLog.flow] : null, icon: 'drop-fill' },
            { label: c.pain, value: todayLog?.pain ? common.pain[todayLog.pain] : null, icon: 'bandage' },
            { label: c.mood, value: todayLog?.mood ? common.mood[todayLog.mood] : null, icon: 'meh' },
          ]}
        />
      </>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TopBar kind="Root" title={profile.name ? c.hi(profile.name) : c.hiThere} userName={profile.name ?? undefined} onAvatar={() => router.navigate('/me')} />
      <ScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: bottom }]}>
        {body}
        <AdBanner />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { paddingHorizontal: layout.gutter, gap: 10 },
  ring: { alignItems: 'center', marginTop: 4, marginBottom: 4 },
  date: { marginTop: 8, color: color['text/secondary'] },
  lateNote: { textAlign: 'center', color: color['text/secondary'], paddingHorizontal: 8 },
  lateRing: { marginTop: 12, marginBottom: 12 },
});
