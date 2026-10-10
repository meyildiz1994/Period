import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { color, fontFamily, type } from '../theme';
import type { IconName } from '../theme/icons';
import { Icon } from './Icon';

const COPY = defineCopy({
  en: {
    placeholder: 'Add a note about how you feel today',
    note: 'Note',
    tooLong: (max: number) => `Notes can be up to ${max} characters.`,
  },
  tr: {
    placeholder: 'Bugün nasıl hissettiğine dair bir not ekle',
    note: 'Not',
    tooLong: (max: number) => `Notlar en fazla ${max} karakter olabilir.`,
  },
});

// Figma: Input (State: Default, Focused, Filled, Error, Disabled). Label always visible above the field.
type InputProps = Omit<TextInputProps, 'style' | 'editable'> & {
  label: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
  /** Makes the right icon a button (e.g. show/hide a password); `iconRightLabel` names it. */
  onIconRight?: () => void;
  iconRightLabel?: string;
  /** Pill field with the label as its placeholder (Welcome sign-in); screen readers still hear it. */
  pill?: boolean;
};

export function Input({ label, helper, error, disabled, iconLeft, iconRight, onIconRight, iconRightLabel, pill, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? color['feedback/danger'] : focused ? color['border/focus'] : color['border/subtle'];
  const message = error ?? helper;
  return (
    <View style={styles.wrap}>
      {pill ? null : <Text style={[type('Body/Small', 'Medium'), { color: color[disabled ? 'text/disabled' : 'text/secondary'] }]}>{label}</Text>}
      <View style={[styles.field, pill && styles.pill, { borderColor, borderWidth: error || focused ? 2 : 1, backgroundColor: color[disabled ? 'surface/subtle' : 'surface/default'] }]}>
        {iconLeft ? <Icon name={iconLeft} size={20} color={error ? 'feedback/danger' : disabled ? 'text/disabled' : 'text/secondary'} /> : null}
        <TextInput
          {...rest}
          placeholder={rest.placeholder ?? (pill ? label : undefined)}
          accessibilityLabel={label}
          editable={!disabled}
          placeholderTextColor={color['text/tertiary']}
          selectionColor={color['border/focus']}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[styles.input, { color: color[disabled ? 'text/tertiary' : 'text/primary'] }]}
        />
        {iconRight && onIconRight ? (
          <Pressable accessibilityRole="button" accessibilityLabel={iconRightLabel} onPress={onIconRight} hitSlop={12}>
            <Icon name={iconRight} size={20} color="text/secondary" />
          </Pressable>
        ) : iconRight ? (
          <Icon name={iconRight} size={20} color="text/secondary" />
        ) : null}
      </View>
      {message ? (
        <View style={styles.helper}>
          <Icon name={error ? 'alert-circle' : 'info'} size={16} color={error ? 'feedback/danger' : 'text/secondary'} />
          <Text style={[type('Caption'), { flex: 1, color: color[error ? 'feedback/danger' : 'text/secondary'] }]}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

// Figma: Text Area (State: Default, Filled, Error). Multi-line note with a live character count.
export function TextArea({ value, onChangeText, placeholder, max = 250 }: {
  value: string; onChangeText: (v: string) => void; placeholder?: string; max?: number;
}) {
  const c = useCopy(COPY);
  const over = value.length > max;
  return (
    <View style={styles.wrap}>
      <View style={[styles.area, { borderColor: color[over ? 'feedback/danger' : 'border/subtle'], borderWidth: over ? 2 : 1 }]}>
        <TextInput
          multiline
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? c.placeholder}
          accessibilityLabel={c.note}
          placeholderTextColor={color['text/tertiary']}
          selectionColor={color['border/focus']}
          style={[styles.areaInput, { color: color['text/primary'] }]}
        />
        <Text style={[type('Footnote'), { textAlign: 'right', color: color[over ? 'feedback/danger' : 'text/tertiary'] }]}>
          {value.length}/{max}
        </Text>
      </View>
      {over ? (
        <View style={styles.helper}>
          <Icon name="alert-circle" size={16} color="feedback/danger" />
          <Text style={[type('Caption'), { flex: 1, color: color['feedback/danger'] }]}>{c.tooLong(max)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, alignSelf: 'stretch' },
  field: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, gap: 12, borderRadius: 16 },
  pill: { borderRadius: 999, paddingHorizontal: 20 },
  input: { flex: 1, fontFamily: fontFamily.Regular, fontSize: 16, paddingVertical: 0 },
  helper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  area: { height: 132, padding: 16, gap: 8, borderRadius: 16, backgroundColor: color['surface/default'], justifyContent: 'space-between' },
  areaInput: { flex: 1, fontFamily: fontFamily.Regular, fontSize: 15, lineHeight: 22, textAlignVertical: 'top', padding: 0 },
});
