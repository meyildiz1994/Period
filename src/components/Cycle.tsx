import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { color, elevation, type, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Icon } from './Icon';

// Figma: Cycle Ring (Phase). Signature component. Each phase has its own arc colour, drop and
// "Day N" colour; the arc ends in a knob at today. Phases are calendar estimates, not medical
// readings, and the screen reader label says so.
// Neutral is for irregular cycles, where no phase is estimated.
export type Phase = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Neutral' | 'Late' | 'Empty';

const PHASE_COLOR: Record<Phase, { arc: ColorToken; track: ColorToken; drop: ColorToken; day: ColorToken }> = {
  Menstrual: { arc: 'phase/menstrual', track: 'phase/menstrual-track', drop: 'phase/menstrual', day: 'phase/menstrual' },
  Follicular: { arc: 'phase/follicular', track: 'phase/follicular-track', drop: 'phase/follicular', day: 'phase/follicular' },
  Ovulation: { arc: 'phase/ovulation', track: 'phase/ovulation-track', drop: 'phase/ovulation', day: 'phase/ovulation' },
  Luteal: { arc: 'phase/luteal', track: 'phase/luteal-track', drop: 'phase/luteal', day: 'phase/luteal' },
  Neutral: { arc: 'surface/brand', track: 'surface/muted', drop: 'surface/brand', day: 'text/brand' },
  Late: { arc: 'phase/menstrual', track: 'phase/menstrual-track', drop: 'phase/menstrual', day: 'phase/menstrual' },
  Empty: { arc: 'surface/strong', track: 'surface/strong', drop: 'surface/neutral', day: 'text/accent' },
};

type CycleRingProps = {
  phase: Phase;
  /** 0–1 progress through the cycle. Ignored for Empty; Late draws a full ring. */
  progress: number;
  /** Defaults to "<Phase> Phase". */
  label?: string;
  day: string;
  /** Extra line under the day (D3 "days"). The phase rings themselves have none. */
  caption?: string;
  /** Soft pill under the day (B4 "3 days past estimate"): visible without reading as a warning. */
  note?: string;
  size?: number;
  /** Today's marker at the end of the arc. Off for D3, where the arc is the period's share. */
  knob?: boolean;
  /** Phase drop above the label. Off for D3. */
  icon?: boolean;
  /** Overrides the size-based day text (D3 shows "28" in Display at 200). */
  dayRole?: 'Display' | 'Title/Large';
};

export function CycleRing({ phase, progress, label, day, caption, note, size = 260, knob = true, icon = true, dayRole }: CycleRingProps) {
  // 20 at the 260 hero size, scaled down for Home (220) and Cycle details (200).
  const stroke = Math.round(size / 13);
  // Home's 220 ring uses smaller text than the 260 hero ring.
  const compact = size < 240;
  const r = (size - stroke) / 2;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const p = phase === 'Empty' ? 0 : phase === 'Late' ? 1 : Math.min(Math.max(progress, 0), 1);
  const tone = PHASE_COLOR[phase];
  const angle = p * 2 * Math.PI - Math.PI / 2;
  const dot = { x: c + r * Math.cos(angle), y: c + r * Math.sin(angle) };
  const title = label ?? `${phase} Phase`;
  const estimate = phase === 'Empty' || phase === 'Late' ? '' : ', estimate';

  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${title}${estimate}. ${day}.${caption ? ` ${caption}` : ''}${note ? ` ${note}.` : ''}`}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r} stroke={color[tone.track]} strokeWidth={stroke} fill="none" />
        {p > 0 ? (
          <Circle
            cx={c} cy={c} r={r}
            stroke={color[tone.arc]} strokeWidth={stroke} fill="none" strokeLinecap="butt"
            strokeDasharray={`${circumference * p} ${circumference}`}
            transform={`rotate(-90 ${c} ${c})`}
          />
        ) : null}
        {knob && p > 0 && p < 1 ? (
          <Circle cx={dot.x} cy={dot.y} r={size * 0.046} fill={color[tone.arc]} stroke={color['surface/default']} strokeWidth={size * 0.016} />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.ringCenter, { paddingHorizontal: stroke + 4 }]}>
        {icon ? <PhaseDrop size={size * (note ? 0.13 : 0.2)} fill={color[tone.drop]} /> : null}
        {label !== '' ? (
          <Text style={[type(compact ? 'Caption' : 'Body/Small', 'Medium'), styles.centerText, { color: color['text/secondary'], marginTop: icon ? size * (note ? 0.02 : 0.03) : 0 }]}>
            {title}
          </Text>
        ) : null}
        <Text style={[type(dayRole ?? (compact ? 'Title/Large' : 'Display'), 'Bold'), styles.centerText, { color: color[tone.day] }]}>{day}</Text>
        {caption ? <Text style={[type(compact ? 'Caption' : 'Body/Small'), styles.centerText, { color: color['text/secondary'] }]}>{caption}</Text> : null}
        {note ? (
          <View style={styles.note}>
            <Text style={[type(compact ? 'Caption' : 'Body/Small', 'SemiBold'), { color: color['text/brand'] }]}>{note}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Teardrop with a light highlight, drawn to the height given (as in the Cycle Ring and app icon).
export function PhaseDrop({ size, fill }: { size: number; fill: string }) {
  return (
    <Svg width={size * 0.74} height={size} viewBox="-1.1 -1.9 2.2 2.98">
      <Path d="M0 -1.82 C0.38 -1.32 1 -0.72 1 0 A1 1 0 0 1 -1 0 C-1 -0.72 -0.38 -1.32 0 -1.82 Z" fill={fill} stroke={fill} strokeWidth={0.12} strokeLinejoin="round" />
      <Path d="M-0.5 -0.32 L-0.28 -0.68" stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={0.13} strokeLinecap="round" />
    </Svg>
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
  note: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: color['surface/muted'] },
  centerText: { textAlign: 'center' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  day: { width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', gap: 2 },
  marker: { position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: 999, backgroundColor: color['surface/brand'] },
  flow: { width: 62, height: 72, gap: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pin: { width: 16, height: 16, borderRadius: 999 },
  key: { width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  keyDigit: { backgroundColor: color['surface/default'] },
});
