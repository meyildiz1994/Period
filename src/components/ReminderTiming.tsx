import { StyleSheet, Text, View } from 'react-native';

import { color, overline, radius, type } from '../theme';
import { Choice } from './Controls';
import { IconBadge } from './Display';

export type ReminderLead = 1 | 2 | 3;
const LEADS: ReminderLead[] = [1, 2, 3];
const lead = (n: ReminderLead) => (n === 1 ? '1 day before' : `${n} days before`);
const preview = (n: ReminderLead) => (n === 1 ? 'Your period may start tomorrow' : `Your period may start in ${n} days`);

// "Remind me" lead-time chips with a preview of the notification text (A6, G3).
export function ReminderTiming({ value, onChange }: { value: ReminderLead; onChange: (n: ReminderLead) => void }) {
  return (
    <View style={styles.card}>
      <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>Remind me</Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {LEADS.map((n) => <Choice key={n} label={lead(n)} selected={value === n} onPress={() => onChange(n)} />)}
      </View>
      <View style={styles.divider} />
      <View style={styles.preview}>
        <IconBadge icon="bell" />
        <View style={{ flex: 1 }}>
          <Text style={[overline(12), { color: color['text/tertiary'] }]}>Preview</Text>
          <Text style={[type('Body/Medium'), { color: color['text/primary'] }]}>{preview(value)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  divider: { height: 1, marginVertical: 16, backgroundColor: color['surface/divider'] },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
