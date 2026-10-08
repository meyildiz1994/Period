import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Banner, Divider, ListRow, LogoMark, Page } from '../../components';
import { APP_VERSION } from '../../lib/app';
import { color, radius, type } from '../../theme';

const SUPPORT = 'help@period.app';

// G7 About Period.
export default function About() {
  return (
    <Page title="About Period" onBack={router.back}>
      <View style={[styles.card, styles.hero]}>
        <LogoMark size={64} />
        <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>Period</Text>
        <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>Version {APP_VERSION}</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>
          A calm way to track your cycle. Track, understand, manage.
        </Text>
      </View>
      <View style={[styles.card, { overflow: 'hidden' }]}>
        <ListRow title="Privacy policy" icon="shield" onPress={() => router.push('/about/privacy')} />
        <Divider inset={0} />
        <ListRow title="Terms of service" icon="file-text" onPress={() => router.push('/about/terms')} />
        <Divider inset={0} />
        <ListRow title="Contact support" subtitle={SUPPORT} icon="mail" onPress={() => Linking.openURL(`mailto:${SUPPORT}`).catch(() => {})} />
      </View>
      <Banner message="Period isn’t a medical device. Talk to a doctor about anything that worries you." />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 24, paddingHorizontal: 24 },
  center: { textAlign: 'center' },
});
