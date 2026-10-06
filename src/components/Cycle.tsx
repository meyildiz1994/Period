import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { color, elevation, type, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Icon } from './Icon';

// Figma: Cycle Ring (Phase). Signature component. The arc shows progress through the
// estimated cycle; phases are calendar estimates, not medical readings.
export type Phase = 'Menstrual' | 'Follicular' | 'Luteal' | 'Late' | 'Empty';

type CycleRingProps = {
  phase: Phase;
  /** 0–1 progress through the cycle. Ignored for Empty; Late draws a full ring. */
  progress: number;
  label: string;
  day: string;
  caption: string;
  size?: number;
};

export function CycleRing({ phase, progress, label, day, caption, size = 260 }: CycleRingProps) {
  // 20 at the 260 hero size, scaled down for Home (220) and Cycle details (200).
  const stroke = Math.round(size / 13);
  // Home's 220 ring uses smaller day and caption text than the 260 hero ring.
  const compact = size < 240;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const p = phase === 'Empty' ? 0 : phase === 'Late' ? 1 : Math.min(Math.max(progress, 0), 1);
  const arcColor = color[phase === 'Late' ? 'surface/brand-soft' : 'surface/brand'];
  const angle = p * 2 * Math.PI - Math.PI / 2;
  const knob = { x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${label}. ${day}. ${caption}`}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={color['surface/strong']} strokeWidth={stroke} fill="none" />
        {p > 0 ? (
          <Circle
            cx={c} cy={c} r={r}
            stroke={arcColor} strokeWidth={stroke} fill="none" strokeLinecap="butt"
            strokeDasharray={`${circumference * p} ${circumference}`}
            transform={`rotate(-90 ${c} ${c})`}
          />
        ) : null}
        {p > 0 && p < 1 ? <Circle cx={knob.x} cy={knob.y} r={12} fill={color['surface/brand']} stroke={color['surface/default']} strokeWidth={4} /> : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.ringCenter, { paddingHorizontal: stroke + 4 }]}>
        <Text style={[type('Body/Default', 'Medium'), styles.centerText, { color: color['text/secondary'] }]}>{label}</Text>
        <Text style={[type(phase === 'Late' || compact ? 'Title/Large' : 'Display', 'Bold'), styles.centerText, { color: color['text/brand'] }]}>{day}</Text>
        <Text style={[type(compact ? 'Caption' : 'Body/Small'), styles.centerText, { color: color['text/secondary'] }]}>{caption}</Text>
      </View>
    </View>
  );
}

// Figma: Day Cell (State). Period = logged bleeding, Predicted = dashed estimate, Logged = symptoms only.
export type DayState = 'Default' | 'Muted' | 'Today' | 'Period' | 'Predicted' | 'Selected' | 'Logged';

export function DayCell({ day, state = 'Default', onPress, accessibilityLabel }: { day: number; state?: DayState; onPress?: () => void; accessibilityLabel?: string }) {
  const fg: ColorToken =
    state === 'Selected' ? 'text/on-brand' : state === 'Muted' ? 'text/disabled' : state === 'Period' || state === 'Today' || state === 'Predicted' ? 'text/brand' : 'text/primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? String(day)}
      accessibilityState={{ selected: state === 'Selected' }}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.day,
        state === 'Period' && { backgroundColor: color['surface/strong'] },
        state === 'Selected' && { backgroundColor: color['surface/brand'] },
        state === 'Today' && { borderWidth: 1.5, borderColor: color['border/focus'] },
        state === 'Predicted' && { borderWidth: 1.5, borderColor: color['border/default'], borderStyle: 'dashed' },
      ]}
    >
      <Text style={[type('Body/Default', state === 'Default' || state === 'Muted' ? 'Regular' : 'SemiBold'), { color: color[fg] }]}>{day}</Text>
      {state === 'Logged' ? <View style={styles.marker} /> : null}
    </Pressable>
  );
}

// Figma: Flow Level (Level × Selected). Distinct icon per level, not colour alone.
export type FlowLevelName = 'None' | 'Spotting' | 'Light' | 'Medium' | 'Heavy';
export const FLOW_LEVELS: { level: FlowLevelName; icon: IconName }[] = [
  { level: 'None', icon: 'ban' },
  { level: 'Spotting', icon: 'dots-fill' },
  { level: 'Light', icon: 'drop' },
  { level: 'Medium', icon: 'drop-fill' },
  { level: 'Heavy', icon: 'drops' },
];

export function FlowLevel({ level, selected, onPress }: { level: FlowLevelName; selected?: boolean; onPress?: () => void }) {
  const icon = FLOW_LEVELS.find((l) => l.level === level)!.icon;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`Flow ${level}`}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[styles.flow, selected ? { backgroundColor: color['surface/brand'] } : { backgroundColor: color['surface/default'], borderWidth: 1, borderColor: color['border/subtle'] }]}
    >
      <Icon name={icon} size={20} color={selected ? 'text/on-brand' : level === 'None' ? 'text/tertiary' : 'text/brand'} />
      <Text style={[type('Footnote', 'Medium'), { color: color[selected ? 'text/on-brand' : 'text/primary'] }]}>{level}</Text>
    </Pressable>
  );
}

// Figma: Passcode Dot (State) and Keypad Key (Type). App lock entry.
export function PasscodeDot({ state }: { state: 'Empty' | 'Filled' | 'Error' }) {
  return (
    <View
      style={[
        styles.pin,
        state === 'Filled' && { backgroundColor: color['surface/brand'] },
        state === 'Error' && { backgroundColor: color['feedback/danger'] },
        state === 'Empty' && { borderWidth: 1.5, borderColor: color['border/focus'] },
      ]}
    />
  );
}

export function KeypadKey({ digit, icon, label, onPress }: { digit?: string; icon?: IconName; label?: string; onPress?: () => void }) {
  if (!digit && !icon) return <View style={styles.key} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? digit}
      onPress={onPress}
      style={({ pressed }) => [styles.key, digit && [styles.keyDigit, elevation.hairline], pressed && { backgroundColor: color['surface/muted'] }]}
    >
      {digit ? <Text style={[type('Title/Medium', 'Medium'), { color: color['text/primary'], letterSpacing: 0 }]}>{digit}</Text> : null}
      {icon ? <Icon name={icon} color="text/secondary" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centerText: { textAlign: 'center' },
  ringCenter: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  day: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', gap: 2 },
  marker: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 999, backgroundColor: color['surface/brand'] },
  flow: { width: 62, height: 72, gap: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pin: { width: 16, height: 16, borderRadius: 999 },
  key: { width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  keyDigit: { backgroundColor: color['surface/default'] },
});
