import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, DateWheel, Icon, OnboardingStep } from '../../components';
import { fromISODate, getOnboarding, setOnboarding, toISODate } from '../../state/onboarding';
import { color, type } from '../../theme';

// A3 · Step 2 of 5. Defaults to today; the wheel never lists future dates.
export default function LastPeriodStep() {
  const today = new Date();
  const saved = getOnboarding().lastPeriodStart;
  const [date, setDate] = useState(() => (saved ? fromISODate(saved) : today));
  const next = () => router.push('/onboarding/cycle');

  return (
    <OnboardingStep
      step={2}
      title="When did your last period start?"
      body="Pick the first day of bleeding. An estimate is fine."
      onBack={router.back}
      onSkip={next}
      footer={
        <Button
          label="Continue"
          fullWidth
          onPress={() => {
            setOnboarding({ lastPeriodStart: toISODate(date) });
            next();
          }}
        />
      }
    >
      <Card style={styles.card}>
        <DateWheel value={date} onChange={setDate} max={today} minYear={today.getFullYear() - 2} />
        <View style={styles.hint}>
          <Icon name="info" size={16} color="text/secondary" />
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>Future dates can’t be selected.</Text>
        </View>
      </Card>
      <View style={styles.forgot}>
        <Button
          label="I don’t remember"
          type="Ghost"
          size="Medium"
          style={{ alignSelf: 'center' }}
          onPress={() => {
            setOnboarding({ lastPeriodStart: null });
            next();
          }}
        />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 12, borderWidth: 1, borderColor: color['border/subtle'] },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  forgot: { alignItems: 'center', marginTop: 16 },
});
