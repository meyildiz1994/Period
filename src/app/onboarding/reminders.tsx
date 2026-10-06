import { router } from 'expo-router';

import { Button, OnboardingStep, ReminderTiming } from '../../components';
import { requestNotificationAccess } from '../../lib/notifications';
import { setOnboarding, useOnboarding } from '../../state/onboarding';

// A6 · Step 5 of 5. Off unless the user turns it on; "Turn on reminders" asks for permission
// and keeps the reminder off if it's declined (Reminders in Me shows how to fix that).
export default function RemindersStep() {
  const { reminder } = useOnboarding();
  const finish = async (wanted: boolean) => {
    const access = wanted ? await requestNotificationAccess() : null;
    setOnboarding({ reminder: { ...reminder, enabled: access === 'granted' || access === 'unsupported' } });
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
      <ReminderTiming value={reminder.daysBefore} onChange={(n) => setOnboarding({ reminder: { ...reminder, daysBefore: n } })} />
    </OnboardingStep>
  );
}
