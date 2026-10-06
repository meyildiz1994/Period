import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Page } from '../../components';
import { color, type } from '../../theme';

const SECTIONS = [
  ['What we collect', 'Only what you log: period dates, flow, pain, mood, symptoms and notes. Nothing else.'],
  ['Where it lives', 'On this phone only. There’s no account or cloud backup, so nothing leaves your phone unless you export it.'],
  ['What we never do', 'We don’t sell your data, show ads or share logs with anyone.'],
  ['Your control', 'Export or delete everything at any time in Your data.'],
] as const;

// G8 Privacy policy.
export default function Privacy() {
  return (
    <Page
      title="Privacy policy"
      onBack={router.back}
      footer={<Button label="Go to Your data" type="Secondary" fullWidth onPress={() => router.push('/data')} />}
    >
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>Last updated November 1, 2026</Text>
      {SECTIONS.map(([title, body]) => (
        <View key={title} style={styles.section}>
          <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
          <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{body}</Text>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
});
