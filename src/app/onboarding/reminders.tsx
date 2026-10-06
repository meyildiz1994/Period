import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Choice, IconBadge, OnboardingStep } from '../../components';
import { setOnboarding, useOnboarding, type ReminderLead } from '../../state/onboarding';
import { color, overline, type } from '../../theme';

const LEADS: ReminderLead[] = [1, 2, 3];
const lead = (n: ReminderLead) => (n === 1 ? '1 day before' : `${n} days before`);
const preview = (n: ReminderLead) => (n === 1 ? 'Your period may start tomorrow' : `Your period may start in ${n} days`);

// A6 · Step 5 of 5. Off unless the user turns it on. The system permission prompt and the
// scheduled local notification come with the data layer in step 9.
export default function RemindersStep() {
  const { reminder } = useOnboarding();
  const finish = (enabled: boolean) => {
    setOnboarding({ reminder: { ...reminder, enabled } });
    router.push('/onboarding/done');
  };

  return (
    <OnboardingStep
      step={5}
      title="Get a heads-up before your period"
      body="One quiet reminder before your estimated start date. It stays off unless you turn it on."
      onBack={router.back}
      footer={
        <>
          <Button label="Turn on reminders" iconLeft="bell" fullWidth onPress={() => finish(true)} />
          <Button label="Not now" type="Ghost" fullWidth onPress={() => finish(false)} />
        </>
      }
    >
      <Card padded={false} style={styles.card}>
        <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>Remind me</Text>
        <View style={styles.chips} accessibilityRole="radiogroup">
          {LEADS.map((n) => (
            <Choice key={n} label={lead(n)} selected={reminder.daysBefore === n} onPress={() => setOnboarding({ reminder: { ...reminder, daysBefore: n } })} />
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.preview}>
          <IconBadge icon="bell" />
          <View style={{ flex: 1 }}>
            <Text style={[overline(12), { color: color['text/tertiary'] }]}>Preview</Text>
            <Text style={[type('Body/Medium'), { color: color['text/primary'] }]}>{preview(reminder.daysBefore)}</Text>
          </View>
        </View>
      </Card>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, borderWidth: 1, borderColor: color['border/subtle'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  divider: { height: 1, marginVertical: 16, backgroundColor: color['surface/divider'] },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
