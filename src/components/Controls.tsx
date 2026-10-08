import { Pressable, StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { color, elevation, type, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: { decrease: 'Decrease', increase: 'Increase' },
  tr: { decrease: 'Azalt', increase: 'Artır' },
});

// Figma: Icon Button (Type × Size). Icon-only, so a label is required for screen readers.
type IconButtonType = 'Tonal' | 'Plain' | 'Brand' | 'Surface';
const ICON_BUTTON: Record<IconButtonType, { fg: ColorToken; bg?: ColorToken }> = {
  Tonal: { fg: 'text/primary', bg: 'surface/muted' },
  Plain: { fg: 'text/primary' },
  Brand: { fg: 'text/on-brand', bg: 'surface/brand' },
  Surface: { fg: 'text/primary', bg: 'surface/default' },
};

export function IconButton({ icon, label, onPress, type = 'Plain', size = 'Medium' }: {
  icon: IconName; label: string; onPress?: () => void; type?: IconButtonType; size?: 'Medium' | 'Small';
}) {
  const s = size === 'Medium' ? 44 : 36;
  const t = ICON_BUTTON[type];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={size === 'Small' ? 4 : 0}
      style={({ pressed }) => [
        styles.center,
        { width: s, height: s, borderRadius: 999, backgroundColor: t.bg ? color[t.bg] : 'transparent' },
        type === 'Surface' && elevation.hairline,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon name={icon} size={size === 'Medium' ? 24 : 20} color={t.fg} />
    </Pressable>
  );
}

// Figma: Choice (Layout × State). Inline chips for words (pain, mood), Stacked tiles for icon-led scales.
export function Choice({ label, icon, selected, disabled, onPress, layout = 'Inline' }: {
  label: string; icon?: IconName; selected?: boolean; disabled?: boolean; onPress?: () => void; layout?: 'Inline' | 'Stacked';
}) {
  const fg: ColorToken = selected ? 'text/on-brand' : disabled ? 'text/disabled' : 'text/primary';
  const iconColor: ColorToken = selected ? 'text/on-brand' : disabled ? 'text/disabled' : 'text/brand';
  const bg: ColorToken = selected ? 'surface/brand' : disabled ? 'surface/subtle' : 'surface/default';
  const inline = layout === 'Inline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        inline ? styles.choiceInline : styles.choiceStacked,
        { backgroundColor: color[bg], borderColor: selected ? 'transparent' : color['border/subtle'] },
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={iconColor} /> : null}
      <Text style={[type(inline ? 'Body/Default' : 'Footnote', 'Medium'), { color: color[fg], textAlign: 'center' }]}>{label}</Text>
    </Pressable>
  );
}

// Figma: Toggle (State × Disabled). Applies immediately.
export function Toggle({ value, onChange, disabled, label }: { value: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!value)}
      hitSlop={6}
      style={[styles.toggle, { backgroundColor: color[value ? 'surface/brand' : 'surface/strong'] }, disabled && { opacity: 0.4 }]}
    >
      <View style={[styles.knob, elevation.hairline, { left: value ? 22 : 2 }]} />
    </Pressable>
  );
}

// Figma: Checkbox (Checked × Disabled).
export function Checkbox({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      hitSlop={10}
      style={[
        styles.center,
        styles.checkbox,
        checked ? { backgroundColor: color['surface/brand'] } : { backgroundColor: color['surface/default'], borderWidth: 1.5, borderColor: color['border/default'] },
        disabled && { opacity: 0.4 },
      ]}
    >
      {checked ? <Icon name="check" size={16} color="text/on-brand" /> : null}
    </Pressable>
  );
}

// Figma: Radio (Selected). Visual only; the row around it handles the press.
export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.center, styles.radio, { borderWidth: selected ? 2 : 1.5, borderColor: color[selected ? 'border/focus' : 'border/default'] }]}>
      {selected ? <View style={styles.radioDot} /> : null}
    </View>
  );
}

// Figma: Option Card (Selected). Large single-choice row used in onboarding; the whole card is the target.
export function OptionCard({ title, subtitle, icon = 'heart', selected, onPress }: {
  title: string; subtitle?: string; icon?: IconName; selected?: boolean; onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        styles.option,
        selected
          ? { backgroundColor: color['surface/subtle'], borderColor: color['border/focus'], borderWidth: 2 }
          : { backgroundColor: color['surface/default'], borderColor: color['border/subtle'], borderWidth: 1 },
      ]}
    >
      <View style={[styles.center, styles.lead44]}>
        <Icon name={icon} size={20} color="text/brand" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
        {subtitle ? <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{subtitle}</Text> : null}
      </View>
      <Radio selected={!!selected} />
    </Pressable>
  );
}

// Figma: Stepper (Size). Numeric input with sensible defaults.
export function Stepper({ value, unit, onChange, min = 1, max = 99, size = 'Medium' }: {
  value: number; unit?: string; onChange: (v: number) => void; min?: number; max?: number; size?: 'Medium' | 'Large';
}) {
  const c = useCopy(COPY);
  const L = size === 'Large';
  const b = L ? 48 : 40;
  const btn = (icon: IconName, next: number, label: string, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(next)}
      hitSlop={4}
      style={[styles.center, elevation.hairline, { width: b, height: b, borderRadius: 999, backgroundColor: color['surface/default'] }, disabled && { opacity: 0.4 }]}
    >
      <Icon name={icon} size={20} color="text/brand" />
    </Pressable>
  );
  return (
    <View style={[styles.stepper, L && { alignSelf: 'stretch' }]} accessibilityRole="adjustable" accessibilityValue={{ now: value, min, max, text: `${value} ${unit ?? ''}` }}>
      {btn('minus', value - 1, c.decrease, value <= min)}
      <View style={styles.stepperValue}>
        <Text style={[type(L ? 'Title/Small' : 'Headline', 'SemiBold'), { color: color['text/brand'], letterSpacing: 0 }]}>{value}</Text>
        {unit ? <Text style={[type('Caption'), { color: color['text/secondary'] }]}>{unit}</Text> : null}
      </View>
      {btn('plus', value + 1, c.increase, value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  choiceInline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, paddingHorizontal: 16, gap: 8, borderRadius: 999, borderWidth: 1 },
  choiceStacked: { width: 72, height: 72, gap: 4, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  toggle: { width: 52, height: 32, borderRadius: 999 },
  knob: { position: 'absolute', top: 2, width: 28, height: 28, borderRadius: 999, backgroundColor: color['surface/default'] },
  checkbox: { width: 24, height: 24, borderRadius: 6 },
  radio: { width: 24, height: 24, borderRadius: 999, backgroundColor: color['surface/default'] },
  radioDot: { width: 12, height: 12, borderRadius: 999, backgroundColor: color['surface/brand'] },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16 },
  lead44: { width: 44, height: 44, borderRadius: 999, backgroundColor: color['surface/muted'] },
  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 4, borderRadius: 999,
    backgroundColor: color['surface/subtle'], borderWidth: 1, borderColor: color['border/subtle'], alignSelf: 'flex-start',
  },
  stepperValue: { flexDirection: 'row', alignItems: 'baseline', gap: 4, paddingHorizontal: 4 },
});
