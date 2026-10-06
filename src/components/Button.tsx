import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { color, elevation, fontFamily, type ColorToken } from '../theme';
import type { IconName } from '../theme/icons';
import { Icon } from './Icon';

// Figma: Button (Type × Size × State). Pill shaped. One Primary per screen.
export type ButtonType = 'Primary' | 'Secondary' | 'Outline' | 'Ghost' | 'Destructive';
export type ButtonSize = 'Large' | 'Medium' | 'Small';

type Tone = { bg?: ColorToken; fg: ColorToken; pressed: ColorToken; border?: ColorToken; dBg?: ColorToken; dFg: ColorToken; dBorder?: ColorToken };

const TYPES: Record<ButtonType, Tone> = {
  Primary: { bg: 'surface/brand', fg: 'text/on-brand', pressed: 'surface/brand-pressed', dBg: 'surface/disabled', dFg: 'text/on-brand' },
  Secondary: { bg: 'surface/muted', fg: 'text/brand', pressed: 'surface/strong', dBg: 'surface/subtle', dFg: 'text/disabled' },
  Outline: { bg: 'surface/default', fg: 'text/brand', pressed: 'surface/subtle', border: 'border/default', dBg: 'surface/default', dFg: 'text/disabled', dBorder: 'border/subtle' },
  Ghost: { fg: 'text/brand', pressed: 'surface/muted', dFg: 'text/disabled' },
  Destructive: { bg: 'feedback/danger', fg: 'text/on-brand', pressed: 'feedback/danger-strong', dBg: 'feedback/danger-subtle', dFg: 'text/disabled' },
};

const SIZES: Record<ButtonSize, { h: number; px: number; fs: number; icon: number }> = {
  Large: { h: 56, px: 24, fs: 18, icon: 20 },
  Medium: { h: 48, px: 20, fs: 16, icon: 20 },
  Small: { h: 36, px: 16, fs: 14, icon: 16 },
};

type Props = {
  label: string;
  onPress?: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, type = 'Primary', size = 'Large', disabled, loading, iconLeft, iconRight, fullWidth, style }: Props) {
  const t = TYPES[type];
  const s = SIZES[size];
  const fg = disabled ? t.dFg : t.fg;
  const border = disabled ? t.dBorder : t.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={size === 'Small' ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        { height: s.h, paddingHorizontal: s.px },
        fullWidth && styles.full,
        { backgroundColor: color[(disabled ? t.dBg : pressed ? t.pressed : t.bg) ?? 'surface/default'] },
        !t.bg && !pressed && !disabled && styles.clear,
        border && { borderWidth: 1.5, borderColor: color[border] },
        type === 'Primary' && !disabled && !pressed && size !== 'Small' && elevation.brand,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={color[fg]} /> : iconLeft ? <Icon name={iconLeft} size={s.icon} color={fg} /> : null}
      <Text style={[styles.label, { fontSize: s.fs, color: color[fg] }, loading && { opacity: 0.8 }]} numberOfLines={1}>
        {label}
      </Text>
      {iconRight ? <Icon name={iconRight} size={s.icon} color={fg} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, alignSelf: 'flex-start' },
  full: { alignSelf: 'stretch' },
  clear: { backgroundColor: 'transparent' },
  label: { fontFamily: fontFamily.SemiBold },
});
