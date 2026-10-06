import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatLong, weekdayInitial } from '../lib/dates';
import type { StripDay } from '../state/cycle';
import { color, overline, radius, type } from '../theme';
import type { IconName } from '../theme/icons';
import { DayCell } from './Cycle';
import { Skeleton } from './Display';
import { Icon } from './Icon';

// Pieces of B1–B4 Home. Cards share radius 24 and a hairline border.

export function WeekStrip({ days, onDay }: { days: StripDay[]; onDay?: (d: Date) => void }) {
  return (
    <View style={[styles.card, styles.strip]}>
      {days.map(({ date, state }) => (
        <View key={date.toDateString()} style={styles.stripDay}>
          <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{weekdayInitial(date)}</Text>
          <DayCell
            day={date.getDate()}
            state={state}
            onPress={onDay ? () => onDay(date) : undefined}
            accessibilityLabel={`${formatLong(date)}${state === 'Period' ? ', period' : state === 'Predicted' ? ', predicted period' : ''}`}
          />
        </View>
      ))}
    </View>
  );
}

export function NextPeriodCard({ title, subtitle, onCalendar }: { title: string; subtitle: string; onCalendar?: () => void }) {
  return (
    <View style={styles.next} accessible accessibilityLabel={`Next period. ${title}. ${subtitle}`}>
      <View style={{ flex: 1 }}>
        <Text style={[overline(13), { color: color['text/softest'] }]}>Next period</Text>
        <Text style={[type('Title/Medium', 'Bold'), { color: color['text/on-brand'] }]}>{title}</Text>
        <Text style={[type('Body/Medium'), { color: color['text/softest'] }]}>{subtitle}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Open calendar" onPress={onCalendar} style={styles.calendar}>
        <Icon name="calendar" color="text/brand" />
      </Pressable>
    </View>
  );
}

export type LogItem = { label: string; value: string | null; icon: IconName };

export function TodayLogCard({ items, onEdit }: { items: LogItem[]; onEdit?: () => void }) {
  return (
    <View style={[styles.card, styles.log]}>
      <View style={styles.logHead}>
        <Text accessibilityRole="header" style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>Today’s log</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit today’s log" onPress={onEdit} hitSlop={12}>
          <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.logItems}>
        {items.map((it) => (
          <View key={it.label} style={styles.logItem} accessible accessibilityLabel={`${it.label}: ${it.value ?? 'not logged'}`}>
            <View style={styles.logBadge}>
              <Icon name={it.icon} size={16} color="text/brand" />
            </View>
            <Text style={[type('Body/Default'), { color: color['text/secondary'] }]}>{it.label}</Text>
            <Text style={[type('Body/Large', 'SemiBold'), { color: color[it.value ? 'text/primary' : 'text/tertiary'] }]}>{it.value ?? '–'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** B3: mirrors ring, strip, next-period and log cards so nothing jumps when data arrives. */
export function HomeSkeleton() {
  return (
    <View style={styles.skeleton} accessibilityLabel="Loading">
      <Skeleton shape="Circle" width={220} height={220} />
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
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: radius.xl, backgroundColor: color['surface/brand'],
  },
  calendar: { width: 48, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/default'] },
  log: { padding: 16, gap: 12 },
  logHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logItems: { flexDirection: 'row' },
  logItem: { flex: 1, alignItems: 'center', gap: 2 },
  logBadge: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'], marginBottom: 2 },
  skeleton: { alignItems: 'center', gap: 16 },
  skeletonBlocks: { alignSelf: 'stretch', gap: 12 },
});
