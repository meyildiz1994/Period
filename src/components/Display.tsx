import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { color, elevation, radius, type, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Toggle } from './Controls';
import { Icon } from './Icon';

// White surface card used to group content (Common region).
export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return <View style={[styles.card, padded && { padding: 16 }, style]}>{children}</View>;
}

// Figma: Tag (Tone × Size). Read-only label; for selection use Choice.
export type Tone = 'Brand' | 'Neutral' | 'Strong' | 'Inverse' | 'Danger' | 'Success' | 'Warning';
const TAG: Record<Tone, [ColorToken, ColorToken]> = {
  Brand: ['text/brand', 'surface/muted'],
  Neutral: ['text/secondary', 'surface/default'],
  Strong: ['text/brand', 'surface/strong'],
  Inverse: ['text/on-brand', 'surface/brand'],
  Danger: ['feedback/danger', 'feedback/danger-subtle'],
  Success: ['feedback/success', 'feedback/success-subtle'],
  Warning: ['feedback/warning', 'feedback/warning-subtle'],
};

export function Tag({ label, tone = 'Brand', size = 'Medium', icon, dot }: { label: string; tone?: Tone; size?: 'Small' | 'Medium'; icon?: IconName; dot?: boolean }) {
  const [fg, bg] = TAG[tone];
  const sm = size === 'Small';
  return (
    <View style={[styles.tag, { paddingVertical: sm ? 4 : 6, paddingHorizontal: sm ? 10 : 12, backgroundColor: color[bg] }, tone === 'Neutral' && styles.neutralBorder]}>
      {dot ? <View style={[styles.dot6, { backgroundColor: color[fg] }]} /> : null}
      {icon ? <Icon name={icon} size={16} color={fg} /> : null}
      <Text style={[type(sm ? 'Footnote' : 'Caption', sm ? 'SemiBold' : 'Medium'), { color: color[fg] }]}>{label}</Text>
    </View>
  );
}

// Figma: Icon Badge (Tone × Size). Round icon container.
const BADGE: Record<Exclude<Tone, 'Neutral' | 'Inverse'> | 'Subtle' | 'Surface', [ColorToken, ColorToken]> = {
  Subtle: ['text/brand', 'surface/muted'],
  Strong: ['text/brand', 'surface/strong'],
  Brand: ['text/on-brand', 'surface/brand'],
  Surface: ['text/brand', 'surface/default'],
  Danger: ['feedback/danger', 'feedback/danger-subtle'],
  Success: ['feedback/success', 'feedback/success-subtle'],
  Warning: ['feedback/warning', 'feedback/warning-subtle'],
};
const BADGE_ICON = { 32: 16, 40: 20, 48: 24, 56: 24, 64: 32 } as const;

export function IconBadge({ icon, tone = 'Subtle', size = 40 }: { icon: IconName; tone?: keyof typeof BADGE; size?: keyof typeof BADGE_ICON }) {
  const [fg, bg] = BADGE[tone];
  return (
    <View style={[styles.center, { width: size, height: size, borderRadius: 999, backgroundColor: color[bg] }]}>
      <Icon name={icon} size={BADGE_ICON[size]} color={fg} />
    </View>
  );
}

// Figma: Avatar (Size × Type). Initial when a name exists, Icon before onboarding.
export function Avatar({ name, size = 'Medium' }: { name?: string; size?: 'Small' | 'Medium' | 'Large' }) {
  const s = { Small: 32, Medium: 40, Large: 96 }[size];
  const initial = name?.trim()[0]?.toUpperCase();
  const fs = s >= 96 ? 40 : s >= 40 ? 16 : 14;
  return (
    <View style={[styles.center, { width: s, height: s, borderRadius: 999, backgroundColor: color[initial ? 'surface/brand' : 'surface/strong'] }]}>
      {initial ? (
        <Text style={[type('Body/Medium', 'SemiBold'), { fontSize: fs, lineHeight: Math.round(fs * 1.2), color: color['text/on-brand'] }]}>{initial}</Text>
      ) : (
        <Icon name="user" size={s >= 96 ? 40 : s >= 40 ? 20 : 16} color="text/brand" />
      )}
    </View>
  );
}

// Figma: List Row (Trailing × Tone). Group related rows in one Card.
type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  trailing?: 'Chevron' | 'Toggle' | 'Value' | 'None';
  value?: string;
  toggled?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
  onPress?: () => void;
};

export function ListRow({ title, subtitle, icon = 'drop', trailing = 'Chevron', value, toggled = false, onToggle, destructive, onPress }: ListRowProps) {
  const content = (
    <>
      <View style={[styles.center, styles.lead40, { backgroundColor: color[destructive ? 'feedback/danger-subtle' : 'surface/muted'] }]}>
        <Icon name={icon} size={20} color={destructive ? 'feedback/danger' : 'text/brand'} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type('Body/Medium', 'Medium'), { color: color[destructive ? 'feedback/danger' : 'text/primary'] }]}>{title}</Text>
        {subtitle ? <Text numberOfLines={2} style={[type('Caption'), { color: color['text/secondary'] }]}>{subtitle}</Text> : null}
      </View>
      {trailing === 'Toggle' ? <Toggle value={toggled} onChange={onToggle} label={title} /> : null}
      {trailing === 'Value' ? <Text style={[type('Body/Default', 'Medium'), { color: color['text/brand'] }]}>{value}</Text> : null}
      {trailing === 'Chevron' || trailing === 'Value' ? <Icon name="chevron-right" size={20} color="text/tertiary" /> : null}
    </>
  );
  if (trailing === 'Toggle' || !onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color['surface/subtle'] }]}>
      {content}
    </Pressable>
  );
}

export function Divider({ inset = 70 }: { inset?: number }) {
  return <View style={{ height: 1, marginLeft: inset, backgroundColor: color['surface/divider'] }} />;
}

// Figma: Section Header. Title with an optional text action.
export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={12}>
          <Text style={[type('Body/Small', 'Medium'), { color: color['text/brand'] }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// Figma: Stat Tile. Single metric with unit, used in a 2-column grid.
export function StatTile({ label, value, unit, icon = 'calendar' }: { label: string; value: string; unit?: string; icon?: IconName }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statHead}>
        <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{label}</Text>
        <Icon name={icon} size={16} color="text/brand" />
      </View>
      <View style={styles.baseline}>
        <Text style={[type('Title/Small', 'SemiBold'), { color: color['text/primary'] }]}>{value}</Text>
        {unit ? <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{unit}</Text> : null}
      </View>
    </View>
  );
}

// Figma: Skeleton (Shape). Mirrors the final layout so content does not jump.
export function Skeleton({ shape = 'Line', width, height }: { shape?: 'Line' | 'Block' | 'Circle'; width?: number | `${number}%`; height?: number }) {
  const [pulse] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const d = shape === 'Line' ? { w: 200, h: 14, r: 8 } : shape === 'Block' ? { w: 350, h: 120, r: 24 } : { w: 48, h: 48, r: 999 };
  return <Animated.View style={{ opacity: pulse, width: width ?? d.w, height: height ?? d.h, borderRadius: d.r, backgroundColor: color['surface/muted'] }} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: color['surface/default'], borderRadius: radius.xl, ...elevation.hairline },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, alignSelf: 'flex-start' },
  neutralBorder: { borderWidth: 1, borderColor: color['border/subtle'] },
  dot6: { width: 6, height: 6, borderRadius: 999 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, minHeight: 56 },
  lead40: { width: 40, height: 40, borderRadius: 999 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 8 },
  stat: { flex: 1, padding: 16, gap: 8, borderRadius: 16, backgroundColor: color['surface/default'], borderWidth: 1, borderColor: color['border/subtle'] },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  baseline: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
});
