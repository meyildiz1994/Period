import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { defineCopy, useCopy } from '../i18n';
import { color, type } from '../theme';
import { KeypadKey, PasscodeDot } from './Cycle';
import { LogoMark } from './Logo';

export const PASSCODE_LENGTH = 4;
const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']];

const COPY = defineCopy({
  en: { entered: (n: number, of: number) => `${n} of ${of} digits entered`, delete: 'Delete' },
  tr: { entered: (n: number, of: number) => `${of} rakamdan ${n} tanesi girildi`, delete: 'Sil' },
});

// G6 layout: mark, title, subtitle (or error), four dots and the keypad. Used for the lock
// screen and for setting or changing the passcode.
export function PasscodePad({ title, subtitle, error, entered, disabled, onDigit, onDelete, header, footer }: {
  title: string;
  subtitle: string;
  error?: boolean;
  entered: number;
  disabled?: boolean;
  onDigit: (d: string) => void;
  onDelete: () => void;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const c = useCopy(COPY);
  const press = (d: string) => () => !disabled && onDigit(d);
  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
      {header}
      <View style={styles.top}>
        <View style={styles.mark}>
          <LogoMark size={56} />
        </View>
        <Text accessibilityRole="header" style={[type('Title/Small', 'Bold'), { color: color['text/primary'] }]}>{title}</Text>
        <Text accessibilityLiveRegion="polite" style={[type('Body/Medium'), styles.subtitle, { color: color[error ? 'feedback/danger' : 'text/secondary'] }]}>
          {subtitle}
        </Text>
        <View style={styles.dots} accessible accessibilityLabel={c.entered(entered, PASSCODE_LENGTH)}>
          {Array.from({ length: PASSCODE_LENGTH }, (_, i) => (
            <PasscodeDot key={i} state={error ? 'Error' : i < entered ? 'Filled' : 'Empty'} />
          ))}
        </View>
      </View>
      <View style={[styles.keypad, disabled && { opacity: 0.4 }]}>
        {ROWS.map((row) => (
          <View key={row[0]} style={styles.keyRow}>
            {row.map((d) => <KeypadKey key={d} digit={d} onPress={press(d)} />)}
          </View>
        ))}
        <View style={styles.keyRow}>
          <KeypadKey />
          <KeypadKey digit="0" onPress={press('0')} />
          <KeypadKey icon="delete-left" label={c.delete} onPress={() => !disabled && onDelete()} />
        </View>
      </View>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color['bg/canvas'] },
  top: { alignItems: 'center', gap: 12, marginTop: 40, paddingHorizontal: 24 },
  mark: { marginBottom: 4 },
  subtitle: { textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 20, marginTop: 16 },
  keypad: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  keyRow: { flexDirection: 'row', gap: 24 },
  footer: { minHeight: 64, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});
