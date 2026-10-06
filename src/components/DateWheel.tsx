import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, elevation, radius, type } from '../theme';

// Day · month · year wheel used in A3 (5 rows) and C2 (3 rows). Drag a column or tap a row to pick.
// Future dates are never listed, so the value can't go past `max`.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ROW = 40;
const SELECTED = 52;
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
  const height = rows === 5 ? ROW * 4 + SELECTED + PAD * 2 : ROW * 2 + SELECTED + PAD * 2;

  return (
    <View style={[styles.well, { height }]}>
      <View style={[styles.selected, elevation.hairline, { top: PAD + side * ROW }]} />
      <Column
        label="Day"
        labels={Array.from({ length: dayCount }, (_, i) => String(i + 1))}
        index={d - 1}
        side={side}
        onSelect={(i) => set(y, m, i + 1)}
      />
      <Column label="Month" labels={MONTHS.slice(0, monthCount)} index={m} side={side} onSelect={(i) => set(y, i, d)} />
      <Column label="Year" labels={years.map(String)} index={y - minYear} side={side} onSelect={(i) => set(years[i], m, d)} />
    </View>
  );
}

function Column({ label, labels, index, side, onSelect }: {
  label: string; labels: string[]; index: number; side: number; onSelect: (i: number) => void;
}) {
  // Drag: every ROW of vertical travel moves one item. Captured so rows don't keep the touch.
  const drag = useRef({ y: 0, index: 0 });
  const onDragMove = (pageY: number) => {
    const next = Math.max(0, Math.min(labels.length - 1, drag.current.index - Math.round((pageY - drag.current.y) / ROW)));
    if (next !== index) onSelect(next);
  };

  const offsets = Array.from({ length: side * 2 + 1 }, (_, i) => i - side);
  const step = (delta: number) => {
    const next = index + delta;
    if (next >= 0 && next < labels.length) onSelect(next);
  };

  return (
    <View
      style={styles.column}
      onTouchStart={(e) => { drag.current.y = e.nativeEvent.pageY; }}
      onMoveShouldSetResponderCapture={(e) => Math.abs(e.nativeEvent.pageY - drag.current.y) > 4}
      onResponderTerminationRequest={() => false}
      onResponderGrant={(e) => { drag.current = { y: e.nativeEvent.pageY, index }; }}
      onResponderMove={(e) => onDragMove(e.nativeEvent.pageY)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: labels[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      {offsets.map((o) => {
        const text = labels[index + o];
        const isSel = o === 0;
        return (
          <Pressable
            key={o}
            disabled={!text || isSel}
            onPress={() => onSelect(index + o)}
            style={[styles.cell, { height: isSel ? SELECTED : ROW }]}
          >
            {text ? (
              <Text
                selectable={false}
                style={[
                  isSel ? [type('Title/Small', 'SemiBold'), { letterSpacing: 0 }] : type('Body/Large'),
                  { color: color[isSel ? 'text/brand' : Math.abs(o) === 1 ? 'text/tertiary' : 'text/disabled'] },
                ]}
              >
                {text}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  well: { flexDirection: 'row', paddingVertical: PAD, paddingHorizontal: PAD, borderRadius: radius.lg, backgroundColor: color['surface/subtle'] },
  selected: { position: 'absolute', left: PAD, right: PAD, height: SELECTED, borderRadius: radius.md, backgroundColor: color['surface/default'] },
  column: { flex: 1 },
  cell: { alignItems: 'center', justifyContent: 'center' },
});
