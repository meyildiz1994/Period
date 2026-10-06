import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Page } from '../../components';
import { color, type } from '../../theme';

const ITEMS = [
  ['Using Period', 'Period is a personal log. Estimates are based on what you enter.'],
  ['Not medical advice', 'Nothing in the app replaces advice from a healthcare professional.'],
  ['Your account', 'Keep your sign-in details private. You can delete your account at any time.'],
  ['Changes', 'If these terms change, we’ll tell you in the app first.'],
] as const;

// G9 Terms of service.
export default function Terms() {
  return (
    <Page title="Terms of service" onBack={router.back}>
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>Last updated November 1, 2026</Text>
      <Banner kind="Warning" title="Not for contraception" message="Estimates are not a reliable way to prevent pregnancy. Don’t use Period for contraception." />
      {ITEMS.map(([title, body], i) => (
        <View key={title} style={styles.item}>
          <View style={styles.number}>
            <Text style={[type('Body/Medium', 'Medium'), { color: color['text/brand'] }]}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Text accessibilityRole="header" style={[type('Body/Large', 'SemiBold'), { color: color['text/primary'] }]}>{title}</Text>
            <Text style={[type('Body/Medium'), { color: color['text/secondary'] }]}>{body}</Text>
          </View>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  number: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: color['surface/muted'] },
});
