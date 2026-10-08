import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Privacy policy',
    toData: 'Go to Your data',
    updated: 'Last updated November 1, 2026',
    sections: [
      ['What we collect', 'Only what you log: period dates, flow, pain, mood, symptoms and notes. Nothing else.'],
      ['Where it lives', 'On this phone only. There’s no account or cloud backup, so nothing leaves your phone unless you export it.'],
      ['What we never do', 'We don’t sell your data, show ads or share logs with anyone.'],
      ['Your control', 'Export or delete everything at any time in Your data.'],
    ] as [string, string][],
  },
  tr: {
    title: 'Gizlilik politikası',
    toData: 'Verilerin sayfasına git',
    updated: 'Son güncelleme: 1 Kasım 2026',
    sections: [
      ['Ne topluyoruz', 'Yalnızca senin kaydettiklerini: adet tarihleri, akış, ağrı, ruh hali, belirtiler ve notlar. Başka hiçbir şey.'],
      ['Nerede duruyor', 'Yalnızca bu telefonda. Hesap ya da bulut yedeği yok; sen dışa aktarmadıkça hiçbir şey telefonundan çıkmaz.'],
      ['Asla yapmadıklarımız', 'Verilerini satmayız, reklam göstermeyiz ve kayıtlarını kimseyle paylaşmayız.'],
      ['Kontrol sende', 'Verilerin bölümünden istediğin zaman her şeyi dışa aktarabilir ya da silebilirsin.'],
    ],
  },
});

// G8 Privacy policy.
export default function Privacy() {
  const c = useCopy(COPY);
  return (
    <Page
      title={c.title}
      onBack={router.back}
      footer={<Button label={c.toData} type="Secondary" fullWidth onPress={() => router.push('/data')} />}
    >
      <Text style={[type('Body/Small'), { color: color['text/tertiary'] }]}>{c.updated}</Text>
      {c.sections.map(([title, body]) => (
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
