import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, OnboardingStep, OptionCard } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { setOnboarding, useOnboarding, type Goal } from '../../state/onboarding';
import type { IconName } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'What brings you to Nilemy?',
    body: 'Choose what matters most. You can change this later.',
    continue: 'Continue',
    goals: {
      track: { title: 'Track my cycle', subtitle: 'Keep a simple record of every period' },
      predict: { title: 'Know when my period is coming', subtitle: 'Get an estimate based on your history' },
      symptoms: { title: 'Understand my symptoms', subtitle: 'Spot patterns in how you feel' },
      irregular: { title: 'Track an irregular cycle', subtitle: 'See how much your cycle length varies' },
    } as Record<Goal, { title: string; subtitle: string }>,
  },
  tr: {
    title: 'Nilemy’yi ne için kullanacaksın?',
    body: 'Senin için en önemlisini seç. Bunu sonra değiştirebilirsin.',
    continue: 'Devam',
    goals: {
      track: { title: 'Döngümü takip etmek', subtitle: 'Her adetini basitçe kaydet' },
      predict: { title: 'Adetimin ne zaman geleceğini bilmek', subtitle: 'Geçmişine göre tahmini bir tarih gör' },
      symptoms: { title: 'Belirtilerimi anlamak', subtitle: 'Nasıl hissettiğindeki örüntüleri fark et' },
      irregular: { title: 'Düzensiz döngümü takip etmek', subtitle: 'Döngü sürenin ne kadar değiştiğini gör' },
    },
  },
});

const GOALS: { id: Goal; icon: IconName }[] = [
  { id: 'track', icon: 'heart' },
  { id: 'predict', icon: 'calendar' },
  { id: 'symptoms', icon: 'lotus' },
  { id: 'irregular', icon: 'activity' },
];

// A2 · Step 1 of 5.
export default function GoalStep() {
  const { goal } = useOnboarding();
  const c = useCopy(COPY);
  const next = () => router.push('/onboarding/last-period');
  return (
    <OnboardingStep
      step={1}
      title={c.title}
      body={c.body}
      onBack={router.back}
      onSkip={next}
      footer={<Button label={c.continue} fullWidth disabled={!goal} onPress={next} />}
    >
      <View style={{ gap: 12 }} accessibilityRole="radiogroup">
        {GOALS.map((g) => (
          <OptionCard key={g.id} title={c.goals[g.id].title} subtitle={c.goals[g.id].subtitle} icon={g.icon} selected={goal === g.id} onPress={() => setOnboarding({ goal: g.id })} />
        ))}
      </View>
    </OnboardingStep>
  );
}
