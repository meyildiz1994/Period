import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, DateWheel, Icon, OnboardingStep } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { fromISODate, toISODate } from '../../lib/dates';
import { getOnboarding, setOnboarding } from '../../state/onboarding';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'When did your last period start?',
    body: 'Pick the first day of bleeding. An estimate is fine.',
    continue: 'Continue',
    future: 'Future dates can’t be selected.',
    forgot: 'I don’t remember',
  },
  tr: {
    title: 'Son adetin ne zaman başladı?',
    body: 'Kanamanın ilk gününü seç. Tahmini bir tarih de olur.',
    continue: 'Devam',
    future: 'Gelecekteki tarihler seçilemez.',
    forgot: 'Hatırlamıyorum',
  },
});

// A3 · Step 3 of 6. Defaults to today; the wheel never lists future dates.
export default function LastPeriodStep() {
  const c = useCopy(COPY);
  const today = new Date();
  const saved = getOnboarding().lastPeriodStart;
  const [date, setDate] = useState(() => (saved ? fromISODate(saved) : today));
  const next = () => router.push('/onboarding/cycle');

  return (
    <OnboardingStep
      step={3}
      title={c.title}
      body={c.body}
      onBack={router.back}
      onSkip={next}
      footer={
        <Button
          label={c.continue}
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
          <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{c.future}</Text>
        </View>
      </Card>
      <View style={styles.forgot}>
        <Button
          label={c.forgot}
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
