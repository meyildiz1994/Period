import { StyleSheet, Text, View } from 'react-native';

import { color, type } from '../theme';
import { Stepper } from './Controls';

// Label column + day Stepper, used for cycle and period length (A4, G2).
export function LengthRow({ title, subtitle, hint, value, min, max, onChange }: {
  title: string; subtitle: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{subtitle}</Text>
        {hint ? <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{hint}</Text> : null}
      </View>
      <Stepper value={value} unit="days" min={min} max={max} onChange={onChange} />
    </View>
  );
}

/** Allowed ranges for the steppers. */
export const CYCLE_RANGE = { min: 15, max: 60 } as const;
export const PERIOD_RANGE = { min: 1, max: 14 } as const;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 20 },
});
