import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollView } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { tick } from '../lib/haptics';
import { color, elevation, radius, type } from '../theme';
import { Icon } from './Icon';
import { useScrollLock } from './ScrollLock';

// Day · month · year wheel used in A3 (5 rows) and C2 (3 rows), like the iOS picker: each column
// scrolls with momentum and snaps to a row, rows tilt and fade away from the centre, and every
// row that passes the centre gives a light haptic tick. Day and month loop (31 → 1, Dec → Jan).
// Dates after `max` are listed but dimmed; landing on one turns the wheel back to `max` and
// shows a short warning.
const COPY = defineCopy({
  en: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    day: 'Day',
    month: 'Month',
    year: 'Year',
    future: 'That date hasn’t happened yet, so it can’t be picked.',
  },
  tr: {
    months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    day: 'Gün',
    month: 'Ay',
    year: 'Yıl',
    future: 'Bu tarih henüz gelmedi, o yüzden seçilemez.',
  },
});
const ROW = 44;
const PAD = 8;
/** Years listed before and after `max`'s year. */
const YEARS_BACK = 50;
const YEARS_AHEAD = 5;
/** Copies of a looping column; the wheel starts in the middle one and re-centres when it stops. */
const LOOPS = 9;
const MIDDLE = Math.floor(LOOPS / 2);
const WARNING_MS = 2600;

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  max: Date;
  rows?: 3 | 5;
};

const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export function DateWheel({ value, onChange, max, rows = 5 }: Props) {
  const c = useCopy(COPY);
  const lockPage = useScrollLock();
  const [warning, setWarning] = useState(0);
  const y = value.getFullYear();
  const m = value.getMonth();
  const d = value.getDate();
  const maxY = max.getFullYear();
  const maxM = max.getMonth();

  useEffect(() => {
    if (!warning) return;
    const t = setTimeout(() => setWarning(0), WARNING_MS);
    return () => clearTimeout(t);
  }, [warning]);

  const set = (year: number, month: number, day: number) => {
    const next = new Date(year, month, Math.min(day, daysIn(year, month)));
    if (next > max) {
      tick();
      setWarning(Date.now());
      onChange(new Date(max.getFullYear(), max.getMonth(), max.getDate()));
    } else onChange(next);
  };

  const years = Array.from({ length: YEARS_BACK + YEARS_AHEAD + 1 }, (_, i) => maxY - YEARS_BACK + i);
  const dayCount = daysIn(y, m);
  // Index from which a column's rows are in the future, given the other two columns.
  const dayFuture = y > maxY || (y === maxY && m > maxM) ? 0 : y === maxY && m === maxM ? max.getDate() : dayCount;
  const monthFuture = y > maxY ? 0 : y === maxY ? maxM + 1 : 12;
  const yearFuture = YEARS_BACK + 1;

  const side = (rows - 1) / 2;

  return (
    <View style={{ gap: 8 }}>
      {/* While a finger is on the wheel only the wheel scrolls, never the page around it. */}
      <View
        style={[styles.well, { height: ROW * rows + PAD * 2 }]}
        onTouchStart={() => lockPage(true)}
        onTouchEnd={() => lockPage(false)}
        onTouchCancel={() => lockPage(false)}
      >
        <View style={[styles.selected, elevation.hairline, { top: PAD + side * ROW }]} pointerEvents="none" />
        <Column
          label={c.day}
          labels={Array.from({ length: dayCount }, (_, i) => String(i + 1))}
          index={d - 1}
          futureFrom={dayFuture}
          loop
          side={side}
          onSelect={(i) => set(y, m, i + 1)}
        />
        <Column label={c.month} labels={c.months} index={m} futureFrom={monthFuture} loop side={side} onSelect={(i) => set(y, i, d)} />
        <Column label={c.year} labels={years.map(String)} index={y - years[0]} futureFrom={yearFuture} side={side} onSelect={(i) => set(years[i], m, d)} />
      </View>
      {warning ? (
        <View style={styles.warning} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={16} color="feedback/danger" />
          <Text style={[type('Body/Small'), { flex: 1, color: color['feedback/danger'] }]}>{c.future}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Scroll bookkeeping for one column, kept outside React state: the scroll view, the row at
// the centre, whether a finger or momentum is moving it, and the latest props for the handlers.
class ColumnScroll {
  scroll: ScrollView | null = null;
  moving = false;
  still: ReturnType<typeof setTimeout> | null = null;
  constructor(public row: number, public index: number, public n: number, public loop: boolean, public onSelect: (i: number) => void) {}

  get rows() {
    return (this.loop ? LOOPS : 1) * this.n;
  }

  home(i: number) {
    return this.loop ? MIDDLE * this.n + i : i;
  }

  attach(scroll: ScrollView | null) {
    this.scroll = scroll;
  }

  begin() {
    this.moving = true;
  }

  /** Content laid out (first render, or the row count changed): put the centre row in place.
   * Needed because `contentOffset` isn't applied everywhere (web, some Android versions). */
  place() {
    if (!this.moving) this.scroll?.scrollTo({ y: this.row * ROW, animated: false });
  }

  scrollToRow(row: number, animated: boolean) {
    this.row = row;
    this.scroll?.scrollTo({ y: row * ROW, animated });
  }

  /** New props: follow the value when it changed from outside, to the nearest row showing it. */
  sync(index: number, n: number, onSelect: (i: number) => void) {
    this.index = index;
    this.onSelect = onSelect;
    if (this.moving) return;
    if (this.n !== n) {
      this.n = n;
      this.scrollToRow(this.home(index), false);
      return;
    }
    const cur = this.row;
    const at = ((cur % n) + n) % n;
    if (at === index) return;
    let target = cur - at + index;
    if (this.loop && target - cur > n / 2) target -= n;
    if (this.loop && cur - target > n / 2) target += n;
    this.scrollToRow(Math.max(0, Math.min(this.rows - 1, target)), true);
  }

  /** A row crossed the centre while scrolling: tick, and settle once the column is still. */
  scrolled(offset: number) {
    // Any scroll counts as moving (web and mouse wheels never send a drag start), so a re-render
    // mid-scroll doesn't pull the column back to the old value.
    this.moving = true;
    const row = Math.round(offset / ROW);
    if (row !== this.row) {
      this.row = row;
      tick();
    }
    // Scrolls without momentum events (web, mouse wheel) settle once still.
    if (this.still) clearTimeout(this.still);
    this.still = setTimeout(() => this.settle(offset), 180);
  }

  settle(offset: number) {
    this.moving = false;
    if (this.still) clearTimeout(this.still);
    const row = Math.max(0, Math.min(this.rows - 1, Math.round(offset / ROW)));
    const i = row % this.n;
    // Jump back to the middle copy without animation so the loop never runs out.
    if (this.loop && Math.floor(row / this.n) !== MIDDLE) this.scrollToRow(this.home(i), false);
    else this.row = row;
    if (i !== this.index) this.onSelect(i);
  }

  pick(row: number) {
    this.scrollToRow(row, true);
    this.onSelect(row % this.n);
  }
}

function Column({ label, labels, index, futureFrom, loop = false, side, onSelect }: {
  label: string; labels: string[]; index: number; futureFrom: number; loop?: boolean; side: number; onSelect: (i: number) => void;
}) {
  const n = labels.length;
  const start = loop ? MIDDLE * n + index : index;
  const [track] = useState(() => new ColumnScroll(start, index, n, loop, onSelect));
  const [y] = useState(() => new Animated.Value(start * ROW));

  useEffect(() => {
    track.sync(index, n, onSelect);
  });

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y } } }], {
    useNativeDriver: true,
    listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => track.scrolled(e.nativeEvent.contentOffset.y),
  });

  const step = (delta: number) => {
    const next = loop ? (index + delta + n) % n : index + delta;
    if (next >= 0 && next < n) onSelect(next);
  };

  const rowsList = Array.from({ length: (loop ? LOOPS : 1) * n }, (_, r) => r);

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
      <Animated.ScrollView
        ref={(r: ScrollView | null) => track.attach(r)}
        contentOffset={{ x: 0, y: start * ROW }}
        contentContainerStyle={{ paddingVertical: side * ROW }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={onScroll}
        onScrollBeginDrag={() => track.begin()}
        onContentSizeChange={() => track.place()}
        onMomentumScrollEnd={(e) => track.settle(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => {
          // No momentum after a slow release: settle now; otherwise wait for momentum to end.
          if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.05) track.settle(e.nativeEvent.contentOffset.y);
        }}
      >
        {rowsList.map((r) => (
          <Row key={r} text={labels[r % n]} future={r % n >= futureFrom} r={r} y={y} side={side} onPress={() => track.pick(r)} />
        ))}
      </Animated.ScrollView>
    </View>
  );
}

// One row: tilts back and fades with its distance from the centre, like a drum. Future dates
// are dimmed so it's clear they can't be picked.
function Row({ text, future, r, y, side, onPress }: {
  text: string; future: boolean; r: number; y: Animated.Value; side: number; onPress: () => void;
}) {
  const at = r * ROW;
  const range = [at - (side + 1) * ROW, at - ROW, at, at + ROW, at + (side + 1) * ROW];
  const opacity = y.interpolate({ inputRange: range, outputRange: [0.15, 0.45, 1, 0.45, 0.15], extrapolate: 'clamp' });
  const scale = y.interpolate({ inputRange: range, outputRange: [0.82, 0.92, 1.08, 0.92, 0.82], extrapolate: 'clamp' });
  const rotateX = y.interpolate({ inputRange: range, outputRange: ['-60deg', '-28deg', '0deg', '28deg', '60deg'], extrapolate: 'clamp' });
  return (
    <Pressable onPress={onPress} style={styles.cell} accessible={false}>
      <Animated.Text
        selectable={false}
        style={[
          type('Body/Large', 'SemiBold'),
          { color: color[future ? 'text/disabled' : 'text/brand'], opacity, transform: [{ perspective: 400 }, { rotateX }, { scale }] },
        ]}
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
  warning: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
});
