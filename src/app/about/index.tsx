import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { Banner, Divider, ListRow, LogoMark, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { APP_VERSION } from '../../lib/app';
import { color, radius, type } from '../../theme';

const SUPPORT = 'help@nilemy.app';

const COPY = defineCopy({
  en: {
    title: 'About Nilemy',
    version: (v: string) => `Version ${v}`,
    tagline: 'A calm way to track your cycle. Track, understand, manage.',
    privacy: 'Privacy policy',
    terms: 'Terms of service',
    support: 'Contact support',
    notMedical: 'Nilemy isn’t a medical device. Talk to a doctor about anything that worries you.',
  },
  tr: {
    title: 'Nilemy hakkında',
    version: (v: string) => `Sürüm ${v}`,
    tagline: 'Döngünü takip etmenin sakin bir yolu. Takip et, anla, yönet.',
    privacy: 'Gizlilik politikası',
    terms: 'Kullanım koşulları',
    support: 'Destekle iletişime geç',
    notMedical: 'Nilemy tıbbi bir cihaz değildir. Seni endişelendiren her konuda bir doktorla konuş.',
  },
});

// G7 About Period.
export default function About() {
  const c = useCopy(COPY);
  return (
    <Page title={c.title} onBack={router.back}>
      <View style={[styles.card, styles.hero]}>
        <LogoMark size={64} />
        <Text style={[type('Headline', 'SemiBold'), { color: color['text/primary'] }]}>Nilemy</Text>
        <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.version(APP_VERSION)}</Text>
        <Text style={[type('Body/Medium'), styles.center, { color: color['text/secondary'] }]}>
          {c.tagline}
        </Text>
      </View>
      <View style={[styles.card, { overflow: 'hidden' }]}>
        <ListRow title={c.privacy} icon="shield" onPress={() => router.push('/about/privacy')} />
        <Divider inset={0} />
        <ListRow title={c.terms} icon="file-text" onPress={() => router.push('/about/terms')} />
        <Divider inset={0} />
        <ListRow title={c.support} subtitle={SUPPORT} icon="mail" onPress={() => Linking.openURL(`mailto:${SUPPORT}`).catch(() => {})} />
      </View>
      <Banner message={c.notMedical} />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, borderColor: color['border/subtle'], backgroundColor: color['surface/default'] },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 24, paddingHorizontal: 24 },
  center: { textAlign: 'center' },
});
