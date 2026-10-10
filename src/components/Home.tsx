import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { defineCopy, useCopy } from '../i18n';
import { formatLong, weekdayInitial } from '../lib/dates';
import type { Fertile, StripDay } from '../state/cycle';
import { color, overline, radius, type } from '../theme';
import type { IconName } from '../theme/icons';
import { DayCell, phaseTone, type Phase } from './Cycle';
import { Skeleton } from './Display';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: {
    period: ', period',
    predicted: ', predicted period',
    fertile: ', fertile day, estimate',
    nextPeriod: 'Next period',
    nextLabel: (title: string, subtitle: string) => `Next period. ${title}. ${subtitle}`,
    openCalendar: 'Open calendar',
    todayLog: 'Today’s log',
    editLabel: 'Edit today’s log',
    edit: 'Edit',
    itemLabel: (label: string, value: string | null) => `${label}: ${value ?? 'not logged'}`,
    loading: 'Loading',
    today: 'Today',
    nothingYet: 'Nothing logged yet',
    log: 'Log today',
    fertileBadge: 'Fertile',
    peakBadge: 'Most fertile',
    estimate: ', estimate',
  },
  tr: {
    period: ', adet',
    predicted: ', tahmini adet',
    fertile: ', doğurgan gün, tahmini',
    nextPeriod: 'Sonraki adet',
    nextLabel: (title: string, subtitle: string) => `Sonraki adet. ${title}. ${subtitle}`,
    openCalendar: 'Takvimi aç',
    todayLog: 'Bugünün kaydı',
    editLabel: 'Bugünün kaydını düzenle',
    edit: 'Düzenle',
    itemLabel: (label: string, value: string | null) => `${label}: ${value ?? 'kaydedilmedi'}`,
    loading: 'Yükleniyor',
    today: 'Bugün',
    nothingYet: 'Henüz kayıt yok',
    log: 'Bugünü kaydet',
    fertileBadge: 'Doğurgan',
    peakBadge: 'En doğurgan',
    estimate: ', tahmini',
  },
});

// Pieces of B1–B4 Home. Cards share radius 24 and a hairline border.


export function WeekStrip({ days, onDay }: { days: StripDay[]; onDay?: (d: Date) => void }) {
  const c = useCopy(COPY);
  return (
    <View style={[styles.card, styles.strip]}>
      {days.map(({ date, state, fertile }) => (
        <View key={date.toDateString()} style={styles.stripDay}>
          <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{weekdayInitial(date)}</Text>
          <DayCell
            day={date.getDate()}
            state={state}
            fertile={fertile}
            onPress={onDay ? () => onDay(date) : undefined}
            accessibilityLabel={`${formatLong(date)}${state === 'Period' ? c.period : state === 'Predicted' ? c.predicted : ''}${fertile ? c.fertile : ''}`}
          />
        </View>
      ))}
    </View>
  );
}

export function NextPeriodCard({ title, subtitle, onCalendar }: { title: string; subtitle: string; onCalendar?: () => void }) {
  const c = useCopy(COPY);
  return (
    <View style={styles.next} accessible accessibilityLabel={c.nextLabel(title, subtitle)}>
      <View style={{ flex: 1 }}>
        <Text style={[overline(13), { color: color['text/softest'] }]}>{c.nextPeriod}</Text>
        <Text style={[type('Title/Medium', 'Bold'), { color: color['text/on-brand'] }]}>{title}</Text>
        <Text style={[type('Body/Medium'), { color: color['text/softest'] }]}>{subtitle}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={c.openCalendar} onPress={onCalendar} style={styles.calendar}>
        <Icon name="calendar" color="text/brand" />
      </Pressable>
    </View>
  );
}

export type LogItem = { label: string; value: string | null; icon: IconName };

export function TodayLogCard({ items, onEdit }: { items: LogItem[]; onEdit?: () => void }) {
  const c = useCopy(COPY);
  return (
    <View style={[styles.card, styles.log]}>
      <View style={styles.logHead}>
        <Text accessibilityRole="header" style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{c.todayLog}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={c.editLabel} onPress={onEdit} hitSlop={12}>
          <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>{c.edit}</Text>
        </Pressable>
      </View>
      <View style={styles.logItems}>
        {items.map((it) => (
          <View key={it.label} style={styles.logItem} accessible accessibilityLabel={c.itemLabel(it.label, it.value)}>
            <View style={styles.logBadge}>
              <Icon name={it.icon} size={16} color="text/brand" />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={[type('Caption'), { color: color['text/secondary'] }]}>{it.label}</Text>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[type('Body/Default', 'SemiBold'), { color: color[it.value ? 'text/primary' : 'text/tertiary'] }]}>{it.value ?? '–'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Today's log in one row: what was logged as small pills, or a prompt to log. */
export function TodayRow({ values, onPress }: { values: string[]; onPress: () => void }) {
  const c = useCopy(COPY);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={values.length ? `${c.today}: ${values.join(', ')}. ${c.edit}` : c.log}
      onPress={onPress}
      style={({ pressed }) => [styles.card, styles.today, pressed && { backgroundColor: color['surface/subtle'] }]}
    >
      <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>{c.today}</Text>
      <View style={styles.todayValues}>
        {values.length ? (
          values.slice(0, 3).map((v) => (
            <View key={v} style={styles.todayPill}>
              <Text numberOfLines={1} style={[type('Caption', 'Medium'), { color: color['text/brand'] }]}>{v}</Text>
            </View>
          ))
        ) : (
          <Text numberOfLines={1} style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.nothingYet}</Text>
        )}
      </View>
      <View style={styles.todayAdd}>
        <Icon name={values.length ? 'pencil' : 'plus'} size={18} color="text/on-brand" />
      </View>
    </Pressable>
  );
}

/** Daily tip under the Home ring: phase name and a short wellbeing idea. */
export function TipCard({ heading, text }: { heading: string; text: string }) {
  return (
    <View style={styles.tip} accessible accessibilityLabel={`${heading}. ${text}`}>
      <View style={styles.tipBadge}>
        <Icon name="leaf" size={18} color="text/brand" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type('Caption', 'SemiBold'), { color: color['text/brand'] }]}>{heading}</Text>
        <Text numberOfLines={2} style={[type('Body/Small'), { color: color['text/primary'] }]}>{text}</Text>
      </View>
    </View>
  );
}

/**
 * A little smiling flower beside the ring (in the empty top-right corner, never over it) while
 * today is in the estimated fertile window. Pops in, then sways gently; still with Reduce Motion.
 */
/** `phase` is the ring's phase today; the flower takes the ring's colours. */
export function FertileBadge({ fertile, phase }: { fertile: Exclude<Fertile, null>; phase: Phase }) {
  const c = useCopy(COPY);
  const [pop] = useState(() => new Animated.Value(0));
  const [sway] = useState(() => new Animated.Value(0));
  useEffect(() => {
    let live = true;
    let loop: Animated.CompositeAnimation | null = null;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!live) return;
      if (reduce) return pop.setValue(1);
      loop = Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 2800, useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]));
      Animated.spring(pop, { toValue: 1, friction: 4, tension: 90, useNativeDriver: true }).start(() => live && loop?.start());
    });
    return () => { live = false; loop?.stop(); };
  }, [pop, sway]);
  const label = fertile === 'ovulation' ? c.peakBadge : c.fertileBadge;
  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const rotate = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-7deg', '7deg'] });
  const lift = sway.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, -2, 0] });
  return (
    <View style={styles.buddy} accessible accessibilityLabel={`${label}${c.estimate}`}>
      <Animated.View style={{ opacity: pop, transform: [{ translateY: lift }, { scale }, { rotate }] }}>
        <FlowerBuddy size={48} sparkles={fertile === 'ovulation' ? 2 : 1} phase={phase} />
      </Animated.View>
      <Animated.Text numberOfLines={2} style={[type('Caption', 'SemiBold'), styles.buddyText, { color: color[phaseTone(phase).ink], opacity: pop }]}>{label}</Animated.Text>
    </View>
  );
}

/** Six lilac petals around a white face with dot eyes, rosy cheeks and a small smile. */
function FlowerBuddy({ size, sparkles, phase }: { size: number; sparkles: 1 | 2; phase: Phase }) {
  const tone = phaseTone(phase);
  const ink = color[tone.ink];
  const petals = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    return { x: 30 + 15 * Math.cos(a), y: 31 + 15 * Math.sin(a) };
  });
  const star = (x: number, y: number, r: number) =>
    `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      {/* Outline layer first, fill on top: one soft outer edge instead of overlapping rings. */}
      {petals.map((p, i) => <Circle key={`o${i}`} cx={p.x} cy={p.y} r={10.5} fill={ink} stroke={ink} strokeWidth={3.2} />)}
      {petals.map((p, i) => <Circle key={`f${i}`} cx={p.x} cy={p.y} r={10.5} fill={color[tone.soft]} />)}
      <Circle cx={30} cy={31} r={13} fill={color['surface/default']} stroke={ink} strokeWidth={1.6} />
      <Circle cx={25.2} cy={29.5} r={1.9} fill={ink} />
      <Circle cx={34.8} cy={29.5} r={1.9} fill={ink} />
      <Circle cx={25.8} cy={28.9} r={0.6} fill={color['surface/default']} />
      <Circle cx={35.4} cy={28.9} r={0.6} fill={color['surface/default']} />
      <Ellipse cx={22} cy={34} rx={2.6} ry={1.6} fill={color['phase/luteal']} opacity={0.35} />
      <Ellipse cx={38} cy={34} rx={2.6} ry={1.6} fill={color['phase/luteal']} opacity={0.35} />
      <Path d="M27 34.2 Q30 37.2 33 34.2" stroke={ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Path d={star(53, 8, 4.5)} fill={color['phase/luteal']} />
      {sparkles === 2 ? <Path d={star(6, 50, 3.2)} fill={color['phase/luteal']} /> : null}
    </Svg>
  );
}

/** B3: mirrors ring, strip, next-period and log cards so nothing jumps when data arrives. */
export function HomeSkeleton() {
  const c = useCopy(COPY);
  return (
    <View style={styles.skeleton} accessibilityLabel={c.loading}>
      <Skeleton shape="Circle" width={184} height={184} />
      <View style={styles.skeletonBlocks}>
        <Skeleton shape="Block" width="100%" height={64} />
        <Skeleton shape="Block" width="100%" height={92} />
        <Skeleton shape="Block" width="100%" height={140} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: color['surface/default'], borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'] },
  strip: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 7 },
  stripDay: { flex: 1, alignItems: 'center', gap: 4 },
  next: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: radius.xl, backgroundColor: color['surface/brand'],
  },
  calendar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/default'] },
  log: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  today: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 18, paddingRight: 12 },
  todayValues: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, overflow: 'hidden' },
  todayPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: color['surface/muted'], flexShrink: 1 },
  todayAdd: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/brand'] },
  logHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Compact rows (badge beside label and value) so Home fits without scrolling.
  logItems: { flexDirection: 'row', gap: 8 },
  logItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  logBadge: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  // Fixed height (heading + two lines) so Home never shifts or scrolls as the tip changes.
  tip: { height: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: radius.xl, backgroundColor: color['surface/subtle'], borderWidth: 1, borderColor: color['border/subtle'] },
  // In the corner of the full-width ring row, outside the 232 pt ring, so it stays narrow.
  buddy: { position: 'absolute', top: -6, right: -6, width: 80, alignItems: 'center', gap: 2 },
  buddyText: { textAlign: 'center', lineHeight: 15 },
  tipBadge: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  skeleton: { alignItems: 'center', gap: 16 },
  skeletonBlocks: { alignSelf: 'stretch', gap: 12 },
});
