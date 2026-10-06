import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components';
import { resetOnboarding, useOnboarding } from '../state/onboarding';
import { color, layout, type } from '../theme';

// Temporary landing after onboarding. Replaced by B1 Home in step 4.
export default function HomePlaceholder() {
  const s = useOnboarding();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={[type('Title/Large', 'Bold'), { color: color['text/primary'] }]}>Home</Text>
        <Text style={[type('Body/Default'), { color: color['text/secondary'] }]}>
          Home arrives in step 4. Onboarding saved: last period {s.lastPeriodStart ?? 'not set'}, cycle {s.cycleLength} days,
          period {s.periodLength} days, {s.symptoms.length} symptoms, reminder {s.reminder.enabled ? `${s.reminder.daysBefore} day(s) before` : 'off'}.
        </Text>
        <Button label="See components" type="Secondary" size="Medium" onPress={() => router.push('/gallery')} />
        <Button label="See tokens" type="Secondary" size="Medium" onPress={() => router.push('/tokens')} />
        <Button
          label="Restart onboarding"
          type="Ghost"
          size="Medium"
          onPress={() => {
            resetOnboarding();
            router.replace('/');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color['bg/canvas'] },
  content: { padding: layout.gutter, gap: 12 },
});
