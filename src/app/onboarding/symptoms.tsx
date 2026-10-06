import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Banner, Button, Choice, OnboardingStep } from '../../components';
import { setOnboarding, useOnboarding } from '../../state/onboarding';
import { SYMPTOMS } from '../../state/symptoms';

// A5 · Step 4 of 5. Multi-select.
export default function SymptomsStep() {
  const { symptoms } = useOnboarding();
  const toggle = (s: string) =>
    setOnboarding({ symptoms: symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s] });
  const next = () => router.push('/onboarding/reminders');

  return (
    <OnboardingStep
      step={4}
      title="What do you often notice?"
      body="Pick any that apply. They become quick options in your daily log."
      onBack={router.back}
      onSkip={next}
      footer={<Button label="Continue" fullWidth onPress={next} />}
    >
      <View style={styles.chips}>
        {SYMPTOMS.map((s) => (
          <Choice key={s.label} label={s.label} icon={s.icon} selected={symptoms.includes(s.label)} onPress={() => toggle(s.label)} />
        ))}
      </View>
      <View style={{ marginTop: 28 }}>
        <Banner message="Choosing a symptom doesn’t log it. You decide what to record each day." />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
