import { StyleSheet, Text, View } from 'react-native';

import { defineCopy, useCopy } from '../i18n';
import { color, overline, radius, type } from '../theme';
import { Choice } from './Controls';
import { IconBadge } from './Display';

export type ReminderLead = 1 | 2 | 3;
const LEADS: ReminderLead[] = [1, 2, 3];

const COPY = defineCopy({
  en: {
    remindMe: 'Remind me',
    previewLabel: 'Preview',
    lead: (n: ReminderLead) => (n === 1 ? '1 day before' : `${n} days before`),
    preview: (n: ReminderLead) => (n === 1 ? 'Your period may start tomorrow' : `Your period may start in ${n} days`),
  },
  tr: {
    remindMe: 'Bana hatırlat',
    previewLabel: 'Önizleme',
    lead: (n: ReminderLead) => `${n} gün önce`,
    preview: (n: ReminderLead) => (n === 1 ? 'Adetin yarın başlayabilir' : `Adetin ${n} gün içinde başlayabilir`),
  },
});

// "Remind me" lead-time chips with a preview of the notification text (A6, G3).
export function ReminderTiming({ value, onChange }: { value: ReminderLead; onChange: (n: ReminderLead) => void }) {
  const c = useCopy(COPY);
  return (
    <View style={styles.card}>
      <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{c.remindMe}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup">
        {LEADS.map((n) => <Choice key={n} label={c.lead(n)} selected={value === n} onPress={() => onChange(n)} />)}
      </View>
      <View style={styles.divider} />
      <View style={styles.preview}>
        <IconBadge icon="bell" />
        <View style={{ flex: 1 }}>
          <Text style={[overline(12), { color: color['text/tertiary'] }]}>{c.previewLabel}</Text>
          <Text style={[type('Body/Medium'), { color: color['text/primary'] }]}>{c.preview(value)}</Text>
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
