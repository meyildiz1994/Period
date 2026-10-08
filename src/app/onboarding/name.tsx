import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, Input, OnboardingStep } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { cleanName, NAME_MAX } from '../../state/name';
import { getOnboarding, setOnboarding } from '../../state/onboarding';

const COPY = defineCopy({
  en: {
    title: 'What should we call you?',
    body: 'We’ll greet you by name on Home.',
    label: 'Your name',
    placeholder: 'First name or nickname',
    helper: 'Only kept on this phone.',
    continue: 'Continue',
  },
  tr: {
    title: 'Sana nasıl seslenelim?',
    body: 'Ana sayfada seni adınla karşılayacağız.',
    label: 'Adın',
    placeholder: 'Adın ya da takma adın',
    helper: 'Sadece bu telefonda kalır.',
    continue: 'Devam',
  },
});

// Step 1 of 6 (user's call): the name for the Home greeting and avatar. Required, so Home is
// never reached without one; it can be changed later in Me.
export default function NameStep() {
  const c = useCopy(COPY);
  // `then=home`: asked on its own for someone who finished onboarding before this step existed.
  const { then } = useLocalSearchParams<{ then?: string }>();
  const alone = then === 'home';
  const [name, setName] = useState(() => getOnboarding().name ?? '');
  const clean = cleanName(name);
  const next = () => {
    if (!clean) return;
    setOnboarding({ name: clean });
    if (alone) router.replace('/home');
    else router.push('/onboarding/goal');
  };
  return (
    <OnboardingStep
      step={alone ? 0 : 1}
      title={c.title}
      body={c.body}
      onBack={alone ? undefined : router.back}
      footer={<Button label={c.continue} fullWidth disabled={!clean} onPress={next} />}
    >
      <Input
        label={c.label}
        placeholder={c.placeholder}
        helper={c.helper}
        value={name}
        onChangeText={setName}
        maxLength={NAME_MAX}
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        onSubmitEditing={next}
      />
    </OnboardingStep>
  );
}
