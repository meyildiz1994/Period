import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, OnboardingStep, Radio, Stepper } from '../../components';
import { setOnboarding, useOnboarding, type Regularity } from '../../state/onboarding';
import { color, type } from '../../theme';

const REGULARITY: { id: Regularity; title: string; subtitle: string }[] = [
  { id: 'regular', title: 'Regular', subtitle: 'Varies by a few days' },
  { id: 'irregular', title: 'Irregular', subtitle: 'Varies by a week or more' },
  { id: 'unsure', title: 'Not sure', subtitle: 'We’ll learn from your logs' },
];

// A4 · Step 3 of 5. Starts from common defaults (28 / 5).
export default function CycleStep() {
  const { cycleLength, periodLength, regularity } = useOnboarding();
  const next = () => router.push('/onboarding/symptoms');

  return (
    <OnboardingStep
      step={3}
      title="Your usual cycle"
      body="We start with common defaults. Change them if you know your numbers."
      onBack={router.back}
      onSkip={next}
      footer={<Button label="Continue" fullWidth onPress={next} />}
    >
      <Card padded={false} style={styles.card}>
        <LengthRow
          title="Cycle length"
          subtitle="First day of one period to the next"
          hint="Most cycles are 21–35 days"
          value={cycleLength}
          min={15}
          max={60}
          onChange={(v) => setOnboarding({ cycleLength: v })}
        />
        <View style={styles.divider} />
        <LengthRow
          title="Period length"
          subtitle="Days of bleeding"
          hint="Usually 3–7 days"
          value={periodLength}
          min={1}
          max={14}
          onChange={(v) => setOnboarding({ periodLength: v })}
        />
      </Card>

      <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), styles.section]}>Is your cycle regular?</Text>
      <Card padded={false} style={[styles.card, styles.radioCard]}>
        <View accessibilityRole="radiogroup">
          {REGULARITY.map((r, i) => (
            <View key={r.id}>
              {i > 0 ? <View style={styles.radioDivider} /> : null}
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={`${r.title}. ${r.subtitle}`}
                accessibilityState={{ selected: regularity === r.id }}
                onPress={() => setOnboarding({ regularity: r.id })}
                style={styles.radioRow}
              >
                <Radio selected={regularity === r.id} />
                <View style={{ flex: 1 }}>
                  <Text style={[type('Body/Medium', 'Medium'), { color: color['text/primary'] }]}>{r.title}</Text>
                  <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{r.subtitle}</Text>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </Card>
    </OnboardingStep>
  );
}

function LengthRow({ title, subtitle, hint, value, min, max, onChange }: {
  title: string; subtitle: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <View style={styles.lengthRow}>
      <View style={{ flex: 1 }}>
        <Text style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
        <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{subtitle}</Text>
        <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{hint}</Text>
      </View>
      <Stepper value={value} unit="days" min={min} max={max} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: color['border/subtle'] },
  lengthRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 20, paddingVertical: 20 },
  divider: { height: 1, marginHorizontal: 20, backgroundColor: color['surface/divider'] },
  section: { marginTop: 24, marginBottom: 12, color: color['text/primary'] },
  radioCard: { paddingVertical: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 56 },
  radioDivider: { height: 1, marginHorizontal: 16, backgroundColor: color['surface/divider'] },
});
