import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, IconBadge, OnboardingStep } from '../../components';
import { savePeriod } from '../../state/log';
import { getOnboarding, setOnboarding } from '../../state/onboarding';
import { color, type, type IconName } from '../../theme';

const POINTS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'smartphone', title: 'Saved on this phone', body: 'Your logs never leave this phone unless you export them.' },
  { icon: 'download', title: 'Export anytime', body: 'Download a copy of your logs from Your data.' },
  { icon: 'shield-check', title: 'Never sold or shared', body: 'No ads and no selling of your data.' },
];

// A7 All set. Ends onboarding and replaces the stack with Home.
export default function Done() {
  return (
    <OnboardingStep
      step={5}
      done
      hero={<IconBadge icon="check" tone="Brand" size={64} />}
      title="You’re all set"
      body="Here’s how Period handles what you log."
      footer={
        <Button
          label="Go to Home"
          fullWidth
          onPress={() => {
            const { lastPeriodStart } = getOnboarding();
            if (lastPeriodStart) savePeriod({ start: lastPeriodStart, end: null });
            setOnboarding({ done: true });
            router.replace('/home');
          }}
        />
      }
    >
      <Card padded={false} style={styles.card}>
        {POINTS.map((p) => (
          <View key={p.title} style={styles.row}>
            <IconBadge icon={p.icon} />
            <View style={{ flex: 1 }}>
              <Text style={[type('Body/Medium', 'SemiBold'), { color: color['text/primary'] }]}>{p.title}</Text>
              <Text style={[type('Body/Small'), { color: color['text/secondary'] }]}>{p.body}</Text>
            </View>
          </View>
        ))}
      </Card>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  card: { padding: 20, gap: 20, borderWidth: 1, borderColor: color['border/subtle'] },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
