import { router } from 'expo-router';

import { Button, OnboardingStep, ReminderTiming } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { requestNotificationAccess } from '../../lib/notifications';
import { setOnboarding, useOnboarding } from '../../state/onboarding';

const COPY = defineCopy({
  en: {
    title: 'Get a heads-up before your period',
    body: 'One quiet reminder before your estimated start date. It stays off unless you turn it on.',
    turnOn: 'Turn on reminders',
    notNow: 'Not now',
  },
  tr: {
    title: 'Adetinden önce haber al',
    body: 'Tahmini başlangıç tarihinden önce tek, sakin bir hatırlatıcı. Sen açmadıkça kapalı kalır.',
    turnOn: 'Hatırlatıcıları aç',
    notNow: 'Şimdi değil',
  },
});

// A6 · Step 5 of 5. Off unless the user turns it on; "Turn on reminders" asks for permission
// and keeps the reminder off if it's declined (Reminders in Me shows how to fix that).
export default function RemindersStep() {
  const { reminder } = useOnboarding();
  const c = useCopy(COPY);
  const finish = async (wanted: boolean) => {
    const access = wanted ? await requestNotificationAccess() : null;
    setOnboarding({ reminder: { ...reminder, enabled: access === 'granted' || access === 'unsupported' } });
    router.push('/onboarding/done');
  };

  return (
    <OnboardingStep
      step={5}
      title={c.title}
      body={c.body}
      onBack={router.back}
      footer={
        <>
          <Button label={c.turnOn} iconLeft="bell" fullWidth onPress={() => finish(true)} />
          <Button label={c.notNow} type="Ghost" fullWidth onPress={() => finish(false)} />
        </>
      }
    >
      <ReminderTiming value={reminder.daysBefore} onChange={(n) => setOnboarding({ reminder: { ...reminder, daysBefore: n } })} />
    </OnboardingStep>
  );
}
