import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, BottomSheet, Choice, ListRow, Page, ReminderTiming } from '../../components';
import { formatClock } from '../../lib/dates';
import { setOnboarding, useOnboarding } from '../../state/onboarding';
import { color, radius } from '../../theme';

const TIMES = ['07:00', '08:00', '09:00', '12:00', '18:00', '20:00', '21:00'];

// G3 Reminders. Changes apply right away. The permission prompt, the "notifications are off"
// state (G4) and the scheduled notification arrive with the notification work in step 9.
export default function Reminders() {
  const { reminder } = useOnboarding();
  const [picking, setPicking] = useState(false);
  const update = (patch: Partial<typeof reminder>) => setOnboarding({ reminder: { ...reminder, ...patch } });

  return (
    <Page title="Reminders" onBack={router.back}>
      <View style={styles.card}>
        <ListRow
          title="Period reminder"
          subtitle="Before your estimated start date"
          icon="bell-ring"
          trailing="Toggle"
          toggled={reminder.enabled}
          onToggle={(v) => update({ enabled: v })}
        />
      </View>

      {reminder.enabled ? (
        <>
          <ReminderTiming value={reminder.daysBefore} onChange={(n) => update({ daysBefore: n })} />
          <View style={styles.card}>
            <ListRow title="Remind me at" icon="clock" trailing="Value" value={formatClock(reminder.time)} onPress={() => setPicking(true)} />
          </View>
        </>
      ) : null}

      <Banner message="This is the only reminder Period sends. No marketing notifications." />

      <BottomSheet visible={picking} title="Remind me at" onClose={() => setPicking(false)}>
        <View style={styles.times} accessibilityRole="radiogroup">
          {TIMES.map((t) => (
            <Choice
              key={t}
              label={formatClock(t)}
              selected={reminder.time === t}
              onPress={() => {
                update({ time: t });
                setPicking(false);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'], overflow: 'hidden' },
  times: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
});
