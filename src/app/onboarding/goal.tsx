import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, OnboardingStep, OptionCard } from '../../components';
import { setOnboarding, useOnboarding, type Goal } from '../../state/onboarding';
import type { IconName } from '../../theme';

const GOALS: { id: Goal; title: string; subtitle: string; icon: IconName }[] = [
  { id: 'track', title: 'Track my cycle', subtitle: 'Keep a simple record of every period', icon: 'heart' },
  { id: 'predict', title: 'Know when my period is coming', subtitle: 'Get an estimate based on your history', icon: 'calendar' },
  { id: 'symptoms', title: 'Understand my symptoms', subtitle: 'Spot patterns in how you feel', icon: 'lotus' },
  { id: 'irregular', title: 'Track an irregular cycle', subtitle: 'See how much your cycle length varies', icon: 'activity' },
];

// A2 · Step 1 of 5.
export default function GoalStep() {
  const { goal } = useOnboarding();
  const next = () => router.push('/onboarding/last-period');
  return (
    <OnboardingStep
      step={1}
      title="What brings you to Nilemy?"
      body="Choose what matters most. You can change this later."
      onBack={router.back}
      onSkip={next}
      footer={<Button label="Continue" fullWidth disabled={!goal} onPress={next} />}
    >
      <View style={{ gap: 12 }} accessibilityRole="radiogroup">
        {GOALS.map((g) => (
          <OptionCard key={g.id} title={g.title} subtitle={g.subtitle} icon={g.icon} selected={goal === g.id} onPress={() => setOnboarding({ goal: g.id })} />
        ))}
      </View>
    </OnboardingStep>
  );
}
