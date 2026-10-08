import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { color, elevation, radius, type } from '../theme';

// Day · month · year wheel used in A3 (5 rows) and C2 (3 rows), like the iOS picker: each column
// scrolls with momentum and snaps to a row, rows tilt and fade away from the centre, and every
// row that passes the centre gives a light haptic tick. Tapping a row scrolls to it.
// Future dates are never listed, so the value can't go past `max`.
const COPY = defineCopy({
  en: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
  tr: {
    months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    day: 'Gün',
    month: 'Ay',
    year: 'Yıl',
  },
});
const ROW = 44;
const PAD = 8;

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  max: Date;
  minYear: number;
  rows?: 3 | 5;
};

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export function DateWheel({ value, onChange, max, minYear, rows = 5 }: Props) {
  const c = useCopy(COPY);
  const y = value.getFullYear();
  const m = value.getMonth();
  const d = value.getDate();

  const set = (year: number, month: number, day: number) => {
    const lastMonth = year === max.getFullYear() ? max.getMonth() : 11;
    const mm = Math.min(month, lastMonth);
    const lastDay = year === max.getFullYear() && mm === max.getMonth() ? max.getDate() : daysIn(year, mm);
    onChange(new Date(year, mm, Math.min(day, lastDay)));
  };

  const years = Array.from({ length: max.getFullYear() - minYear + 1 }, (_, i) => minYear + i);
  const monthCount = y === max.getFullYear() ? max.getMonth() + 1 : 12;
  const dayCount = y === max.getFullYear() && m === max.getMonth() ? max.getDate() : daysIn(y, m);

  const side = (rows - 1) / 2;

  return (
    <View style={[styles.well, { height: ROW * rows + PAD * 2 }]}>
      <View style={[styles.selected, elevation.hairline, { top: PAD + side * ROW }]} pointerEvents="none" />
      <Column
        label={c.day}
        labels={Array.from({ length: dayCount }, (_, i) => String(i + 1))}
        index={d - 1}
        side={side}
        onSelect={(i) => set(y, m, i + 1)}
      />
      <Column label={c.month} labels={c.months.slice(0, monthCount)} index={m} side={side} onSelect={(i) => set(y, i, d)} />
      <Column label={c.year} labels={years.map(String)} index={y - minYear} side={side} onSelect={(i) => set(years[i], m, d)} />
    </View>
  );
}

function Column({ label, labels, index, side, onSelect }: {
  label: string; labels: string[]; index: number; side: number; onSelect: (i: number) => void;
}) {
  const scroll = useRef<Animated.FlatList<string> | null>(null);
  const [y] = useState(() => new Animated.Value(index * ROW));
  // Row under the centre while the finger or momentum moves the column (for the haptic tick).
  const passing = useRef(index);
  const moving = useRef(false);

  const clamp = (i: number) => Math.max(0, Math.min(labels.length - 1, i));
  const scrollTo = (i: number, animated = true) => scroll.current?.scrollToOffset({ offset: i * ROW, animated });

  // Keep the column on the value when it changes from outside (a shorter month clamps the day,
  // an accessibility action, a tap).
  useEffect(() => {
    if (!moving.current) scrollTo(index);
  }, [index]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: true });

  // Latest props for the scroll listener below.
  const latest = useRef({ index, onSelect });
  useEffect(() => {
    latest.current = { index, onSelect };
  });

  // A light tick each time a new row passes the centre. The pick is also made once the column
  // has been still for a moment, which covers scrolls without momentum events (web, wheel).
  const count = labels.length;
  useEffect(() => {
    let still: ReturnType<typeof setTimeout> | null = null;
    const id = y.addListener(({ value }) => {
      const i = Math.max(0, Math.min(count - 1, Math.round(value / ROW)));
      if (i !== passing.current) {
        passing.current = i;
        if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
      }
      if (still) clearTimeout(still);
      still = setTimeout(() => {
        moving.current = false;
        if (i !== latest.current.index) latest.current.onSelect(i);
      }, 180);
    });
    return () => {
      y.removeListener(id);
      if (still) clearTimeout(still);
    };
  }, [y, count]);

  const settle = (offset: number) => {
    moving.current = false;
    const i = clamp(Math.round(offset / ROW));
    if (i !== index) onSelect(i);
    else scrollTo(i);
  };

  const step = (delta: number) => {
    const next = index + delta;
    if (next >= 0 && next < labels.length) onSelect(next);
  };

  return (
    <View
      style={styles.column}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: labels[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      <Animated.FlatList
        ref={scroll}
        data={labels}
        keyExtractor={(item, i) => `${i}-${item}`}
        getItemLayout={(_, i) => ({ length: ROW, offset: ROW * i, index: i })}
        initialScrollIndex={index}
        contentContainerStyle={{ paddingVertical: side * ROW }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => { moving.current = true; }}
        onMomentumScrollEnd={(e) => settle(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => {
          // No momentum after a slow release: settle now; otherwise wait for momentum to end.
          const v = e.nativeEvent.velocity?.y ?? 0;
          if (Math.abs(v) < 0.05) settle(e.nativeEvent.contentOffset.y);
        }}
        renderItem={({ item, index: i }) => <Row text={item} i={i} y={y} side={side} onPress={() => { scrollTo(i); onSelect(i); }} />}
      />
    </View>
  );
}

// One row: tilts back and fades with its distance from the centre, like a drum.
function Row({ text, i, y, side, onPress }: { text: string; i: number; y: Animated.Value; side: number; onPress: () => void }) {
  const at = i * ROW;
  const range = [at - (side + 1) * ROW, at - ROW, at, at + ROW, at + (side + 1) * ROW];
  const opacity = y.interpolate({ inputRange: range, outputRange: [0.15, 0.45, 1, 0.45, 0.15], extrapolate: 'clamp' });
  const scale = y.interpolate({ inputRange: range, outputRange: [0.82, 0.92, 1.08, 0.92, 0.82], extrapolate: 'clamp' });
  const rotateX = y.interpolate({ inputRange: range, outputRange: ['-60deg', '-28deg', '0deg', '28deg', '60deg'], extrapolate: 'clamp' });
  return (
    <Pressable onPress={onPress} style={styles.cell} accessible={false}>
      <Animated.Text
        selectable={false}
        style={[type('Body/Large', 'SemiBold'), styles.text, { opacity, transform: [{ perspective: 400 }, { rotateX }, { scale }] }]}
      >
        {text}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  well: { flexDirection: 'row', paddingVertical: PAD, paddingHorizontal: PAD, borderRadius: radius.lg, backgroundColor: color['surface/subtle'] },
  selected: { position: 'absolute', left: PAD, right: PAD, height: ROW, borderRadius: radius.md, backgroundColor: color['surface/default'] },
  column: { flex: 1, overflow: 'hidden' },
  cell: { height: ROW, alignItems: 'center', justifyContent: 'center' },
  text: { color: color['text/brand'] },
});
