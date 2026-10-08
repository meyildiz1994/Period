import { Pressable, StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { formatLong, weekdayInitial } from '../lib/dates';
import type { StripDay } from '../state/cycle';
import { color, overline, radius, type } from '../theme';
import type { IconName } from '../theme/icons';
import { DayCell } from './Cycle';
import { Skeleton } from './Display';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: {
    period: ', period',
    predicted: ', predicted period',
    nextPeriod: 'Next period',
    nextLabel: (title: string, subtitle: string) => `Next period. ${title}. ${subtitle}`,
    openCalendar: 'Open calendar',
    todayLog: 'Today’s log',
    editLabel: 'Edit today’s log',
    edit: 'Edit',
    itemLabel: (label: string, value: string | null) => `${label}: ${value ?? 'not logged'}`,
    loading: 'Loading',
  },
  tr: {
    period: ', adet',
    predicted: ', tahmini adet',
    nextPeriod: 'Sonraki adet',
    nextLabel: (title: string, subtitle: string) => `Sonraki adet. ${title}. ${subtitle}`,
    openCalendar: 'Takvimi aç',
    todayLog: 'Bugünün kaydı',
    editLabel: 'Bugünün kaydını düzenle',
    edit: 'Düzenle',
    itemLabel: (label: string, value: string | null) => `${label}: ${value ?? 'kaydedilmedi'}`,
    loading: 'Yükleniyor',
  },
});

// Pieces of B1–B4 Home. Cards share radius 24 and a hairline border.

export function WeekStrip({ days, onDay }: { days: StripDay[]; onDay?: (d: Date) => void }) {
  const c = useCopy(COPY);
  return (
    <View style={[styles.card, styles.strip]}>
      {days.map(({ date, state }) => (
        <View key={date.toDateString()} style={styles.stripDay}>
          <Text style={[type('Caption'), { color: color['text/tertiary'] }]}>{weekdayInitial(date)}</Text>
          <DayCell
            day={date.getDate()}
            state={state}
            onPress={onDay ? () => onDay(date) : undefined}
            accessibilityLabel={`${formatLong(date)}${state === 'Period' ? c.period : state === 'Predicted' ? c.predicted : ''}`}
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
            <Text style={[type('Body/Default'), { color: color['text/secondary'] }]}>{it.label}</Text>
            <Text style={[type('Body/Large', 'SemiBold'), { color: color[it.value ? 'text/primary' : 'text/tertiary'] }]}>{it.value ?? '–'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Daily tip above the Home ring: phase name and a short wellbeing idea. */
export function TipCard({ heading, text }: { heading: string; text: string }) {
  return (
    <View style={styles.tip} accessible accessibilityLabel={`${heading}. ${text}`}>
      <View style={styles.tipBadge}>
        <Icon name="sparkles" size={18} color="text/brand" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type('Caption', 'SemiBold'), { color: color['text/brand'] }]}>{heading}</Text>
        <Text style={[type('Body/Small'), { color: color['text/primary'] }]}>{text}</Text>
      </View>
    </View>
  );
}

/** B3: mirrors ring, strip, next-period and log cards so nothing jumps when data arrives. */
export function HomeSkeleton() {
  const c = useCopy(COPY);
  return (
    <View style={styles.skeleton} accessibilityLabel={c.loading}>
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
  tip: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.xl, backgroundColor: color['surface/subtle'], borderWidth: 1, borderColor: color['border/subtle'] },
  tipBadge: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
  skeleton: { alignItems: 'center', gap: 16 },
  skeletonBlocks: { alignSelf: 'stretch', gap: 12 },
});
