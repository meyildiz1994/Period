import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Page } from '../../components';
import { defineCopy, useCopy } from '../../i18n';
import { color, type } from '../../theme';

const COPY = defineCopy({
  en: {
    title: 'Privacy policy',
    toData: 'Go to Your data',
    updated: 'Last updated October 9, 2026',
    sections: [
      ['What we collect', 'Nothing. The app keeps only what you enter (period dates, flow, pain, mood, symptoms, notes and your name) and never sends it to us.'],
      ['Where it lives', 'On this phone only, encrypted. There’s no account or server, so nothing is sent anywhere unless you export it. If your phone’s iCloud or Google backup is on, the encrypted file can be included, but it only opens on this phone.'],
      ['What we never do', 'We don’t sell your data, show ads or share logs with anyone.'],
      ['Your control', 'Export or delete everything at any time in Your data.'],
      ['Full policy', 'Read the full policy at nilemy.com/privacy. Questions: niluferaktenyildiz@gmail.com'],
    ] as [string, string][],
  },
  tr: {
    title: 'Gizlilik politikası',
    toData: 'Verilerin sayfasına git',
    updated: 'Son güncelleme: 9 Ekim 2026',
    sections: [
      ['Ne topluyoruz', 'Hiçbir şey. Uygulama yalnızca senin girdiklerini (adet tarihleri, akış, ağrı, ruh hali, belirtiler, notlar ve adın) saklar ve bunları asla bize göndermez.'],
      ['Nerede duruyor', 'Yalnızca bu telefonda, şifreli olarak. Hesap ya da sunucu yok; sen dışa aktarmadıkça hiçbir şey bir yere gönderilmez. Telefonunun iCloud ya da Google yedeği açıksa şifreli dosya yedeğe dahil olabilir, ama yalnızca bu telefonda açılır.'],
      ['Asla yapmadıklarımız', 'Verilerini satmayız, reklam göstermeyiz ve kayıtlarını kimseyle paylaşmayız.'],
      ['Kontrol sende', 'Verilerin bölümünden istediğin zaman her şeyi dışa aktarabilir ya da silebilirsin.'],
      ['Politikanın tamamı', 'Politikanın tamamını nilemy.com/privacy adresinde okuyabilirsin. Soruların için: niluferaktenyildiz@gmail.com'],
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
