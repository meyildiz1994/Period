import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { addDays, formatLong, formatMonthYear, sameDay, startOfMonth, weekdayInitial } from '../lib/dates';
import { color, radius, type } from '../theme';
import { IconButton } from './Controls';
import { DayCell, type DayState } from './Cycle';

// Sunday 4 January 2026, so the initials follow the app language.
const SUNDAY = new Date(2026, 0, 4);

const COPY = defineCopy({
  en: {
    state: { Period: 'period', Predicted: 'predicted period', Logged: 'logged' } as Partial<Record<DayState, string>>,
    today: 'today',
    prev: 'Previous month',
    next: 'Next month',
    legendPeriod: 'Period',
    legendPredicted: 'Predicted',
    legendLogged: 'Symptoms logged',
  },
  tr: {
    state: { Period: 'adet', Predicted: 'tahmini adet', Logged: 'kayıt var' },
    today: 'bugün',
    prev: 'Önceki ay',
    next: 'Sonraki ay',
    legendPeriod: 'Adet',
    legendPredicted: 'Tahmini',
    legendLogged: 'Belirti kaydı',
  },
});

// Month calendar card for History (D1, D4). Weeks start on Sunday or Monday (G2 setting).
export function MonthCalendar({ month, stateOf, selected, today, onSelect, onPrev, onNext, legend = true, weekStartsOn = 0 }: {
  month: Date;
  stateOf: (d: Date) => DayState;
  selected: Date | null;
  today: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  legend?: boolean;
  weekStartsOn?: 0 | 1;
}) {
  const c = useCopy(COPY);
  const initials = Array.from({ length: 7 }, (_, i) => weekdayInitial(addDays(SUNDAY, i)));
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const weekdays = [...initials.slice(weekStartsOn), ...initials.slice(0, weekStartsOn)];
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  return (
    <View style={styles.card}>
      <View style={styles.nav}>
        <IconButton icon="chevron-left" label={c.prev} type="Tonal" size="Small" onPress={onPrev} />
        <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{formatMonthYear(first)}</Text>
        <IconButton icon="chevron-right" label={c.next} type="Tonal" size="Small" onPress={onNext} />
      </View>
      <View style={styles.week}>
        {weekdays.map((d, i) => (
          <Text key={i} style={[type('Caption'), styles.cell, styles.weekday]}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, w) => (
        <View key={w} style={styles.week}>
          {week.map((d, i) => {
            if (!d) return <View key={i} style={styles.cell} />;
            const base = stateOf(d);
            const state: DayState = selected && sameDay(d, selected) ? 'Selected' : sameDay(d, today) && base === 'Default' ? 'Today' : base;
            return (
              <View key={i} style={styles.cell}>
                <DayCell
                  day={d.getDate()}
                  state={state}
                  onPress={() => onSelect(d)}
                  accessibilityLabel={`${formatLong(d)}${c.state[base] ? `, ${c.state[base]}` : ''}${sameDay(d, today) ? `, ${c.today}` : ''}`}
                />
              </View>
            );
          })}
        </View>
      ))}
      {legend ? (
        <View style={styles.legend}>
          <LegendItem label={c.legendPeriod}><View style={[styles.swatch, { backgroundColor: color['surface/strong'] }]} /></LegendItem>
          <LegendItem label={c.legendPredicted}><View style={[styles.swatch, styles.dashed]} /></LegendItem>
          <LegendItem label={c.legendLogged}><View style={styles.dot} /></LegendItem>
        </View>
      ) : null}
    </View>
  );
}

function LegendItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.legendItem}>
      {children}
      <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 4, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  weekday: { color: color['text/tertiary'], textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 999 },
  dashed: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: color['border/default'] },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: color['surface/brand'] },
});
