import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Banner, Button, Choice, OnboardingStep } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { useCommon } from '../../i18n/common';
import { setOnboarding, useOnboarding } from '../../state/onboarding';
import { SYMPTOMS } from '../../state/symptoms';

const COPY = defineCopy({
  en: {
    title: 'What do you often notice?',
    body: 'Pick any that apply. They become quick options in your daily log.',
    continue: 'Continue',
    note: 'Choosing a symptom doesn’t log it. You decide what to record each day.',
  },
  tr: {
    title: 'Sıklıkla neler fark ediyorsun?',
    body: 'Uyanların hepsini seç. Günlük kaydında hızlı seçenek olarak çıkarlar.',
    continue: 'Devam',
    note: 'Bir belirtiyi seçmek onu kaydetmez. Her gün neyi kaydedeceğine sen karar verirsin.',
  },
});

// A5 · Step 4 of 5. Multi-select.
export default function SymptomsStep() {
  const { symptoms } = useOnboarding();
  const c = useCopy(COPY);
  const common = useCommon();
  const toggle = (s: string) =>
    setOnboarding({ symptoms: symptoms.includes(s) ? symptoms.filter((x) => x !== s) : [...symptoms, s] });
  const next = () => router.push('/onboarding/reminders');

  return (
    <OnboardingStep
      step={4}
      title={c.title}
      body={c.body}
      onBack={router.back}
      onSkip={next}
      footer={<Button label={c.continue} fullWidth onPress={next} />}
    >
      <View style={styles.chips}>
        {SYMPTOMS.map((s) => (
          <Choice key={s.label} label={common.symptom[s.label] ?? s.label} icon={s.icon} selected={symptoms.includes(s.label)} onPress={() => toggle(s.label)} />
        ))}
      </View>
      <View style={{ marginTop: 28 }}>
        <Banner message={c.note} />
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
